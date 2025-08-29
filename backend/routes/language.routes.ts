import { Router } from 'express';
import { LanguagesController } from '../controllers/languages.controller.js';

const router = Router();

router.get('/', LanguagesController.getAllLanguages);
router.get('/:id', LanguagesController.getLanguageById);

export default router;