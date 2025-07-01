import { AppDataSource } from '../data-source.js';
import { Language } from '../entities/Language.js';
import { capitalizeWord } from '../helpers/helpers.js';

export class LanguagesService {
   static async getLanguageByName(languageName: string): Promise<Language | null> {
      const language = await AppDataSource.getRepository(Language)
         .createQueryBuilder('language')
         .where('LOWER(language.name) = LOWER(:name)', { name: languageName })
         .getOne();

      return language;
   }

   static async addLanguage(languageName: string): Promise<Language> {
      const newLanguage = new Language();
      languageName = capitalizeWord(languageName);
      newLanguage.name = languageName;

      return await AppDataSource.getRepository(Language).save(newLanguage);
   }
}