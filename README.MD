# Qualiextra Back-End - API REST sécurisée avec Typescript, TSOA & Prisma


## 📜 Présentation

Ce projet est une API REST développée dans le cadre d’un test technique pour le poste de développeur Back-End chez Qualiextra.  
L’objectif était de créer une API robuste, sécurisée et bien structurée, en utilisant TypeScript, TSOA (pour générer automatiquement les routes et la documentation Swagger), Prisma (pour gérer la base de données PostgreSQL), et JWT pour l’authentification.

---

## 🚗 Contexte & Fonctionnalités

Cette API gère un système d’utilisateurs avec :

- **Gestion des rôles** : utilisateurs standards (`USER`) et administrateurs (`ADMIN`).
- **Inscription & Authentification** : avec hashage des mots de passe (bcrypt) et tokens JWT.
- **Validation d’email** : envoi d’un email avec token de vérification (via Mailtrap).  
  Un utilisateur ne peut pas se connecter tant que son email n’est pas validé.
- **Blocage des emails temporaires** : refus des adresses issues de domaines jetables (mailinator, temp-mail…).
- **Routes protégées** accessibles uniquement aux utilisateurs authentifiés.  
- **Swagger** intégré pour la documentation interactive et les tests.

---

## 📦 Technologies utilisées

- **TypeScript** : typage statique pour un code plus sûr et lisible.  
- **TSOA** : génération automatique des routes Express + Swagger.  
- **Prisma** : ORM moderne pour PostgreSQL.  
- **PostgreSQL** : base de données relationnelle.  
- **JWT (jsonwebtoken)** : authentification sécurisée par tokens.  
- **bcrypt** : sécurisation des mots de passe par hashage.  
- **Mailtrap** : service de test d’envoi d’emails.  

---

## 🔧 Installation & Démarrage

### Prérequis

- Node.js 
- PostgreSQL (configuré et accessible)
- Un compte Mailtrap pour les emails de vérification

### Étapes

1. **Cloner le dépôt**

```bash

git clone https://github.com/LorenzoPizzi/Qualiextra-test.git
cd Qualiextra-test
Installer les dépendances

npm install
Configurer les variables d’environnement

----

Créer un fichier .env à la racine et renseigner :

.env

DATABASE_URL="postgresql://user:password@localhost:5432/nomDeTaBase"
JWT_SECRET="unePhraseSecreteSuperSecurisee"
MAILTRAP_HOST="smtp.mailtrap.io"
MAILTRAP_PORT=2525
MAILTRAP_USER="tonUserMailtrap"
MAILTRAP_PASS="tonPasswordMailtrap"

---

Générer les fichiers Prisma & TSOA

npx prisma generate
npm run prisma:migrate  
npm run tsoa   

---

Démarrer le serveur en mode dev

npm run dev
Le serveur écoute par défaut sur http://localhost:3000

---

🚀 Utilisation & tests
Ouvrir la documentation Swagger interactive :
http://localhost:3000/docs

Tester les routes suivantes :

POST /auth/register : inscription (vérifie les emails jetables, envoie un mail de validation)

GET /auth/verify-email?token=xxx : valider un email

POST /auth/login : connexion (renvoie un token JWT)

GET /private : route protégée accessible uniquement aux utilisateurs connectés

/users : routes CRUD utilisateurs avec restrictions d’accès selon rôle

---

📖 Architecture & Code
Controllers : dans src/controllers

AuthController.ts : inscription, vérification email, connexion

UserController.ts : gestion utilisateurs (CRUD + contrôle d’accès rôle)

PrivateController.ts : route privée test (exemple)

Middlewares : dans src/middlewares

authMiddleware.ts : vérification JWT et ajout de l’utilisateur à la requête

Utils & Services :

emailUtils.ts : validation des emails jetables

tokenUtils.ts : génération de tokens uniques

mailService.ts : envoi des emails via Mailtrap

TSOA : génère automatiquement routes et documentation Swagger depuis les contrôleurs annotés

🛡️ Sécurité
Mots de passe hashés avec bcrypt avant stockage

Jetons JWT sécurisés par une clé secrète définie dans .env

Protection des routes sensibles avec middleware JWT

Validation d’email obligatoire avant connexion

Blocage des emails temporaires

---

🔄 Déploiement
L’API est prête à être déployée sur un serveur distant (Heroku, Vercel, AWS...).
Veillez à :

configurer les variables d’environnement sur le serveur

utiliser une base PostgreSQL accessible en production

ouvrir les ports nécessaires

mettre à jour la variable BASE_PATH si besoin

---

📝 Remarques
Le code est commenté pour faciliter la compréhension et la maintenance.

Swagger permet de tester facilement toutes les routes sans outils externes.

L’architecture modulaire facilite l’ajout de nouvelles fonctionnalités (ex: gestion avancée des rôles).

---

👨‍💻 Auteur
Lorenzo Pizzi  - Développeur Back-End en apprentissage.