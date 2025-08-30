import { Router } from 'express';
import { BooksController } from '../controllers/books.controller.js';
import { validateDto } from '../middleware/validate.js';
import { BookRequestDTO } from '../dto/BookRequestDTO.js';

const router = Router();

router.get('/', BooksController.getAllBooks);
router.get('/:id', BooksController.getBookById);
router.post('/', validateDto(BookRequestDTO), BooksController.createBook);
router.delete('/:id', BooksController.markBookAsDeleted);

export default router;