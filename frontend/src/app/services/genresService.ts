import { Injectable } from '@angular/core';
import { Genre } from '../types/Genre.model';
import { HttpClient } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';


@Injectable({ providedIn: 'root' })
export class GenresService {
   private apiUrl = environment.apiUrl;
   constructor(private http: HttpClient) {}

   async getAllGenres(): Promise<Genre[]> {
      const response = await fetch(`${this.apiUrl}/genres`);
      const data: Genre[] = await response.json();
      return data.sort((a, b) => a.name.localeCompare(b.name));
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