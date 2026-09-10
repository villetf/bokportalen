import { Genre } from '../types/Genre.model';
import { Language } from '../types/Language.model';


export interface AddBookDTO {
   title: string;
   authors: number[];
   yearWritten: number | null;
   genres: number[];
   language: Language | number | null;
   originalLanguage: Language | number | null;
   format: string | null;
   isbn: number | null;
   coverLink: string | null;
   addedWithScanner: boolean;
}
