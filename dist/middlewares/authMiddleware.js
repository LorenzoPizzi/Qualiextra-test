"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
//  Middleware d'authentification JWT
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    //  Vérifie la présence du header "Authorization: Bearer <token>"
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token manquant ou invalide' });
    }
    const token = authHeader.split(' ')[1];
    try {
        //  Vérifie et décode le token JWT
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        //  Attache les infos utiles à la requête (pour les contrôleurs)
        req.user = {
            id: decoded.id,
            role: decoded.role
        };
        next();
    }
    catch (error) {
        return res.status(403).json({ message: 'Token invalide ou expiré' });
    }
};
exports.authMiddleware = authMiddleware;
