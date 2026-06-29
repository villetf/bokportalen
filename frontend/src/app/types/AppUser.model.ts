export interface AppUser {
   id: number;
   email: string;
   firstName: string | null;
   lastName: string | null;
   showRealCovers: boolean;
   createdAt: string;
   updatedAt: string;
}
