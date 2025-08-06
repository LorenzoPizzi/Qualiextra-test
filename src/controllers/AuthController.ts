import { Controller, Post, Route, Tags, Body, Get, Query } from 'tsoa'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'                       // Pour hasher (chiffrer) les mots de passe
import jwt from 'jsonwebtoken'                    // Pour générer des jetons d'authentification (JWT)
import dotenv from 'dotenv'                       // Pour lire les variables d'environnement (.env)
import { isTempEmail } from '../utils/emailUtils' // Fonction qui détecte si un email est temporaire
import { generateVerifyToken } from '../utils/tokenUtils' // Génère un token de vérification unique
import { sendVerificationEmail } from '../services/mailService' // Envoie un mail de vérification via Mailtrap

dotenv.config() // Charge les variables d’environnement dans process.env

const prisma = new PrismaClient() // Initialise Prisma (connexion à la BDD)

// Ce que doit contenir le corps d'une requête POST /register
interface RegisterBody {
  nom: string
  prenom: string
  email: string
  password: string
}

// Ce que doit contenir le corps d'une requête POST /login
interface LoginBody {
  email: string
  password: string
}

// Groupe Swagger "Auth" avec préfixe /auth
@Route('auth')
@Tags('Auth')
export class AuthController extends Controller {

  /**
   * Route d'inscription d'un nouvel utilisateur
   * @param body : données envoyées par le front (nom, prénom, email, mdp)
   * @returns un message demandant à vérifier l’adresse mail
   */
  @Post('/register')
  public async register(@Body() body: RegisterBody): Promise<{ message: string }> {
    //  Si l'email est temporaire (ex : @mailinator.com), on refuse l'inscription
    if (isTempEmail(body.email)) {
      this.setStatus(400)
      return { message: 'Les adresses email temporaires ne sont pas autorisées.' }
    }

    //  Vérifie si un utilisateur existe déjà avec cet email
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email }
    })

    if (existingUser) {
      this.setStatus(400)
      return { message: 'Utilisateur déjà existant' }
    }

    //  Hash du mot de passe avec bcrypt avant de l'enregistrer
    const hashedPassword = await bcrypt.hash(body.password, 10)

    //  Création d’un token de vérification aléatoire
    const verifyToken = generateVerifyToken()

    //  Sauvegarde du nouvel utilisateur dans la BDD avec email non vérifié
    await prisma.user.create({
      data: {
        nom: body.nom,
        prenom: body.prenom,
        email: body.email,
        password: hashedPassword,
        verifyToken,
        emailVerified: false
      }
    })

    //  Envoie un mail à l’utilisateur avec le lien contenant le token
    await sendVerificationEmail(body.email, verifyToken)

    return { message: 'Inscription réussie. Vérifiez votre adresse mail.' }
  }

  /**
   * Vérifie un email grâce à un token transmis dans l'URL
   * @param token : Token envoyé par email à l’utilisateur
   * @returns un message si l’adresse est bien vérifiée
   */
  @Get('/verify-email')
  public async verifyEmail(@Query() token: string): Promise<{ message: string }> {
    //  Si aucun token n’est fourni, on bloque la vérification
    if (!token) {
      this.setStatus(400)
      return { message: 'Token manquant' }
    }

    //  Recherche de l’utilisateur ayant ce token
    const user = await prisma.user.findFirst({
      where: { verifyToken: token }
    })

    if (!user) {
      this.setStatus(404)
      return { message: 'Token invalide ou expiré' }
    }

    //  Mise à jour du champ emailVerified et suppression du token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verifyToken: null
      }
    })

    return { message: 'Email vérifié avec succès ✅' }
  }

  /**
   * Connecte un utilisateur si email vérifié et mot de passe correct
   * @param body : email + mot de passe
   * @returns un token JWT (à utiliser pour les routes sécurisées)
   */
  @Post('/login')
  public async login(@Body() body: LoginBody): Promise<{ token: string }> {
    //  Recherche de l’utilisateur via son email
    const user = await prisma.user.findUnique({
      where: { email: body.email }
    })

    //  Email inconnu
    if (!user) {
      this.setStatus(401)
      throw new Error('Email ou mot de passe invalide')
    }

    //  L'utilisateur n’a pas encore validé son email
    if (!user.emailVerified) {
      this.setStatus(403)
      throw new Error('Veuillez d\'abord vérifier votre adresse email')
    }

    //  Vérifie que le mot de passe est correct
    const isPasswordValid = await bcrypt.compare(body.password, user.password)

    if (!isPasswordValid) {
      this.setStatus(401)
      throw new Error('Email ou mot de passe invalide')
    }

    //  Création d’un token JWT contenant l’id, l’email et le rôle
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: '1d' // Le token expire dans 24h
      }
    )

    return { token }
  }
}
