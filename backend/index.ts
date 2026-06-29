import express from 'express';
import './firebaseAdmin.js';
import bookRoutes from './routes/books.routes.js';
import authorRoutes from './routes/authors.routes.js';
import countryRoutes from './routes/countries.routes.js';
import { AppDataSource } from './data-source.js';
import languageRoutes from './routes/language.routes.js';
import genreRoutes from './routes/genres.routes.js';
import cors from 'cors';
import usersRoutes from './routes/users.routes.js';

const app = express();
app.use(express.json());

app.use(cors());

app.use('/api/v1/books', bookRoutes);
app.use('/api/v1/authors', authorRoutes);
app.use('/api/v1/countries', countryRoutes);
app.use('/api/v1/languages', languageRoutes);
app.use('/api/v1/genres', genreRoutes);
app.use('/api/v1/users', usersRoutes);

AppDataSource.initialize()
   .then(() => {
      console.log('Data Source has been initialized!');
      app.listen(3000, () => console.log('Server running on port 3000'));
   })
   .catch((err) => {
      console.error('Error during Data Source initialization:', err);
   });
