import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { Role } from '@prisma/client' //  Import de l'enum Role

dotenv.config()

//  On étend le type Request d'Express pour inclure une propriété user
export interface AuthenticatedRequest extends Request {
  user?: {
    id: number
    role: Role //  On utilise bien l'enum Role ici pour respecter le typage Prisma
  }
}

//  Middleware d'authentification JWT
export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization

  //  Vérifie la présence du header "Authorization: Bearer <token>"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token manquant ou invalide' })
  }

  const token = authHeader.split(' ')[1]

  try {
    //  Vérifie et décode le token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: number
      role: Role //  On force le type de role ici pour la compatibilité
    }

    //  Attache les infos utiles à la requête (pour les contrôleurs)
    req.user = {
      id: decoded.id,
      role: decoded.role
    }

    next()
  } catch (error) {
    return res.status(403).json({ message: 'Token invalide ou expiré' })
  }
}
