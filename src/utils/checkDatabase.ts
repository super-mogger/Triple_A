import * as admin from 'firebase-admin';
import { serviceAccount } from '../config/serviceAccount';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
  });
}

const db = admin.firestore();

async function checkDatabase() {
  try {
    // Check memberships collection
    console.log('Checking memberships collection...');
    const membershipsSnapshot = await db.collection('memberships').get();
    console.log(`Found ${membershipsSnapshot.size} memberships`);
    
    membershipsSnapshot.forEach(doc => {
      console.log('Membership document:', {
        id: doc.id,
        data: doc.data()
      });
    });

    // Check specific membership fields
    const membershipDocs = membershipsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Check for field name inconsistencies
    membershipDocs.forEach(doc => {
      const fields = Object.keys(doc);
      console.log('Fields in membership document:', fields);
      
      // Check for snake_case vs camelCase
      const snakeCaseFields = fields.filter(f => f.includes('_'));
      const camelCaseFields = fields.filter(f => /[A-Z]/.test(f));
      
      if (snakeCaseFields.length > 0) {
        console.log('Snake case fields found:', snakeCaseFields);
      }
      if (camelCaseFields.length > 0) {
        console.log('Camel case fields found:', camelCaseFields);
      }
    });

  } catch (error) {
    console.error('Error checking database:', error);
  }
}

// Run the check
checkDatabase().then(() => {
  console.log('Database check complete');
  process.exit(0);
}).catch(error => {
  console.error('Error:', error);
  process.exit(1);
}); 