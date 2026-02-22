export class UserInfoDTO {
   id!: number;
   email!: string;
   displayName!: string | null;
   showRealCovers!: boolean;
   createdAt!: Date;
   updatedAt!: Date;
}