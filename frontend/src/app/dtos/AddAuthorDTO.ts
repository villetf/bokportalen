import { AuthorLifeStatus } from '../types/Author.model';

export interface AddAuthorDTO {
   firstName: string;
   lastName: string | null;
   gender: string | null;
   birthYear: number | null;
   deathYear: number | null;
   lifeStatus: AuthorLifeStatus;
   country: number | null;
   imageLink: string | null;
}
