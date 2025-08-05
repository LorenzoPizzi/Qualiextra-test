import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

// Création du transporteur SMTP Mailtrap
const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: Number(process.env.MAILTRAP_PORT),
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS
  }
})

// Fonction pour envoyer l'email de vérification
export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `http://localhost:3000/auth/verify-email?token=${token}`

  const mailOptions = {
    from: '"Qualiextra" <no-reply@qualiextra.com>',
    to: email,
    subject: 'Vérification de votre adresse email',
    html: `
      <h2>Bienvenue !</h2>
      <p>Veuillez cliquer sur le lien suivant pour vérifier votre adresse email :</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
    `
  }

  await transporter.sendMail(mailOptions)
}

