import express from 'express';
import { RegisterRoutes } from './routes/routes';
import swaggerUi from 'swagger-ui-express';
import * as swaggerDocument from './swagger.json';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api', (req, res, next) => {
  next()
})
// Ici, TSOA va injecter toutes les routes des controllers
RegisterRoutes(app);

export default app;