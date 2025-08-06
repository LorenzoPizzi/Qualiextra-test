import { Controller, Post, Route, Tags, Body, Get, Query } from 'tsoa'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { isTempEmail } from '../utils/emailUtils'
import { generateVerifyToken } from '../utils/tokenUtils'
import { sendVerificationEmail } from '../services/mailService'

dotenv.config()

const prisma = new PrismaClient()

interface RegisterBody {
  nom: string
  prenom: string
  email: string
  password: string
}

interface LoginBody {
  email: string
  password: string
}

@Route('auth')
@Tags('Auth')
export class AuthController extends Controller {
  /**
   * Inscription d'un nouvel utilisateur
   */
  @Post('/register')
  public async register(@Body() body: RegisterBody): Promise<{ message: string }> {
    if (isTempEmail(body.email)) {
      this.setStatus(400)
      return { message: 'Les adresses email temporaires ne sont pas autorisées.' }
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: body.email }
    })

    if (existingUser) {
      this.setStatus(400)
      return { message: 'Utilisateur déjà existant' }
    }

    const hashedPassword = await bcrypt.hash(body.password, 10)
    const verifyToken = generateVerifyToken()

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

    await sendVerificationEmail(body.email, verifyToken)

    return { message: 'Inscription réussie. Vérifiez votre adresse mail.' }
  }

  /**
   * Vérifie un email via un token transmis dans l'URL
   * Redirige vers /docs ou page d'erreur
   */
  @Get('/verify-email')
  public async verifyEmail(@Query() token: string): Promise<void> {
    const baseUrl = process.env.FRONTEND_URL || 'https://test-qualiextra.onrender.com'

    if (!token) {
      this.setStatus(302)
      this.setHeader('Location', `${baseUrl}/error`)
      return
    }

    const user = await prisma.user.findFirst({ where: { verifyToken: token } })

    if (!user) {
      this.setStatus(302)
      this.setHeader('Location', `${baseUrl}/error`)
      return
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verifyToken: null
      }
    })

    this.setStatus(302)
    this.setHeader('Location', `${baseUrl}/docs`)
  }

  /**
   * Connexion utilisateur (email + mot de passe)
   */
  @Post('/login')
  public async login(@Body() body: LoginBody): Promise<{ token: string }> {
    const user = await prisma.user.findUnique({
      where: { email: body.email }
    })

    if (!user) {
      this.setStatus(401)
      throw new Error('Email ou mot de passe invalide')
    }

    if (!user.emailVerified) {
      this.setStatus(403)
      throw new Error('Veuillez d\'abord vérifier votre adresse email')
    }

    const isPasswordValid = await bcrypt.compare(body.password, user.password)

    if (!isPasswordValid) {
      this.setStatus(401)
      throw new Error('Email ou mot de passe invalide')
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' }
    )

    return { token }
  }
}
