import { Controller, Get, Route } from 'tsoa';

@Route('hello')
export class HelloController extends Controller {
  @Get('/')
  public async sayHello(): Promise<{ message: string }> {
    return { message: 'Hello from TSOA!' };
  }
}