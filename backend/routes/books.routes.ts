import { Router } from 'express';
import { BooksController } from '../controllers/books.controller.js';

const router = Router();

router.get('/', BooksController.getAllBooks);
// router.post('/', UserController.create);

export default router;