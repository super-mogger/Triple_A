const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, Timestamp } = require('firebase/firestore');

const firebaseConfig = {
  // Your Firebase config here
  apiKey: "AIzaSyDqcqDYwK7yVH6n0WvE-FFxrSFp7Zz8QZc",
  authDomain: "triple-a-b8605.firebaseapp.com",
  projectId: "triple-a-b8605",
  storageBucket: "triple-a-b8605.appspot.com",
  messagingSenderId: "1080982739990",
  appId: "1:1080982739990:web:c2f4c7e5f8a8f8b8e8d8d8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function createMembership() {
  const userId = '0i37VgxfNdaqBMFLY8HOYnQuvB03';
  const now = Timestamp.now();
  const endDate = Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
  
  const membershipData = {
    user_id: userId,
    plan_name: 'Premium Monthly',
    plan_id: 'monthly',
    start_date: now,
    end_date: endDate,
    is_active: true,
    amount_paid: 999,
    payment_status: 'completed',
    features: [
      'Unlimited gym access',
      'Personal trainer consultation',
      'Locker access',
      'Fitness assessment'
    ],
    created_at: now,
    updated_at: now
  };

  try {
    const membershipRef = collection(db, 'memberships');
    const docRef = await addDoc(membershipRef, membershipData);
    console.log('Membership created with ID:', docRef.id);
    process.exit(0);
  } catch (error) {
    console.error('Error creating membership:', error);
    process.exit(1);
  }
}

createMembership(); 