import nodemailer from 'nodemailer' // Importe la librairie nodemailer pour envoyer des emails
import dotenv from 'dotenv' // Importe dotenv pour gérer les variables d'environnement

dotenv.config() // Charge les variables d'environnement depuis le fichier .env

// Création du transporteur SMTP Mailtrap (utilisé pour envoyer les emails en développement)
const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST, // Adresse du serveur SMTP Mailtrap
  port: Number(process.env.MAILTRAP_PORT), // Port du serveur SMTP
  auth: {
    user: process.env.MAILTRAP_USER, // Identifiant Mailtrap
    pass: process.env.MAILTRAP_PASS // Mot de passe Mailtrap
  }
})

// Fonction pour envoyer l'email de vérification
export async function sendVerificationEmail(email: string, token: string) {
  // Crée l'URL de vérification à envoyer à l'utilisateur
  const verificationUrl = `http://localhost:3000/auth/verify-email?token=${token}`

  // Définit les options de l'email (expéditeur, destinataire, sujet, contenu HTML)
  const mailOptions = {
    from: '"Qualiextra" <no-reply@qualiextra.com>', // Expéditeur
    to: email, // Destinataire
    subject: 'Vérification de votre adresse email', // Sujet de l'email
    html: `
      <h2>Bienvenue !</h2>
      <p>Veuillez cliquer sur le lien suivant pour vérifier votre adresse email :</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
    `
  }

  await transporter.sendMail(mailOptions) // Envoie l'email avec nodemailer
}