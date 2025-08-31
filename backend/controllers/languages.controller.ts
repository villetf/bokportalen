import type { Request, Response } from 'express';
import { LanguagesService } from '../services/languages.services.js';

export class LanguagesController {
   static async getAllLanguages(req: Request, res: Response) {
      const languages = await LanguagesService.getAllLanguages();
      res.json(languages);
   }

   static async getLanguageById(req: Request, res: Response) {
      const language = await LanguagesService.getLanguageById(Number.parseInt(req.params.id));
      if (language) {
         res.json(language);
      } else {
         res.status(404).json({ message: 'Language not found' });
      }
   }

   static async addLanguage(req: Request, res: Response) {
      if (await LanguagesService.getLanguageByName(req.body.name)) {
         res.status(409).json({ message: 'Language already exists' });
         return;
      }

      const newLanguage = await LanguagesService.addLanguage(req.body.name);
      res.status(201).json(newLanguage);
   }
}
