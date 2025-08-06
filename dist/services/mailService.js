"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVerificationEmail = sendVerificationEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const transporter = nodemailer_1.default.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: Number(process.env.MAILTRAP_PORT),
    auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS
    }
});
// Fonction pour envoyer l'email de vérification
async function sendVerificationEmail(email, token) {
    // Utilise l’URL de base fournie dans les variables d’environnement
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const verificationUrl = `${baseUrl}/auth/verify-email?token=${token}`;
    const mailOptions = {
        from: '"Qualiextra" <no-reply@qualiextra.com>',
        to: email,
        subject: 'Vérification de votre adresse email',
        html: `
      <h2>Bienvenue !</h2>
      <p>Veuillez cliquer sur le lien suivant pour vérifier votre adresse email :</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
    `
    };
    await transporter.sendMail(mailOptions);
}
