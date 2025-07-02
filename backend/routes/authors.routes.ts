import { Router } from 'express';
import { AuthorsController } from '../controllers/authors.controller.js';

const router = Router();

router.get('/', AuthorsController.getAllAuthors);

export default router;