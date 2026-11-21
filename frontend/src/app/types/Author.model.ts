import { Country } from './Country.model';

export type AuthorLifeStatus = 'alive' | 'deceased' | 'unknown';

export interface Author {
   id: number;
   firstName: string;
   lastName: string;
   gender: string;
   birthYear: number | null;
   deathYear: number | null;
   lifeStatus: AuthorLifeStatus;
   country: Country | null;
   imageLink: string | null;
}
