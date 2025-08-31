import type { Request, Response } from 'express';
import { CountriesService } from '../services/countries.services.js';

export class CountriesController {
   static async getCountries(req: Request, res: Response) {
      const countries = await CountriesService.getAllCountries();
      res.json(countries);
   }
}
