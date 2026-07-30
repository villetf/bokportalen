import admin, { ServiceAccount } from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const serviceAccount = JSON.parse(
   fs.readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH!, 'utf8')
);

admin.initializeApp({
   credential: admin.credential.cert(serviceAccount as ServiceAccount),
});

export const auth = admin.auth();