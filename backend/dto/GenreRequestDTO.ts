import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class GenreRequestDTO {
   @Expose()
   @IsString()
      name!: string;
}
