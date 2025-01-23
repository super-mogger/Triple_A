const admin = require('firebase-admin');
const path = require('path');

// Get the service account key path
const serviceAccountPath = path.join(process.cwd(), 'triple-a-b8605-firebase-adminsdk-h9m98-26839558cb.json');
const serviceAccount = require(serviceAccountPath);

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://triple-a-b8605-default-rtdb.asia-southeast1.firebasedatabase.app"
});

const db = admin.firestore();

async function initializeCollections() {
  try {
    console.log('Initializing attendance collections...');
    
    // Create attendance collection with a sample document
    const attendanceRef = db.collection('attendance');
    await attendanceRef.doc('sample').set({
      userId: 'sample',
      date: new Date(),
      time: '00:00:00',
      status: 'present',
      createdAt: new Date()
    });
    console.log('Created attendance collection');

    // Create attendanceStats collection with a sample document
    const statsRef = db.collection('attendanceStats');
    await statsRef.doc('sample').set({
      userId: 'sample',
      totalPresent: 0,
      totalAbsent: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastAttendance: null,
      lastUpdated: new Date()
    });
    console.log('Created attendanceStats collection');

    // Delete the sample documents
    await attendanceRef.doc('sample').delete();
    await statsRef.doc('sample').delete();
    console.log('Cleaned up sample documents');

    console.log('Successfully initialized attendance collections!');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing collections:', error);
    process.exit(1);
  }
}

initializeCollections(); 