import { Exclude, Expose } from 'class-transformer';
import { IsString, IsInt, IsOptional, IsArray, IsBoolean, IsDate } from 'class-validator';

@Exclude()
export class BookUpdateDTO {
   @Expose()
   @IsOptional()
   @IsString()
      title!: string;

   @Expose()
   @IsOptional()
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
   @IsString()
      language?: string;

   @Expose()
   @IsOptional()
   @IsString()
      originalLanguage?: string;

   @Expose()
   @IsOptional()
   @IsString()
      genre?: string;

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
   @IsInt()
      rating?: number;
}