import { Router } from 'express';
import { GenresController } from '../controllers/genres.controller.js';
import { validateDto } from '../middleware/validate.js';
import { GenreRequestDTO } from '../dto/GenreRequestDTO.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.get('/', authenticate, GenresController.getAllGenres);
router.post('/', authenticate, validateDto(GenreRequestDTO), GenresController.addGenre);

export default router;