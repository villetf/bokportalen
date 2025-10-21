import { Country } from './Country.model';

export interface Author {
   id: number;
   firstName: string;
   lastName: string;
   gender: string;
   birthYear: number;
   country: Country
   imageLink: string | null;
}
