import { Request, Response } from 'express';
import { User } from '../entities/User.js';
import { UserInfoDTO } from '../dto/UserInfoDTO.js';

export class UsersController {
   static async getCurrentUser(req: Request, res: Response) {
      console.log(req.user);

      const dbUser = 

      const user = new UserInfoDTO(

      )
      res.json();
   }
}