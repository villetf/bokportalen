import { Router } from 'express';
import { BooksController } from '../controllers/books.controller.js';
import { validateDto } from '../middleware/validate.js';
import { BookRequestDTO } from '../dto/BookRequestDTO.js';
import { BookUpdateDTO } from '../dto/BookUpdateDTO.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.get('/', authenticate, BooksController.getAllBooks);
router.get('/deleted', authenticate, BooksController.getDeletedBooks);
router.get('/:id', authenticate, BooksController.getBookById);
router.post('/', authenticate, validateDto(BookRequestDTO), BooksController.createBook);
router.patch('/:id', authenticate, validateDto(BookUpdateDTO), BooksController.updateBook);
router.delete('/:id', authenticate, BooksController.markBookAsDeleted);

export default router;