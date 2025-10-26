import { Book } from './Book.model';

export interface Filter {
   bookProperty: keyof Book,
   filterString: string | null,
   displayString: string
}