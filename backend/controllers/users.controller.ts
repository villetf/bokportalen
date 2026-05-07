import { Request, Response } from 'express';
import { User } from '../entities/User.js';
import { UserInfoDTO } from '../dto/UserInfoDTO.js';
import { UsersService } from '../services/users.services.js';

export class UsersController {
   static async getCurrentUser(req: Request, res: Response) {
      if (!req.user) {
         res.status(401).json({ message: 'No user found' });
         return;
      }

      const firebaseUser = req.user;
      let dbUser: User | null;
      dbUser = await UsersService.getFirebaseUser(firebaseUser.uid);

      if (!dbUser) {
         dbUser = await UsersService.createUserLocally(firebaseUser);
      }

      if (firebaseUser.email && dbUser.email !== firebaseUser.email) {
         await UsersService.correctLocalEmail(firebaseUser.email, firebaseUser.uid);
         dbUser.email = firebaseUser.email;
      }

      const user = new UserInfoDTO();
      user.id = dbUser.id;
      user.email = dbUser.email;
      user.displayName = dbUser.displayName;
      user.showRealCovers = dbUser.showRealCovers;
      user.createdAt = dbUser.createdAt;
      user.updatedAt = dbUser.updatedAt;

      res.json(user);
   }
}