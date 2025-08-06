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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const tsoa_1 = require("tsoa");
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const emailUtils_1 = require("../utils/emailUtils");
const tokenUtils_1 = require("../utils/tokenUtils");
const mailService_1 = require("../services/mailService");
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
let AuthController = class AuthController extends tsoa_1.Controller {
    /**
     * Inscription d'un nouvel utilisateur
     */
    async register(body) {
        if ((0, emailUtils_1.isTempEmail)(body.email)) {
            this.setStatus(400);
            return { message: 'Les adresses email temporaires ne sont pas autorisées.' };
        }
        const existingUser = await prisma.user.findUnique({
            where: { email: body.email }
        });
        if (existingUser) {
            this.setStatus(400);
            return { message: 'Utilisateur déjà existant' };
        }
        const hashedPassword = await bcrypt_1.default.hash(body.password, 10);
        const verifyToken = (0, tokenUtils_1.generateVerifyToken)();
        await prisma.user.create({
            data: {
                nom: body.nom,
                prenom: body.prenom,
                email: body.email,
                password: hashedPassword,
                verifyToken,
                emailVerified: false
            }
        });
        await (0, mailService_1.sendVerificationEmail)(body.email, verifyToken);
        return { message: 'Inscription réussie. Vérifiez votre adresse mail.' };
    }
    /**
     * Vérifie un email via un lien reçu par email (GET avec token en query param)
     */
    async verifyEmail(token) {
        const baseUrl = process.env.FRONTEND_URL || 'https://test-qualiextra.onrender.com';
        if (!token) {
            this.setStatus(302);
            this.setHeader('Location', `${baseUrl}/error`);
            return;
        }
        const user = await prisma.user.findFirst({ where: { verifyToken: token } });
        if (!user) {
            this.setStatus(302);
            this.setHeader('Location', `${baseUrl}/error`);
            return;
        }
        await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: true,
                verifyToken: null
            }
        });
        this.setStatus(302);
        this.setHeader('Location', `${baseUrl}/docs`);
    }
    /**
     * Connexion utilisateur (email + mot de passe)
     */
    async login(body) {
        const user = await prisma.user.findUnique({
            where: { email: body.email }
        });
        if (!user) {
            this.setStatus(401);
            throw new Error('Email ou mot de passe invalide');
        }
        if (!user.emailVerified) {
            this.setStatus(403);
            throw new Error('Veuillez d\'abord vérifier votre adresse email');
        }
        const isPasswordValid = await bcrypt_1.default.compare(body.password, user.password);
        if (!isPasswordValid) {
            this.setStatus(401);
            throw new Error('Email ou mot de passe invalide');
        }
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            email: user.email,
            role: user.role
        }, process.env.JWT_SECRET, { expiresIn: '1d' });
        return { token };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, tsoa_1.Post)('/register'),
    __param(0, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, tsoa_1.Get)('/verify-email'),
    __param(0, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyEmail", null);
__decorate([
    (0, tsoa_1.Post)('/login'),
    __param(0, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
exports.AuthController = AuthController = __decorate([
    (0, tsoa_1.Route)('auth'),
    (0, tsoa_1.Tags)('Auth')
], AuthController);
