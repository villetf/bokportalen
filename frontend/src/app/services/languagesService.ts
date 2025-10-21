import { Injectable } from '@angular/core';
import { Language } from '../types/Language.model';
import { HttpClient } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class LanguagesService {
   constructor(private http: HttpClient) {}

   async getAllLanguages(): Promise<Language[]> {
      const response = await fetch('http://localhost:3000/languages');
      const data: Language[] = await response.json();
      return data.sort((a, b) => a.name.localeCompare(b.name));
   }

   addLanguage(language: Language) {
      return this.http.post('http://localhost:3000/languages/', language).pipe(
         catchError(err => {
            console.error('Error when posting language:', err);
            return throwError(() => err);
         })
      );
   }
}