import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
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

async function initializeDatabase() {
  try {
    console.log('Starting database initialization...');

    // Create initial workout plans
    await db.collection('workout_plans').doc('sample_plan').set({
      name: 'Beginner Fitness Plan',
      description: 'A balanced plan for beginners',
      level: 'beginner',
      created_at: FieldValue.serverTimestamp(),
      exercises: [
        {
          name: 'Push-ups',
          sets: 3,
          reps: 10,
          rest: 60,
          description: 'Standard push-ups with proper form'
        },
        {
          name: 'Squats',
          sets: 3,
          reps: 15,
          rest: 60,
          description: 'Bodyweight squats with proper form'
        }
      ]
    });
    console.log('Workout plans collection initialized');

    // Create memberships collection
    await db.collection('memberships').doc('basic').set({
      name: 'Basic',
      price: 29.99,
      duration: 30, // in days
      description: 'Basic gym access',
      features: ['Gym access', 'Locker rooms'],
      created_at: FieldValue.serverTimestamp()
    });
    
    await db.collection('memberships').doc('premium').set({
      name: 'Premium',
      price: 49.99,
      duration: 30, // in days
      description: 'Premium membership with additional benefits',
      features: ['Gym access', 'Locker rooms', 'Group classes', 'Sauna access'],
      created_at: FieldValue.serverTimestamp()
    });
    console.log('Memberships collection initialized');

    // Create attendance collection structure
    const attendanceRef = db.collection('attendance').doc('info');
    await attendanceRef.set({
      description: 'Collection for storing member attendance records',
      created_at: FieldValue.serverTimestamp()
    });
    console.log('Attendance collection structure initialized');

    // Create trainer assignments collection structure
    const trainerAssignmentsRef = db.collection('trainerAssignments').doc('info');
    await trainerAssignmentsRef.set({
      description: 'Collection for storing active trainer-member assignments',
      created_at: FieldValue.serverTimestamp()
    });
    console.log('Trainer assignments collection structure initialized');

    // Create trainer requests collection structure
    const trainerRequestsRef = db.collection('trainerRequests').doc('info');
    await trainerRequestsRef.set({
      description: 'Collection for storing requests from members for trainer assignments',
      created_at: FieldValue.serverTimestamp()
    });
    console.log('Trainer requests collection structure initialized');

    // Create profiles collection (sample member)
    await db.collection('profiles').doc('sample_member').set({
      email: 'member@example.com',
      name: 'Sample Member',
      role: 'member',
      membership: 'basic',
      membership_start: FieldValue.serverTimestamp(),
      membership_end: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
      phone: '+9199999999',
      created_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp()
    });

    // Create profiles collection (sample trainer)
    await db.collection('profiles').doc('sample_trainer').set({
      email: 'trainer@example.com',
      name: 'Sample Trainer',
      role: 'trainer',
      specialization: 'Weight Training',
      phone: '+9188888888',
      created_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp()
    });
    console.log('Profiles collection initialized');

    // Create a sample trainer assignment
    await db.collection('trainerAssignments').doc('sample_assignment').set({
      trainerId: 'sample_trainer',
      memberId: 'sample_member',
      trainerEmail: 'trainer@example.com',
      memberEmail: 'member@example.com',
      status: 'active',
      assignedAt: FieldValue.serverTimestamp(),
      notes: 'Sample trainer assignment'
    });
    console.log('Sample trainer assignment created');

    console.log('✅ Database initialization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeDatabase(); 