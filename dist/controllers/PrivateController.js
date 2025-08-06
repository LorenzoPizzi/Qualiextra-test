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
exports.PrivateController = void 0;
const tsoa_1 = require("tsoa"); // Importe les décorateurs et classes nécessaires
const client_1 = require("@prisma/client"); // Importe Prisma pour accéder à la base de données
const prisma = new client_1.PrismaClient(); // Crée une instance de Prisma pour interagir avec la base de données
let PrivateController = class PrivateController extends tsoa_1.Controller {
    /**
     * Route privée accessible uniquement aux utilisateurs connectés
     * GET /private
     * Renvoie un message personnalisé "Hello {prenom}"
     */
    async getPrivate(req) {
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
};
exports.PrivateController = PrivateController;
__decorate([
    (0, tsoa_1.Security)('jwt') // Cette route nécessite un token JWT pour être accessible
    ,
    (0, tsoa_1.Get)('/') // Définit une route GET sur '/private/'
    ,
    __param(0, (0, tsoa_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PrivateController.prototype, "getPrivate", null);
exports.PrivateController = PrivateController = __decorate([
    (0, tsoa_1.Route)('private') // Toutes les routes de ce contrôleur commencent par /private
    ,
    (0, tsoa_1.Tags)('Private') // Groupe Swagger : "Private" (pour la documentation)
], PrivateController);
