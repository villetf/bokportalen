import { Injectable } from '@angular/core';
import { Genre } from '../types/Genre.model';


@Injectable({ providedIn: 'root' })
export class GenresService {
   async getAllGenres(): Promise<Genre[]> {
      const response = await fetch('http://localhost:3000/genres');
      const data: Genre[] = await response.json();
      return data.sort((a, b) => a.name.localeCompare(b.name));
   }
}