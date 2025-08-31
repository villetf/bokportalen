import { Router } from 'express';
import { AuthorsController } from '../controllers/authors.controller.js';
import { validateDto } from '../middleware/validate.js';
import { AuthorRequestDTO } from '../dto/AuthorRequestDTO.js';
import { AuthorUpdateDTO } from '../dto/AuthorUpdateDTO.js';

const router = Router();

router.get('/', AuthorsController.getAuthors);
router.get('/:id', AuthorsController.getAuthorById);
router.post('/', validateDto(AuthorRequestDTO), AuthorsController.createAuthor);
router.patch('/:id', validateDto(AuthorUpdateDTO), AuthorsController.updateAuthor);

export default router;