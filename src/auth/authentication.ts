
import { Request } from 'express'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

export async function expressAuthentication(
  request: Request,
  securityName: string,
  scopes?: string[]
): Promise<any> {
  if (securityName === 'jwt') {
    const authHeader = request.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw {
        status: 401,
        message: 'Token manquant ou invalide',
      }
    }

    const token = authHeader.replace('Bearer ', '')
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!)
      return decoded
    } catch (err) {
      throw {
        status: 401,
        message: 'Token invalide ou expiré',
      }
    }
  }

  throw {
    status: 401,
    message: 'Méthode d\'authentification non prise en charge',
  }
}
