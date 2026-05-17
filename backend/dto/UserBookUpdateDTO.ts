import { Exclude, Expose } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsNumber, Min } from 'class-validator';

@Exclude()
export class UserBookUpdateDTO {
   @Expose()
   @IsOptional()
   @IsString()
      status?: string | null;

   @Expose()
   @IsOptional()
   @IsNumber({ maxDecimalPlaces: 1 })
      rating?: number | null;

   @Expose()
   @IsOptional()
   @IsInt()
   @Min(0)
      copies?: number;
}
