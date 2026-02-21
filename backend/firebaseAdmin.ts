import admin, { ServiceAccount } from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();
const serviceAccount = JSON.parse(
   process.env.FIREBASE_SERVICE_ACCOUNT as string
);

admin.initializeApp({
   credential: admin.credential.cert(serviceAccount as ServiceAccount),
});

export const auth = admin.auth();