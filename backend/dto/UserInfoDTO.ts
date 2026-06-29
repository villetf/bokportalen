export class UserInfoDTO {
   id!: number;
   email!: string;
   firstName!: string | null;
   lastName!: string | null;
   showRealCovers!: boolean;
   createdAt!: Date;
   updatedAt!: Date;
}