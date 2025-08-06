"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.expressAuthentication = expressAuthentication;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken")); // Importe la librairie pour gérer les tokens JWT
const dotenv_1 = __importDefault(require("dotenv")); // Importe dotenv pour charger les variables d'environnement
dotenv_1.default.config(); // Charge les variables d'environnement depuis le fichier .env
// Fonction d'authentification utilisée par Express
async function expressAuthentication(request, // La requête HTTP reçue
securityName, // Le nom du type de sécurité (ex: 'jwt')
scopes // Les permissions requises 
) {
    // Vérifie si le type de sécurité demandé est 'jwt'
    if (securityName === 'jwt') {
        const authHeader = request.headers.authorization; // Récupère le header d'autorisation
        // Vérifie si le header existe et commence par 'Bearer '
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw {
                status: 401,
                message: 'Token manquant ou invalide', // Message d'erreur
            };
        }
        // Récupère le token en retirant 'Bearer ' du header
        const token = authHeader.replace('Bearer ', '');
        try {
            // Vérifie et décode le token avec la clé secrète
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            return decoded; // Retourne les infos du token si tout est OK
        }
        catch (err) {
            // Si le token est invalide ou expiré, renvoie une erreur
            throw {
                status: 401,
                message: 'Token invalide ou expiré',
            };
        }
    }
    // Si le type de sécurité n'est pas géré, renvoie une erreur
    throw {
        status: 401,
        message: 'Méthode d\'authentification non prise en charge',
    };
}
