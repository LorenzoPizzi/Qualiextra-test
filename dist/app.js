"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express")); // Importe le framework Express pour créer le serveur web
const routes_1 = require("./routes/routes"); // Importe la fonction qui enregistre les routes générées par TSOA
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express")); // Importe Swagger UI pour la documentation interactive de l'API
const swaggerDocument = __importStar(require("./swagger.json")); // Importe le fichier de configuration Swagger
const app = (0, express_1.default)(); // Crée une nouvelle application Express
app.use(express_1.default.json()); // Permet à Express de comprendre les requêtes au format JSON
app.use(express_1.default.urlencoded({ extended: true })); // Permet de lire les données envoyées en formulaire (URL-encoded)
// Sert la documentation Swagger sur /docs
app.use('/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument));
// Middleware de base pour /api (peut servir à ajouter des vérifications ou logs)
app.use('/api', (req, res, next) => {
    next(); // Passe au middleware suivant
});
// Ici, TSOA va injecter toutes les routes des controllers
(0, routes_1.RegisterRoutes)(app); // Ajoute toutes les routes définies dans les fichiers controllers
exports.default = app; // Exporte l'application Express pour pouvoir la démarrer ailleurs
