import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

// On étend le type Request pour pouvoir y ajouter une propriété `user`
interface AuthenticatedRequest extends Request {
  user?: {
    id: number
    email: string
    role: string
  }
}

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  //  Récupère le token dans le header Authorization: Bearer <token>
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token manquant ou invalide' })
  }

  const token = authHeader.split(' ')[1]

  try {
    //  Vérifie et décode le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: number
      email: string
      role: string
    }

    //  On attache les infos du user décodé à la requête
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    }

    //  Passe au handler suivant
    next()
  } catch (error) {
    return res.status(403).json({ message: 'Token invalide' })
  }
}
