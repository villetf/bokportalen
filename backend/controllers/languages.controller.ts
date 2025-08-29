import type { Request, Response } from 'express';
import { LanguagesService } from '../services/languages.services.js';

export class LanguagesController {
   static async getAllLanguages(req: Request, res: Response) {
      const languages = await LanguagesService.getAllLanguages();
      res.json(languages);
   }
}
