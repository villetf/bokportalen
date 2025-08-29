import { Router } from 'express';
import { AuthorsController } from '../controllers/authors.controller.js';

const router = Router();

router.get('/', AuthorsController.getAuthors);

export default router;