import { Injectable } from '@angular/core';
import { Author } from '../types/Author.model';
import { AddAuthorDTO } from '../dtos/AddAuthorDTO';
import { HttpClient } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class AuthorsService {
   constructor(private http: HttpClient) {}

   async getAuthorById(id: number): Promise<Author | null> {
      const response = await fetch(`http://localhost:3000/authors/${id}`);
      if (!response.ok) {
         return null;
      }
      return response.json();
   }

   async getAllAuthors(): Promise<Author[]> {
      const response = await fetch('http://localhost:3000/authors');
      if (!response.ok) {
         return [];
      }

      const data: Author[] = await response.json();
      return data.sort((a, b) => a.firstName.localeCompare(b.firstName));
   }

   addAuthor(author: AddAuthorDTO) {
      return this.http.post('http://localhost:3000/authors', author).pipe(
         catchError(err => {
            console.error('Error when posting author:', err);
            return throwError(() => err);
         })
      );
   }
}