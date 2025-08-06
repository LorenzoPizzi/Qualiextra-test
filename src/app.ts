import express from 'express'; // Importe le framework Express pour créer le serveur web
import { RegisterRoutes } from './routes/routes'; // Importe la fonction qui enregistre les routes générées par TSOA
import swaggerUi from 'swagger-ui-express'; // Importe Swagger UI pour la documentation interactive de l'API
import * as swaggerDocument from './swagger.json'; // Importe le fichier de configuration Swagger

const app = express(); // Crée une nouvelle application Express

app.use(express.json()); // Permet à Express de comprendre les requêtes au format JSON
app.use(express.urlencoded({ extended: true })); // Permet de lire les données envoyées en formulaire (URL-encoded)

// Sert la documentation Swagger sur /docs
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Middleware de base pour /api (peut servir à ajouter des vérifications ou logs)
app.use('/api', (req, res, next) => {
  next() // Passe au middleware suivant
})

// Ici, TSOA va injecter toutes les routes des controllers
RegisterRoutes(app); // Ajoute toutes les routes définies dans les fichiers controllers

export default app; // Exporte l'application Express pour pouvoir la démarrer ailleurs