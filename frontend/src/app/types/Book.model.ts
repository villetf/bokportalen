import { Author } from "./Author.model";
import { Genre } from "./Genre.model";
import { Language } from "./Language.model";

export interface Book {
   id: number;
   title: string;
   author: Author[];
   yearWritten: number;
   language: Language;
   originalLanguage: Language;
   genre: Genre;
   format: string;
   isbn: number;
   status: string;
   rating: number;
   isDeleted: boolean;
   
}
