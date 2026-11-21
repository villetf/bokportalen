import { AuthorLifeStatus } from '../types/Author.model';

export interface EditAuthorDTO {
   id: number;
   firstName: string;
   lastName: string;
   gender: string | null;
   birthYear: number | null;
   deathYear: number | null;
   lifeStatus: AuthorLifeStatus;
   countryId: number | null;
   imageLink: string | null;
}
