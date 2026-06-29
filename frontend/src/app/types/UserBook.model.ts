import { Book } from './Book.model';

export interface UserBook extends Book {
   status: string | null;
   rating: number | null;
   copies: number;
}
