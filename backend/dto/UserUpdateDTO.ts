import { Exclude, Expose } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

@Exclude()
export class UserUpdateDTO {
   @Expose()
   @IsOptional()
   @IsBoolean()
      showRealCovers!: boolean;

   @Expose()
   @IsOptional()
   @IsString()
      firstName!: string | null;

   @Expose()
   @IsOptional()
   @IsString()
      lastName!: string | null;
}