import { Genre } from '../types/Genre.model';
import { Language } from '../types/Language.model';


export interface AddBookDTO {
   title: string;
   authors: number[];
   yearWritten: number;
   genre: Genre;
   language: Language;
   originalLanguage: Language;
   format: string;
   isbn: number;
   coverLink: string | null;
   addedWithScanner: boolean;
}
