import { Expose } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString } from 'class-validator';
import type { AuthorLifeStatus } from '../entities/Author.js';

export class AuthorUpdateDTO {
   @Expose()
   @IsInt()
      id!: number | null;

   @Expose()
   @IsOptional()
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
      deathYear?: number | null;

   @Expose()
   @IsOptional()
   @IsIn(['alive', 'deceased', 'unknown'])
      lifeStatus?: AuthorLifeStatus;

   @Expose()
   @IsOptional()
   @IsInt()
      countryId!: number | null;

   @Expose()
   @IsOptional()
   @IsString()
      imageLink!: string | null;
}
