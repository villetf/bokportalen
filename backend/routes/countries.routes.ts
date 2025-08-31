import { Router } from 'express';
import { CountriesController } from '../controllers/countries.controller.js';

const router = Router();

router.get('/', CountriesController.getCountries);

export default router;