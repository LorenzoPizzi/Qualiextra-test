// Ce fichier permet d'ajouter des propriétés personnalisées à l'objet Request d'Express

declare global {
  namespace Express {
    // On ajoute une interface à Request pour inclure la propriété "user"
    interface Request {
      user?: { // "user" sera ajouté par le middleware d'authentification
        id: number // Identifiant de l'utilisateur
        role: Role // Rôle de l'utilisateur (ex: ADMIN, USER, etc.)
      }
    }
  }
}

// Nécessaire pour que TypeScript reconnaisse ce fichier comme un module
export {}