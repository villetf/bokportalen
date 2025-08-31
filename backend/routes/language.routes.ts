import { Router } from 'express';
import { LanguagesController } from '../controllers/languages.controller.js';
import { validateDto } from '../middleware/validate.js';
import { LanguageRequestDTO } from '../dto/LanguageRequestDTO.js';

const router = Router();

router.get('/', LanguagesController.getAllLanguages);
router.get('/:id', LanguagesController.getLanguageById);
router.post('/', validateDto(LanguageRequestDTO), LanguagesController.addLanguage);

export default router;