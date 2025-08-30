import { Router } from 'express';
import { GenresController } from '../controllers/genres.controller.js';

const router = Router();

router.get('/', GenresController.getAllGenres);

export default router;