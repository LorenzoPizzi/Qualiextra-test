import { Request } from 'express' // Importe le type Request d'Express pour typer la requête
import jwt from 'jsonwebtoken' // Importe la librairie pour gérer les tokens JWT
import dotenv from 'dotenv' // Importe dotenv pour charger les variables d'environnement
dotenv.config() // Charge les variables d'environnement depuis le fichier .env

// Fonction d'authentification utilisée par Express
export async function expressAuthentication(
  request: Request, // La requête HTTP reçue
  securityName: string, // Le nom du type de sécurité (ex: 'jwt')
  scopes?: string[] // Les permissions requises 
): Promise<any> {
  // Vérifie si le type de sécurité demandé est 'jwt'
  if (securityName === 'jwt') {
    const authHeader = request.headers.authorization // Récupère le header d'autorisation

    // Vérifie si le header existe et commence par 'Bearer '
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw {
        status: 401, 
        message: 'Token manquant ou invalide', // Message d'erreur
      }
    }

    // Récupère le token en retirant 'Bearer ' du header
    const token = authHeader.replace('Bearer ', '')
    try {
      // Vérifie et décode le token avec la clé secrète
      const decoded = jwt.verify(token, process.env.JWT_SECRET!)
      return decoded // Retourne les infos du token si tout est OK
    } catch (err) {
      // Si le token est invalide ou expiré, renvoie une erreur
      throw {
        status: 401,
        message: 'Token invalide ou expiré',
      }
    }
  }

  // Si le type de sécurité n'est pas géré, renvoie une erreur
  throw {
    status: 401,
    message: 'Méthode d\'authentification non prise en charge',
  }
}
