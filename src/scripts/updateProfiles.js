const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin with service account
const serviceAccount = require('../../triple-a-b8605-firebase-adminsdk-h9m98-26839558cb.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://triple-a-b8605-default-rtdb.asia-southeast1.firebasedatabase.app"
  });
}

const db = admin.firestore();
const auth = admin.auth();

async function updateProfilesAndRemoveUsers() {
  try {
    // Get all profiles
    const profilesSnapshot = await db.collection('profiles').get();
    
    // Update each profile with auth data
    const batch = db.batch();
    
    for (const doc of profilesSnapshot.docs) {
      try {
        // Get user data from Firebase Auth
        const userRecord = await auth.getUser(doc.id);
        const existingData = doc.data();
        
        const profileRef = db.collection('profiles').doc(doc.id);
        const updateData = {
          // Auth data
          email: userRecord.email || doc.id + '@gmail.com',
          username: userRecord.displayName || 'user_' + doc.id.substring(0, 6),
          photoURL: userRecord.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + doc.id,
          
          // Personal info
          personal_info: {
            height: existingData.personal_info?.height || 170,
            weight: existingData.personal_info?.weight || 70,
            gender: existingData.personal_info?.gender || 'male',
            date_of_birth: existingData.personal_info?.date_of_birth || '2000-01-01',
            blood_type: existingData.personal_info?.blood_type || 'O+',
            contact: existingData.personal_info?.contact || ''
          },
          
          // Medical info
          medical_info: {
            conditions: existingData.medical_info?.conditions || ''
          },
          
          // Preferences
          preferences: {
            activity_level: existingData.preferences?.activity_level || 'beginner',
            dietary_preferences: existingData.preferences?.dietary_preferences || ['High-Protein'],
            workout_preferences: existingData.preferences?.workout_preferences || ['Strength Training'],
            fitness_goals: existingData.preferences?.fitness_goals || ['Build Muscle']
          },
          
          // Stats
          stats: {
            bmi: existingData.stats?.bmi || calculateBMI(
              existingData.personal_info?.height || 170,
              existingData.personal_info?.weight || 70
            ),
            activity_level: existingData.stats?.activity_level || 'beginner'
          },
          
          // Metadata
          created_at: existingData.created_at || admin.firestore.FieldValue.serverTimestamp(),
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        };

        batch.update(profileRef, updateData);
        console.log(`Updated profile for user: ${doc.id} with email: ${userRecord.email}`);
      } catch (error) {
        console.error(`Error getting auth data for user ${doc.id}:`, error);
        // If we can't get auth data, use default values
        const profileRef = db.collection('profiles').doc(doc.id);
        const existingData = doc.data();
        
        batch.update(profileRef, {
          email: doc.id + '@gmail.com',
          username: 'user_' + doc.id.substring(0, 6),
          photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + doc.id,
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    }

    // Execute the batch update
    await batch.commit();
    console.log('Successfully updated all profiles');

    // Delete the users collection
    const usersSnapshot = await db.collection('users').get();
    const usersBatch = db.batch();
    
    usersSnapshot.docs.forEach(doc => {
      usersBatch.delete(doc.ref);
    });

    await usersBatch.commit();
    console.log('Successfully removed users collection');

  } catch (error) {
    console.error('Error updating profiles:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Helper function to calculate BMI
function calculateBMI(height, weight) {
  // Convert height to meters
  const heightInMeters = height / 100;
  // Calculate BMI
  return (weight / (heightInMeters * heightInMeters)).toFixed(1);
}

updateProfilesAndRemoveUsers(); 