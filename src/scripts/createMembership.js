const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin with service account
const serviceAccount = require('../../triple-a-b8605-firebase-adminsdk-h9m98-26839558cb.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://triple-a-b8605-default-rtdb.asia-southeast1.firebasedatabase.app"
});

const db = admin.firestore();

async function createMembership(userId) {
  try {
    const now = admin.firestore.Timestamp.now();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30); // 30 days from now

    const membershipData = {
      userId: userId,
      plan_id: 'monthly',
      plan_name: 'Monthly Plan',
      amount: 699,
      start_date: now,
      end_date: admin.firestore.Timestamp.fromDate(endDate),
      status: 'active',
      features: [
        'Access to gym equipment',
        'Personal trainer consultation',
        'Group fitness classes',
        'Locker room access',
        'Fitness assessment'
      ],
      created_at: now,
      updated_at: now,
      is_active: true,
      payment_status: 'completed'
    };

    // Create membership document with userId as the document ID
    await db.collection('memberships').doc(userId).set(membershipData);
    console.log(`Successfully created membership for user: ${userId}`);

  } catch (error) {
    console.error('Error creating membership:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Get userId from command line argument
const userId = process.argv[2];
if (!userId) {
  console.error('Please provide a user ID');
  process.exit(1);
}

createMembership(userId); 