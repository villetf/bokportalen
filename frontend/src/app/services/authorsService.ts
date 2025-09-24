import { Injectable } from "@angular/core";
import { Author } from "../types/Author.model";


@Injectable({ providedIn: 'root' })
export class AuthorsService {
   async getAuthorById(id: number): Promise<Author | null> {
      const response = await fetch(`http://localhost:3000/authors/${id}`)
      if (!response.ok) {
         return null;
      }
      return response.json()
   }

   async getAllAuthors(): Promise<Author[]> {
      const response = await fetch('http://localhost:3000/authors');
      if (!response.ok) {
         return [];
      }
      return response.json();
   }
}