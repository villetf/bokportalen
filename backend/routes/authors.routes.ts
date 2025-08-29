import { Router } from 'express';
import { AuthorsController } from '../controllers/authors.controller.js';

const router = Router();

router.get('/', AuthorsController.getAuthors);
router.get('/:id', AuthorsController.getAuthorById);

export default router;