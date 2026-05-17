import { Author } from './Author.model';
import { Genre } from './Genre.model';
import { Language } from './Language.model';

export interface Book {
   id: number;
   title: string;
   authors: Author[];
   yearWritten: number;
   language: Language;
   originalLanguage: Language;
   genre: Genre;
   format: string;
   isbn: number;
   createdAt: Date | null;
   addedWithScanner: boolean | null;
   isDeleted: boolean;
   coverLink: string | null;
}
