"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app")); // Importe l'application Express configurée
const dotenv_1 = __importDefault(require("dotenv")); // Importe dotenv pour gérer les variables d'environnement
dotenv_1.default.config(); // Charge les variables d'environnement depuis le fichier .env
const PORT = process.env.PORT || 3000; // Définit le port du serveur (prend la valeur du .env ou 3000 par défaut)
app_1.default.listen(PORT, () => {
    // Démarre le serveur et affiche un message dans la console
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
