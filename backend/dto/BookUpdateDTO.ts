import { Exclude, Expose } from 'class-transformer';
import { IsString, IsInt, IsOptional, IsArray, IsBoolean, IsNumber } from 'class-validator';
import { Author } from '../entities/Author.js';

@Exclude()
export class BookUpdateDTO {
   @Expose()
   @IsOptional()
   @IsNumber()
      id!: number;

   @Expose()
   @IsOptional()
   @IsString()
      title!: string;

   @Expose()
   @IsOptional()
   @IsArray()
      authors!: Author[];

   @Expose()
   @IsOptional()
   @IsInt()
      yearWritten?: number;

   @Expose()
   @IsOptional()
   @IsInt()
      isbn?: number;

   @Expose()
   @IsOptional()
   @IsNumber()
      language?: number;

   @Expose()
   @IsOptional()
   @IsNumber()
      originalLanguage?: number;

   @Expose()
   @IsOptional()
   @IsNumber()
      genre?: number;

   @Expose()
   @IsOptional()
   @IsString()
      format?: string;

   @Expose()
   @IsOptional()
   @IsBoolean()
      addedWithScanner?: boolean;

   @Expose()
   @IsOptional()
   @IsInt()
      copies?: number;

   @Expose()
   @IsOptional()
   @IsString()
      status?: string;

   @Expose()
   @IsOptional()
   @IsNumber({ maxDecimalPlaces: 1 })
      rating?: number;

   @Expose()
   @IsOptional()
   @IsString()
      coverLink?: string;

   @Expose()
   @IsOptional()
   @IsBoolean()
      isDeleted?: boolean;
}