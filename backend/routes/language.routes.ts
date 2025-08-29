import { Router } from 'express';
import { LanguagesController } from '../controllers/languages.controller.js';

const router = Router();

router.get('/', LanguagesController.getAllLanguages);

export default router;