"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const tsoa_1 = require("tsoa"); // Importe les décorateurs et classes nécessaires pour définir les routes et sécuriser l'API
const client_1 = require("@prisma/client"); // Importe Prisma pour interagir avec la base de données
const prisma = new client_1.PrismaClient(); // Crée une instance de Prisma pour accéder à la base de données
let UserController = class UserController extends tsoa_1.Controller {
    // Récupère tous les utilisateurs (Admin uniquement)
    async getAllUsers(req) {
        // Vérifie si l'utilisateur est admin
        if (req.user?.role !== 'ADMIN') {
            this.setStatus(403); // Définit le code HTTP à 403 (Accès interdit)
            return { message: 'Accès interdit : admin uniquement.' };
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
        });
    }
    // Récupère un utilisateur spécifique (admin ou soi-même)
    async getUser(req, userId) {
        const targetUser = await prisma.user.findUnique({ where: { id: userId } }); // Cherche l'utilisateur par son id
        if (!targetUser) { // Si l'utilisateur n'existe pas
            this.setStatus(404);
            return { message: 'Utilisateur introuvable' };
        }
        // Seul l'admin ou l'utilisateur lui-même peut accéder à ses infos
        if (req.user?.role !== 'ADMIN' && req.user?.id !== userId) {
            this.setStatus(403);
            return { message: 'Accès interdit' };
        }
        return targetUser; // Retourne l'utilisateur trouvé
    }
    // Met à jour un utilisateur (admin ou soi-même)
    async updateUser(req, userId, body) {
        const existingUser = await prisma.user.findUnique({ where: { id: userId } }); // Cherche l'utilisateur à modifier
        if (!existingUser) { // Si l'utilisateur n'existe pas
            this.setStatus(404);
            return { message: 'Utilisateur introuvable' };
        }
        // Seul l'admin ou l'utilisateur lui-même peut modifier ses infos
        if (req.user?.role !== 'ADMIN' && req.user?.id !== userId) {
            this.setStatus(403);
            return { message: 'Accès interdit' };
        }
        // Met à jour l'utilisateur avec les nouvelles données
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: body,
        });
        return updatedUser; // Retourne l'utilisateur mis à jour
    }
    // Supprime un utilisateur (Admin uniquement)
    async deleteUser(req, userId) {
        // Seul l'admin peut supprimer un utilisateur
        if (req.user?.role !== 'ADMIN') {
            this.setStatus(403);
            return { message: 'Accès interdit : admin uniquement.' };
        }
        await prisma.user.delete({ where: { id: userId } }); // Supprime l'utilisateur
        return { message: 'Utilisateur supprimé' };
    }
    // Met à jour le profil de l’utilisateur connecté (sans passer d’id)
    async updateMyProfile(req, body) {
        const userId = req.user?.id; // Récupère l'id de l'utilisateur connecté
        if (!userId) { // Si l'utilisateur n'est pas authentifié
            this.setStatus(401);
            return { message: 'Utilisateur non authentifié' };
        }
        const existingUser = await prisma.user.findUnique({ where: { id: userId } }); // Cherche l'utilisateur
        if (!existingUser) { // Si l'utilisateur n'existe pas
            this.setStatus(404);
            return { message: 'Utilisateur introuvable' };
        }
        // Met à jour le profil de l'utilisateur connecté
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: body,
        });
        return updatedUser; // Retourne le profil mis à jour
    }
    // Récupère le profil de l’utilisateur connecté
    async getMyProfile(req) {
        const userId = req.user?.id; // Récupère l'id de l'utilisateur connecté
        if (!userId) { // Si l'utilisateur n'est pas authentifié
            this.setStatus(401);
            return { message: 'Utilisateur non authentifié' };
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
        });
        if (!user) { // Si l'utilisateur n'existe pas
            this.setStatus(404);
            return { message: 'Utilisateur introuvable' };
        }
        return user; // Retourne le profil de l'utilisateur connecté
    }
};
exports.UserController = UserController;
__decorate([
    (0, tsoa_1.Security)('jwt') // Cette route nécessite un token JWT
    ,
    (0, tsoa_1.Get)('/'),
    __param(0, (0, tsoa_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getAllUsers", null);
__decorate([
    (0, tsoa_1.Security)('jwt'),
    (0, tsoa_1.Get)('{userId}'),
    __param(0, (0, tsoa_1.Request)()),
    __param(1, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUser", null);
__decorate([
    (0, tsoa_1.Security)('jwt'),
    (0, tsoa_1.Put)('{userId}'),
    __param(0, (0, tsoa_1.Request)()),
    __param(1, (0, tsoa_1.Path)()),
    __param(2, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateUser", null);
__decorate([
    (0, tsoa_1.Security)('jwt'),
    (0, tsoa_1.Delete)('{userId}'),
    __param(0, (0, tsoa_1.Request)()),
    __param(1, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "deleteUser", null);
__decorate([
    (0, tsoa_1.Security)('jwt'),
    (0, tsoa_1.Put)('profile'),
    __param(0, (0, tsoa_1.Request)()),
    __param(1, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateMyProfile", null);
__decorate([
    (0, tsoa_1.Security)('jwt'),
    (0, tsoa_1.Get)('profile'),
    __param(0, (0, tsoa_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getMyProfile", null);
exports.UserController = UserController = __decorate([
    (0, tsoa_1.Route)('users') // Toutes les routes de ce contrôleur commencent par /users
    ,
    (0, tsoa_1.Tags)('Users') // Groupe Swagger : "Users" (pour la documentation)
], UserController);
