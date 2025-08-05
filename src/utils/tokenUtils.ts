// Génère un token de vérification d'email sécurisé
export function generateVerifyToken(): string {
  // Token aléatoire de 32 caractères hexadécimaux
  return [...Array(32)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join('')
}
