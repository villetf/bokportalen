import { Expose } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString } from 'class-validator';

export class AuthorRequestDTO {
   @Expose()
   @IsString()
      firstName!: string;

   @Expose()
   @IsOptional()
   @IsString()
      lastName!: string | null;

   @Expose()
   @IsOptional()
   @IsIn(['Man', 'Kvinna', 'Annat'])
   @IsString()
      gender!: 'Man' | 'Kvinna' | 'Annat' | null;

   @Expose()
   @IsOptional()
   @IsInt()
      birthYear!: number | null;

   @Expose()
   @IsOptional()
   @IsInt()
      country!: number | null;

   @Expose()
   @IsOptional()
   @IsString()
      imageLink!: string | null;
}