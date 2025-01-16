import * as admin from 'firebase-admin';
import serviceAccount from '../config/triple-a-b8605-firebase-adminsdk-h9m98-0f803aa0e4.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
});

export const db = admin.firestore(); 