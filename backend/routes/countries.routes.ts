import { Router } from 'express';
import { CountriesController } from '../controllers/countries.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.get('/', authenticate, CountriesController.getCountries);

export default router;