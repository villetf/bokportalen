import { Exclude, Expose } from 'class-transformer';
import { IsString, IsInt, IsOptional, IsArray, IsBoolean } from 'class-validator';

@Exclude()
export class BookRequestDTO {
   @Expose()
   @IsString()
      title!: string;

   @Expose()
   @IsArray()
      authors!: number[];

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
   @IsInt()
      language?: number;

   @Expose()
   @IsOptional()
   @IsInt()
      originalLanguage?: number;

   @Expose()
   @IsOptional()
   @IsInt()
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
   @IsString()
      coverLink?: string;
}