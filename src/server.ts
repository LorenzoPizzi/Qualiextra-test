import app from './app'; // Importe l'application Express configurée
import dotenv from 'dotenv'; // Importe dotenv pour gérer les variables d'environnement

dotenv.config(); // Charge les variables d'environnement depuis le fichier .env

const PORT = process.env.PORT || 3000; // Définit le port du serveur (prend la valeur du .env ou 3000 par défaut)

app.listen(PORT, () => {
  // Démarre le serveur et affiche un message dans la console
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});