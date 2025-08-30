import { Router } from 'express';
import { GenresController } from '../controllers/genres.controller.js';
import { validateDto } from '../middleware/validate.js';
import { GenreRequestDTO } from '../dto/GenreRequestDTO.js';

const router = Router();

router.get('/', GenresController.getAllGenres);
router.post('/', validateDto(GenreRequestDTO), GenresController.addGenre);

export default router;