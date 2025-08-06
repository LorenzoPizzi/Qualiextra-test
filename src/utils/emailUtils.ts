import { tempEmailDomains } from './tempEmailDomains' // Importe la liste des domaines d'emails jetables

// Fonction qui vérifie si une adresse email appartient à un domaine jetable
// Elle extrait le nom de domaine après le @ et le compare à une liste d'interdits
export function isTempEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase() // Récupère le domaine de l'email (après le @) et le met en minuscules
  return tempEmailDomains.includes(domain) // Vérifie si le domaine est dans la liste des domaines jetables
}