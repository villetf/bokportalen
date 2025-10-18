import { Injectable } from '@angular/core';
import { Language } from '../types/Language.model';


@Injectable({ providedIn: 'root' })
export class LanguagesService {
   async getAllLanguages(): Promise<Language[]> {
      const response = await fetch('http://localhost:3000/languages');
      const data: Language[] = await response.json();
      return data.sort((a, b) => a.name.localeCompare(b.name));
   }
}