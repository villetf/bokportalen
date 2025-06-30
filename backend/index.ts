import express from 'express';
import bookRoutes from './routes/books.routes.js';
import { AppDataSource } from './data-source.js';

const app = express();
app.use(express.json());

app.use('/books', bookRoutes);

AppDataSource.initialize()
   .then(() => {
      console.log('Data Source has been initialized!');
      app.listen(3000, () => console.log('Server running on port 3000'));
   })
   .catch((err) => {
      console.error('Error during Data Source initialization:', err);
   });
