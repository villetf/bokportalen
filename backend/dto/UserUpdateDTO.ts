import { Exclude, Expose } from 'class-transformer';
import { IsBoolean } from 'class-validator';

@Exclude()
export class UserUpdateDTO {
   @Expose()
   @IsBoolean()
      showRealCovers!: boolean;
}