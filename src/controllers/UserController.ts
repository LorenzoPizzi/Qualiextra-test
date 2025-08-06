import {
  Controller,
  Get,
  Route,
  Tags,
  Security,
  Path,
  Request,
  Put,
  Body,
  Delete,
} from 'tsoa' // Importe les décorateurs et classes nécessaires pour définir les routes et sécuriser l'API
import { PrismaClient } from '@prisma/client' // Importe Prisma pour interagir avec la base de données
import { AuthenticatedRequest } from '../middlewares/authMiddleware' // Importe le type de requête authentifiée

const prisma = new PrismaClient() // Crée une instance de Prisma pour accéder à la base de données

@Route('users') // Toutes les routes de ce contrôleur commencent par /users
@Tags('Users') // Groupe Swagger : "Users" (pour la documentation)
export class UserController extends Controller {
  // Récupère tous les utilisateurs (Admin uniquement)
  @Security('jwt') // Cette route nécessite un token JWT
  @Get('/')
  public async getAllUsers(@Request() req: AuthenticatedRequest) {
    // Vérifie si l'utilisateur est admin
    if (req.user?.role !== 'ADMIN') {
      this.setStatus(403) // Définit le code HTTP à 403 (Accès interdit)
      return { message: 'Accès interdit : admin uniquement.' }
    }

    // Retourne la liste des utilisateurs avec certains champs
    return prisma.user.findMany({
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        role: true,
        emailVerified: true,
      },
    })
  }

  // Récupère un utilisateur spécifique (admin ou soi-même)
  @Security('jwt')
  @Get('{userId}')
  public async getUser(
    @Request() req: AuthenticatedRequest,
    @Path() userId: number
  ) {
    const targetUser = await prisma.user.findUnique({ where: { id: userId } }) // Cherche l'utilisateur par son id

    if (!targetUser) { // Si l'utilisateur n'existe pas
      this.setStatus(404)
      return { message: 'Utilisateur introuvable' }
    }

    // Seul l'admin ou l'utilisateur lui-même peut accéder à ses infos
    if (req.user?.role !== 'ADMIN' && req.user?.id !== userId) {
      this.setStatus(403)
      return { message: 'Accès interdit' }
    }

    return targetUser // Retourne l'utilisateur trouvé
  }

  // Met à jour un utilisateur (admin ou soi-même)
  @Security('jwt')
  @Put('{userId}')
  public async updateUser(
    @Request() req: AuthenticatedRequest,
    @Path() userId: number,
    @Body() body: Partial<{ nom: string; prenom: string; password: string }>
  ) {
    const existingUser = await prisma.user.findUnique({ where: { id: userId } }) // Cherche l'utilisateur à modifier

    if (!existingUser) { // Si l'utilisateur n'existe pas
      this.setStatus(404)
      return { message: 'Utilisateur introuvable' }
    }

    // Seul l'admin ou l'utilisateur lui-même peut modifier ses infos
    if (req.user?.role !== 'ADMIN' && req.user?.id !== userId) {
      this.setStatus(403)
      return { message: 'Accès interdit' }
    }

    // Met à jour l'utilisateur avec les nouvelles données
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: body,
    })

    return updatedUser // Retourne l'utilisateur mis à jour
  }

  // Supprime un utilisateur (Admin uniquement)
  @Security('jwt')
  @Delete('{userId}')
  public async deleteUser(
    @Request() req: AuthenticatedRequest,
    @Path() userId: number
  ) {
    // Seul l'admin peut supprimer un utilisateur
    if (req.user?.role !== 'ADMIN') {
      this.setStatus(403)
      return { message: 'Accès interdit : admin uniquement.' }
    }

    await prisma.user.delete({ where: { id: userId } }) // Supprime l'utilisateur
    return { message: 'Utilisateur supprimé' }
  }

  // Met à jour le profil de l’utilisateur connecté (sans passer d’id)
  @Security('jwt')
  @Put('profile')
  public async updateMyProfile(
    @Request() req: AuthenticatedRequest,
    @Body() body: Partial<{ nom: string; prenom: string; password: string }>
  ) {
    const userId = req.user?.id // Récupère l'id de l'utilisateur connecté

    if (!userId) { // Si l'utilisateur n'est pas authentifié
      this.setStatus(401)
      return { message: 'Utilisateur non authentifié' }
    }

    const existingUser = await prisma.user.findUnique({ where: { id: userId } }) // Cherche l'utilisateur

    if (!existingUser) { // Si l'utilisateur n'existe pas
      this.setStatus(404)
      return { message: 'Utilisateur introuvable' }
    }

    // Met à jour le profil de l'utilisateur connecté
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: body,
    })

    return updatedUser // Retourne le profil mis à jour
  }

  // Récupère le profil de l’utilisateur connecté
  @Security('jwt')
  @Get('profile')
  public async getMyProfile(@Request() req: AuthenticatedRequest) {
    const userId = req.user?.id // Récupère l'id de l'utilisateur connecté

    if (!userId) { // Si l'utilisateur n'est pas authentifié
      this.setStatus(401)
      return { message: 'Utilisateur non authentifié' }
    }

    // Cherche l'utilisateur et sélectionne certains champs
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        role: true,
        emailVerified: true,
      },
    })

    if (!user) { // Si l'utilisateur n'existe pas
      this.setStatus(404)
      return { message: 'Utilisateur introuvable' }
    }

    return user // Retourne le profil de l'utilisateur connecté
  }
}