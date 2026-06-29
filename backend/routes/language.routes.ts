import { Router } from 'express';
import { LanguagesController } from '../controllers/languages.controller.js';
import { validateDto } from '../middleware/validate.js';
import { LanguageRequestDTO } from '../dto/LanguageRequestDTO.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.get('/', authenticate, LanguagesController.getAllLanguages);
router.get('/:id', authenticate, LanguagesController.getLanguageById);
router.post('/', authenticate, validateDto(LanguageRequestDTO), LanguagesController.addLanguage);

export default router;