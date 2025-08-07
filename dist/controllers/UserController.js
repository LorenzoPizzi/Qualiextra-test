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
const tsoa_1 = require("tsoa");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
let UserController = class UserController extends tsoa_1.Controller {
    // ✅ Récupère tous les utilisateurs (Admin uniquement)
    async getAllUsers(req) {
        if (req.user?.role !== 'ADMIN') {
            this.setStatus(403);
            return { message: 'Accès interdit : admin uniquement.' };
        }
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
    // ✅ Récupère un utilisateur spécifique (Admin ou soi-même)
    async getUser(req, userId) {
        const targetUser = await prisma.user.findUnique({ where: { id: userId } });
        if (!targetUser) {
            this.setStatus(404);
            return { message: 'Utilisateur introuvable' };
        }
        if (req.user?.role !== 'ADMIN' && req.user?.id !== userId) {
            this.setStatus(403);
            return { message: 'Accès interdit' };
        }
        return targetUser;
    }
    // ✅ Récupère le profil de l’utilisateur connecté
    async getMyProfile(req) {
        const userId = req.user?.id;
        if (!userId) {
            this.setStatus(401);
            return { message: 'Utilisateur non authentifié' };
        }
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
        if (!user) {
            this.setStatus(404);
            return { message: 'Utilisateur introuvable' };
        }
        return user;
    }
    // ✅ Met à jour le profil de l’utilisateur connecté
    async updateMyProfile(req, body) {
        const userId = req.user?.id;
        if (!userId) {
            this.setStatus(401);
            return { message: 'Utilisateur non authentifié' };
        }
        const existingUser = await prisma.user.findUnique({ where: { id: userId } });
        if (!existingUser) {
            this.setStatus(404);
            return { message: 'Utilisateur introuvable' };
        }
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: body,
            select: {
                id: true,
                nom: true,
                prenom: true,
                email: true,
                role: true,
                emailVerified: true,
            },
        });
        return updatedUser;
    }
    // ✅ Met à jour un utilisateur (Admin ou soi-même)
    async updateUser(req, userId, body) {
        const existingUser = await prisma.user.findUnique({ where: { id: userId } });
        if (!existingUser) {
            this.setStatus(404);
            return { message: 'Utilisateur introuvable' };
        }
        if (req.user?.role !== 'ADMIN' && req.user?.id !== userId) {
            this.setStatus(403);
            return { message: 'Accès interdit' };
        }
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: body,
        });
        return updatedUser;
    }
    // ✅ Supprime un utilisateur (Admin uniquement)
    async deleteUser(req, userId) {
        if (req.user?.role !== 'ADMIN') {
            this.setStatus(403);
            return { message: 'Accès interdit : admin uniquement.' };
        }
        await prisma.user.delete({ where: { id: userId } });
        return { message: 'Utilisateur supprimé' };
    }
};
exports.UserController = UserController;
__decorate([
    (0, tsoa_1.Security)('jwt'),
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
    (0, tsoa_1.Get)('profile'),
    __param(0, (0, tsoa_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getMyProfile", null);
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
exports.UserController = UserController = __decorate([
    (0, tsoa_1.Route)('users'),
    (0, tsoa_1.Tags)('Users')
], UserController);
