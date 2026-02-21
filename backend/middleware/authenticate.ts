import { Request, Response, NextFunction } from 'express';
import { auth } from '../firebaseAdmin.js';

export async function authenticate(
   req: Request,
   res: Response,
   next: NextFunction
): Promise<void> {
   const header = req.headers.authorization;
   if (!header?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Missing token' });
   }

   const token = header.split(' ')[1];

   try {
      const decodedToken = await auth.verifyIdToken(token);

      req.user = decodedToken;
      if (!req.user.email_verified) {
         return res.status(403).json({ message: 'Email not verified' });
      }
      next();
   } catch (error) {
      console.error('Authentication error while verifying token', {
         error,
         path: req.path,
         method: req.method,
      });
      return res.status(401).json({ message: 'Invalid token' });
   }
}