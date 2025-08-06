import { Controller, Get, Route, Tags, Security, Request } from 'tsoa'; // Importe les décorateurs et classes nécessaires
import { PrismaClient } from '@prisma/client'; // Importe Prisma pour accéder à la base de données
import { AuthenticatedRequest } from '../middlewares/authMiddleware'; // Importe le type de requête authentifiée

const prisma = new PrismaClient(); // Crée une instance de Prisma pour interagir avec la base de données

@Route('private') // Toutes les routes de ce contrôleur commencent par /private
@Tags('Private') // Groupe Swagger : "Private" (pour la documentation)
export class PrivateController extends Controller {
  /**
   * Route privée accessible uniquement aux utilisateurs connectés
   * GET /private
   * Renvoie un message personnalisé "Hello {prenom}"
   */
  @Security('jwt') // Cette route nécessite un token JWT pour être accessible
  @Get('/') // Définit une route GET sur '/private/'
  public async getPrivate(@Request() req: AuthenticatedRequest): Promise<{ message: string }> {
    const userId = req.user?.id; // Récupère l'id de l'utilisateur depuis le token

    if (!userId) { // Si l'utilisateur n'est pas authentifié
      this.setStatus(401); // Définit le code HTTP à 401 (Non autorisé)
      return { message: 'Utilisateur non authentifié' }; // Renvoie un message d'erreur
    }

    const user = await prisma.user.findUnique({ where: { id: userId } }); // Cherche l'utilisateur dans la base de données

    if (!user) { // Si l'utilisateur n'existe pas
      this.setStatus(404); // Définit le code HTTP à 404 (Non trouvé)
      return { message: 'Utilisateur non trouvé' }; // Renvoie un message d'erreur
    }

    return { message: `Hello ${user.prenom}` }; // Renvoie un message personnalisé avec le prénom de l'utilisateur
  }
}