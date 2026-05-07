import { DecodedIdToken } from 'firebase-admin/auth';
import { AppDataSource } from '../data-source.js';
import { User } from '../entities/User.js';
import { UserUpdateDTO } from '../dto/UserUpdateDTO.js';

export class UsersService {
   static async getFirebaseUser(firebaseId: string): Promise<User | null> {
      const user = await AppDataSource.getRepository(User)
         .createQueryBuilder('user')
         .where('LOWER(user.firebaseUuid) = LOWER(:userId)', { userId: firebaseId })
         .getOne();
      return user;
   }

   static async createUserLocally(firebaseUser: DecodedIdToken): Promise<User> {
      const repo = AppDataSource.getRepository(User);

      const newUser = repo.create({
         firebaseUuid: firebaseUser.uid,
         email: firebaseUser.email ?? '',
         displayName: firebaseUser.name ?? null
      });

      return repo.save(newUser);
   }

   static async correctLocalEmail(firebaseEmail: string, firebaseId: string) {
      const currentUser = await AppDataSource.getRepository(User)
         .createQueryBuilder('user')
         .where('LOWER(user.firebaseUuid) = LOWER(:userId)', { userId: firebaseId })
         .getOne();

      if (!currentUser) {
         return;
      }

      currentUser.email = firebaseEmail;
      await AppDataSource.getRepository(User).save(currentUser);
   }

   static async updateUserSettings(user: User, updatedFields: UserUpdateDTO): Promise<User> {
      user.showRealCovers = updatedFields.showRealCovers;
      return AppDataSource.getRepository(User).save(user);
   }
}