export interface EditAuthorDTO {
   id: number;
   firstName: string;
   lastName: string;
   gender: string;
   birthYear: number;
   countryId: number;
   imageLink: string | null;
}