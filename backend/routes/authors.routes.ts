import { Router } from 'express';
import { AuthorsController } from '../controllers/authors.controller.js';
import { validateDto } from '../middleware/validate.js';
import { AuthorRequestDTO } from '../dto/AuthorRequestDTO.js';
import { AuthorUpdateDTO } from '../dto/AuthorUpdateDTO.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.get('/', authenticate, AuthorsController.getAuthors);
router.get('/:id', authenticate, AuthorsController.getAuthorById);
router.post('/', authenticate, validateDto(AuthorRequestDTO), AuthorsController.createAuthor);
router.patch('/:id', authenticate, validateDto(AuthorUpdateDTO), AuthorsController.updateAuthor);

export default router;