export interface Author {
   id: number;
   firstName: string;
   lastName: string;
   gender: string;
   birthYear: number;
   country: {
      id: number;
      name: string;
   }
   imageLink: string | null;
}
