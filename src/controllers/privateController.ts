import { Controller, Get, Route, Tags, Security } from 'tsoa'

@Route('private') // Le préfixe de route sera /private
@Tags('Private')  // Pour regrouper cette route dans Swagger sous l’onglet "Private"
export class PrivateController extends Controller {
  
    //Cette route retourne un message personnalisé à un utilisateur authentifié.
    //Elle est protégée par un middleware JWT.
   
  @Get('/')
  @Security('jwt') // Indique à tsoa que cette route a besoin d'un token
  public async getPrivate(): Promise<{ message: string }> {
   
    return { message: 'Hello depuis la route privée ✅' }
  }
}
