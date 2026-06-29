import { UserBook } from './UserBook.model';

export interface Filter {
   bookProperty: keyof UserBook,
   filterString: string | null,
   displayString: string
}