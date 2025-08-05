import { tempEmailDomains } from './tempEmailDomains'
// Fonction qui vérifie si une adresse email appartient à un domaine jetable
// Elle extrait le nom de domaine après le @ et le compare à une liste d'interdits
export function isTempEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase()
  return tempEmailDomains.includes(domain)
}