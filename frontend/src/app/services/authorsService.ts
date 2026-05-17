import { Injectable } from '@angular/core';
import { Author } from '../types/Author.model';
import { AddAuthorDTO } from '../dtos/AddAuthorDTO';
import { HttpClient } from '@angular/common/http';
import { catchError, firstValueFrom, throwError } from 'rxjs';
import { EditAuthorDTO } from '../dtos/EditAuthorDTO';
import { environment } from '../../environments/environment';



@Injectable({ providedIn: 'root' })
export class AuthorsService {
   private apiUrl = environment.apiUrl;
   constructor(private http: HttpClient) {}

   async getAuthorById(id: number): Promise<Author | null> {
      try {
         return await firstValueFrom(this.http.get<Author>(`${this.apiUrl}/authors/${id}`));
      } catch {
         return null;
      }
   }

   async getAllAuthors(): Promise<Author[]> {
      try {
         const data = await firstValueFrom(this.http.get<Author[]>(`${this.apiUrl}/authors`));
         return data.sort((a, b) => a.firstName.localeCompare(b.firstName));
      } catch {
         return [];
      }
   }

   addAuthor(author: AddAuthorDTO) {
      return this.http.post(`${this.apiUrl}/authors`, author).pipe(
         catchError(err => {
            console.error('Error when posting author:', err);
            return throwError(() => err);
         })
      );
   }

   editAuthor(author: EditAuthorDTO) {
      return this.http.patch(`${this.apiUrl}/authors/${author.id}`, author).pipe(
         catchError(err => {
            console.error('Error when editing author:', err);
            return throwError(() => err);
         })
      );
   }
}