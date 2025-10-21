import { Injectable } from '@angular/core';
import { Genre } from '../types/Genre.model';
import { HttpClient } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class GenresService {
   constructor(private http: HttpClient) {}

   async getAllGenres(): Promise<Genre[]> {
      const response = await fetch('http://localhost:3000/genres');
      const data: Genre[] = await response.json();
      return data.sort((a, b) => a.name.localeCompare(b.name));
   }

   addGenre(genre: Genre) {
      return this.http.post('http://localhost:3000/genres/', genre).pipe(
         catchError(err => {
            console.error('Error when posting genre:', err);
            return throwError(() => err);
         })
      );
   }
}