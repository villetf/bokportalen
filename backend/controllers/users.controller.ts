import { Request, Response } from 'express';
import { User } from '../entities/User.js';
import { UserInfoDTO } from '../dto/UserInfoDTO.js';
import { UsersService } from '../services/users.services.js';
import { UserUpdateDTO } from '../dto/UserUpdateDTO.js';

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
      user.firstName = dbUser.firstName;
      user.lastName = dbUser.lastName;
      user.showRealCovers = dbUser.showRealCovers;
      user.createdAt = dbUser.createdAt;
      user.updatedAt = dbUser.updatedAt;

      res.json(user);
   }

   static async updateCurrentUser(req: Request, res: Response) {
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

      const updatedUser = await UsersService.updateUserSettings(dbUser, req.body as UserUpdateDTO);

      const user = new UserInfoDTO();
      user.id = updatedUser.id;
      user.email = updatedUser.email;
      user.firstName = updatedUser.firstName;
      user.lastName = updatedUser.lastName;
      user.showRealCovers = updatedUser.showRealCovers;
      user.createdAt = updatedUser.createdAt;
      user.updatedAt = updatedUser.updatedAt;

      res.json(user);
   }
}