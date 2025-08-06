"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateVerifyToken = generateVerifyToken;
// Génère un token de vérification d'email sécurisé
function generateVerifyToken() {
    // Token aléatoire de 32 caractères hexadécimaux
    // [...Array(32)] crée un tableau de 32 éléments
    // .map(() => ...) génère un chiffre aléatoire entre 0 et 15 pour chaque élément
    // .toString(16) convertit ce chiffre en caractère hexadécimal (0-9, a-f)
    // .join('') assemble tous les caractères en une seule chaîne
    return [...Array(32)]
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join('');
}
