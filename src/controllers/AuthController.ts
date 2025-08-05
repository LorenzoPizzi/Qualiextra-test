import { Controller, Post, Route, Tags, Body, Get, Query } from 'tsoa'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'                       // Pour hasher les mots de passe
import jwt from 'jsonwebtoken'                    // Pour générer les tokens JWT
import dotenv from 'dotenv'                       // Pour charger les variables d'environnement
import { isTempEmail } from '../utils/emailUtils' // Vérifie si un email est temporaire
import { generateVerifyToken } from '../utils/tokenUtils' // Génère un token de vérification unique
import { sendVerificationEmail } from '../services/mailService' // Envoie un email via Mailtrap

dotenv.config()
const prisma = new PrismaClient() // Initialise le client Prisma pour accéder à la base de données

// Corps attendu pour la création d'un compte
interface RegisterBody {
  nom: string
  prenom: string
  email: string
  password: string
}

// Corps attendu pour la connexion
interface LoginBody {
  email: string
  password: string
}

@Route('auth') // Préfixe commun à toutes les routes ici : /auth
@Tags('Auth')  // Groupe Swagger "Auth"
export class AuthController extends Controller {

  //POST /auth/register
// Inscription utilisateur + envoi d'un mail de vérification
   
  @Post('/register')
  public async register(@Body() body: RegisterBody): Promise<{ message: string }> {
    // Refuse les emails jetables
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

    // Hash du mot de passe avant sauvegarde
    const hashedPassword = await bcrypt.hash(body.password, 10)
    // Génère un token pour la vérification email
    const verifyToken = generateVerifyToken()

    // Crée l'utilisateur en base de données
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

    // Envoie le lien de vérification par email
    await sendVerificationEmail(body.email, verifyToken)

    return { message: 'Inscription réussie. Vérifiez votre adresse mail.' }
  }

  
    //GET /auth/verify-email?token=xxx
    //Valide un token de vérification d'email et active le compte
   
  @Get('/verify-email')
  public async verifyEmail(@Query() token: string): Promise<{ message: string }> {
    // Vérifie que le token est présent
    if (!token) {
      this.setStatus(400)
      return { message: 'Token manquant' }
    }

    // Cherche l'utilisateur avec ce token
    const user = await prisma.user.findFirst({
      where: { verifyToken: token }
    })

    if (!user) {
      this.setStatus(404)
      return { message: 'Token invalide ou expiré' }
    }

    // Marque l'utilisateur comme vérifié
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verifyToken: null
      }
    })

    return { message: 'Email vérifié avec succès ✅' }
  }

  
    //POST /auth/login
    //Authentifie un utilisateur existant (avec email vérifié)
    //et renvoie un JWT à utiliser pour les routes protégées
   
  @Post('/login')
  public async login(@Body() body: LoginBody): Promise<{ token: string }> {
    // Recherche l'utilisateur via son email
    const user = await prisma.user.findUnique({
      where: { email: body.email }
    })

    if (!user) {
      this.setStatus(401)
      throw new Error('Email ou mot de passe invalide')
    }

    // Empêche la connexion si email non vérifié
    if (!user.emailVerified) {
      this.setStatus(403)
      throw new Error('Veuillez d\'abord vérifier votre adresse email')
    }

    // Compare les mots de passe
    const isPasswordValid = await bcrypt.compare(body.password, user.password)

    if (!isPasswordValid) {
      this.setStatus(401)
      throw new Error('Email ou mot de passe invalide')
    }

    // Génère un token JWT signé avec l'ID et le rôle
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: '1d' // Token valide 1 jour
      }
    )

    return { token }
  }
}
