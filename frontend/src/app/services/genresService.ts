import { Injectable } from '@angular/core';
import { Genre } from '../types/Genre.model';
import { HttpClient } from '@angular/common/http';
import { catchError, firstValueFrom, throwError } from 'rxjs';
import { environment } from '../../environments/environment';


@Injectable({ providedIn: 'root' })
export class GenresService {
   private apiUrl = environment.apiUrl;
   constructor(private http: HttpClient) {}

   async getAllGenres(): Promise<Genre[]> {
      try {
         const data = await firstValueFrom(this.http.get<Genre[]>(`${this.apiUrl}/genres`));
         return data.sort((a, b) => a.name.localeCompare(b.name));
      } catch {
         return [];
      }
   }

   addGenre(genre: Genre) {
      return this.http.post(`${this.apiUrl}/genres`, genre).pipe(
         catchError(err => {
            console.error('Error when posting genre:', err);
            return throwError(() => err);
         })
      );
   }
}