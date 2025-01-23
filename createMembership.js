const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');

// Initialize Firebase Admin with service account
const serviceAccount = require('./triple-a-b8605-firebase-adminsdk-h9m98-f92afe1544.json');
initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function createMembership() {
  const userId = 'BbYkrpcPNrarNbXCCpQd1AvUaLu2';
  const now = Timestamp.now();
  const endDate = Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
  
  const membershipData = {
    user_id: userId,
    plan_name: 'Monthly Plan',
    plan_id: 'monthly',
    start_date: now,
    end_date: endDate,
    is_active: true,
    amount_paid: 699,
    payment_status: 'completed',
    features: [
      'Access to all gym equipment',
      'Personal trainer consultation',
      'Group fitness classes',
      'Locker room access',
      'Fitness assessment'
    ],
    created_at: now,
    updated_at: now
  };

  try {
    // Create batch write
    const batch = db.batch();

    // 1. Create in memberships collection
    const membershipRef = db.collection('memberships').doc(userId);
    batch.set(membershipRef, membershipData);

    // 2. Create in user's membership subcollection
    const userMembershipRef = db.collection('users').doc(userId).collection('membership').doc('current');
    batch.set(userMembershipRef, membershipData);

    // 3. Update user's profile with membership status
    const userRef = db.collection('users').doc(userId);
    batch.update(userRef, {
      'membership_status': 'active',
      'membership_end_date': endDate,
      'membership_plan': 'monthly',
      'updated_at': now
    });

    // Commit all writes
    await batch.commit();
    console.log('Membership created and synced successfully for user:', userId);
    process.exit(0);
  } catch (error) {
    console.error('Error creating membership:', error);
    process.exit(1);
  }
}

createMembership(); 