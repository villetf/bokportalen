import { Router } from 'express';
import { BooksController } from '../controllers/books.controller.js';
import { validateDto } from '../middleware/validate.js';
import { BookRequestDTO } from '../dto/BookRequestDTO.js';
import { BookUpdateDTO } from '../dto/BookUpdateDTO.js';

const router = Router();

router.get('/', BooksController.getAllBooks);
router.get('/deleted', BooksController.getDeletedBooks);
router.get('/:id', BooksController.getBookById);
router.post('/', validateDto(BookRequestDTO), BooksController.createBook);
router.patch('/:id', validateDto(BookUpdateDTO), BooksController.updateBook);
router.delete('/:id', BooksController.markBookAsDeleted);

export default router;