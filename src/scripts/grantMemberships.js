const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require('../../triple-a-b8605-firebase-adminsdk-h9m98-26839558cb.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://triple-a-b8605-default-rtdb.asia-southeast1.firebasedatabase.app"
});

const db = admin.firestore();

async function grantMemberships() {
  try {
    // Get all users
    const usersSnapshot = await db.collection('users').get();
    
    // Current date for start date
    const now = admin.firestore.Timestamp.now();
    
    // Calculate end date (30 days from now)
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);
    const endTimestamp = admin.firestore.Timestamp.fromDate(endDate);

    // Process each user
    const batch = db.batch();
    
    usersSnapshot.forEach(userDoc => {
      const userId = userDoc.id;
      
      // Create membership document
      const membershipData = {
        userId: userId,
        plan_id: 'monthly',
        plan_name: 'Monthly Plan',
        amount: 699,
        start_date: now,
        end_date: endTimestamp,
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

      // Create a reference for the membership
      const membershipRef = db.collection('memberships').doc(userId);
      batch.set(membershipRef, membershipData);
    });

    // Commit the batch
    await batch.commit();
    console.log(`Successfully granted memberships to ${usersSnapshot.size} users`);

  } catch (error) {
    console.error('Error granting memberships:', error);
  } finally {
    // Exit the process
    process.exit();
  }
}

// Run the script
grantMemberships(); 