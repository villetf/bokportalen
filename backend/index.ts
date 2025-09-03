import express from 'express';
import bookRoutes from './routes/books.routes.js';
import authorRoutes from './routes/authors.routes.js';
import countryRoutes from './routes/countries.routes.js';
import { AppDataSource } from './data-source.js';
import languageRoutes from './routes/language.routes.js';
import genreRoutes from './routes/genres.routes.js';
import cors from 'cors';

const app = express();
app.use(express.json());

app.use(cors());

app.use('/books', bookRoutes);
app.use('/authors', authorRoutes);
app.use('/countries', countryRoutes);
app.use('/languages', languageRoutes);
app.use('/genres', genreRoutes);

AppDataSource.initialize()
   .then(() => {
      console.log('Data Source has been initialized!');
      app.listen(3000, () => console.log('Server running on port 3000'));
   })
   .catch((err) => {
      console.error('Error during Data Source initialization:', err);
   });
