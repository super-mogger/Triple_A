import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Convert the escaped newlines in the private key
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n');

// Initialize Firebase Admin SDK
const adminConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: privateKey
  })
};

initializeApp(adminConfig);
const db = getFirestore();

async function setupAdmin() {
  try {
    // Create admin collection and add the user as an admin
    await db.collection('admins').doc('admin1').set({
      email: process.env.ADMIN_EMAIL || 'rawatamit446@gmail.com',
      name: process.env.ADMIN_NAME || 'Amit Rawat',
      role: 'admin',
      created_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp()
    });
    
    console.log('Admin user created successfully!');
    console.log(`Admin email: ${process.env.ADMIN_EMAIL || 'rawatamit446@gmail.com'}`);
    console.log('You should now be able to log in to the admin dashboard.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

// Run the setup
setupAdmin(); 