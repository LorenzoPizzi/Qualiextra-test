import { Controller, Post, Route, Tags, Body } from 'tsoa' // Importe les décorateurs et classes nécessaires pour définir les routes
import { PrismaClient } from '@prisma/client' // Importe Prisma pour interagir avec la base de données
import bcrypt from 'bcrypt' // Importe bcrypt pour chiffrer les mots de passe
import jwt from 'jsonwebtoken' // Importe jsonwebtoken pour créer des tokens JWT
import dotenv from 'dotenv' // Importe dotenv pour gérer les variables d'environnement
import { isTempEmail } from '../utils/emailUtils' // Importe la fonction qui vérifie les emails temporaires
import { generateVerifyToken } from '../utils/tokenUtils' // Importe la fonction qui génère un token de vérification
import { sendVerificationEmail } from '../services/mailService' // Importe la fonction qui envoie l'email de vérification

dotenv.config() // Charge les variables d'environnement depuis le fichier .env

const prisma = new PrismaClient() // Crée une instance de Prisma pour accéder à la base de données

interface RegisterBody {
  nom: string // Nom de l'utilisateur
  prenom: string // Prénom de l'utilisateur
  email: string // Email de l'utilisateur
  password: string // Mot de passe de l'utilisateur
}

interface LoginBody {
  email: string // Email pour la connexion
  password: string // Mot de passe pour la connexion
}

@Route('auth') // Toutes les routes de ce contrôleur commencent par /auth
@Tags('Auth') // Groupe Swagger : "Auth" (pour la documentation)
export class AuthController extends Controller {
  /**
   * Inscription d'un nouvel utilisateur
   */
  @Post('/register')
  public async register(@Body() body: RegisterBody): Promise<{ message: string }> {
    // Vérifie si l'email est temporaire
    if (isTempEmail(body.email)) {
      this.setStatus(400)
      return { message: 'Les adresses email temporaires ne sont pas autorisées.' }
    }

    // Vérifie si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email }
    })

    if (existingUser) {
      this.setStatus(400)
      return { message: 'Utilisateur déjà existant' }
    }

    // Chiffre le mot de passe
    const hashedPassword = await bcrypt.hash(body.password, 10)
    // Génère un token de vérification d'email
    const verifyToken = generateVerifyToken()

    // Crée le nouvel utilisateur dans la base de données
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

    // Envoie l'email de vérification à l'utilisateur
    await sendVerificationEmail(body.email, verifyToken)

    return { message: 'Inscription réussie. Vérifiez votre adresse mail.' }
  }

  /**
   * Vérifie un email via un token envoyé par email
   * Appelée après clic sur lien de vérification
   */
  @Post('/verify-email')
  public async verifyEmail(@Body() body: { token: string }): Promise<{ message: string }> {
    const { token } = body

    // Vérifie que le token est présent
    if (!token) {
      this.setStatus(400)
      return { message: 'Token manquant' }
    }

    // Cherche l'utilisateur correspondant au token
    const user = await prisma.user.findFirst({
      where: { verifyToken: token }
    })

    if (!user) {
      this.setStatus(404)
      return { message: 'Token invalide ou expiré' }
    }

    // Met à jour l'utilisateur : email vérifié et token supprimé
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
   * Connexion utilisateur (email + mot de passe)
   * Nécessite un email vérifié
   */
  @Post('/login')
  public async login(@Body() body: LoginBody): Promise<{ token: string }> {
    // Cherche l'utilisateur par son email
    const user = await prisma.user.findUnique({
      where: { email: body.email }
    })

    if (!user) {
      this.setStatus(401)
      throw new Error('Email ou mot de passe invalide')
    }

    // Vérifie que l'email est bien vérifié
    if (!user.emailVerified) {
      this.setStatus(403)
      throw new Error('Veuillez d\'abord vérifier votre adresse email')
    }

    // Vérifie que le mot de passe est correct
    const isPasswordValid = await bcrypt.compare(body.password, user.password)

    if (!isPasswordValid) {
      this.setStatus(401)
      throw new Error('Email ou mot de passe invalide')
    }

    // Crée un token JWT avec les infos de l'utilisateur
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' } // Le token expire dans 1 jour
    )

    return { token }
  }
}