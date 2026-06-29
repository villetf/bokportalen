import { Router } from 'express';
import { UsersController } from '../controllers/users.controller.js';
import { UserBooksController } from '../controllers/userBooks.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validateDto } from '../middleware/validate.js';
import { UserUpdateDTO } from '../dto/UserUpdateDTO.js';
import { UserBookRequestDTO } from '../dto/UserBookRequestDTO.js';
import { UserBookUpdateDTO } from '../dto/UserBookUpdateDTO.js';

const router = Router();

router.get('/me', authenticate, UsersController.getCurrentUser);
router.patch('/me', authenticate, validateDto(UserUpdateDTO), UsersController.updateCurrentUser);

router.get('/me/books', authenticate, UserBooksController.getCurrentUserBooks);
router.get('/me/books/:bookId', authenticate, UserBooksController.getCurrentUserBookById);
router.post('/me/books', authenticate, validateDto(UserBookRequestDTO), UserBooksController.addCurrentUserBook);
router.patch('/me/books/:bookId', authenticate, validateDto(UserBookUpdateDTO), UserBooksController.updateCurrentUserBook);
router.delete('/me/books/:bookId', authenticate, UserBooksController.removeCurrentUserBook);

export default router;