import { Controller, Get, Route } from 'tsoa' // Importe les décorateurs et classes nécessaires depuis tsoa

// Définit la route de base pour ce contrôleur : '/hello'
@Route('hello')
export class HelloController extends Controller { // Crée une classe qui hérite de Controller
  // Définit une route GET sur '/' (donc '/hello/')
  @Get('/')
  public async sayHello(): Promise<{ message: string }> { // Méthode asynchrone qui retourne un objet avec un message
    return { message: 'Hello from TSOA!' } // Renvoie le message au client
  }
}