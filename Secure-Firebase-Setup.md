# Securing Firebase Credentials with Environment Variables

This guide will show you how to secure your Firebase credentials by using environment variables instead of hardcoding them in your application code, with specific instructions for Vercel deployment.

## Why Use Environment Variables?

- **Security**: Prevents accidental exposure of sensitive credentials in your codebase
- **Flexibility**: Makes it easy to use different configurations for development, testing, and production
- **Best Practice**: Follows the security principle of never hardcoding sensitive information

## 1. Create a .env File for Local Development

Create a `.env` file in your project root with the following variables:

```
# Firebase Configuration
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=triplea-7794b.firebaseapp.com
FIREBASE_PROJECT_ID=triplea-7794b
FIREBASE_STORAGE_BUCKET=triplea-7794b.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
FIREBASE_MEASUREMENT_ID=your-measurement-id

# Firebase Admin SDK (for server-side operations)
FIREBASE_ADMIN_PROJECT_ID=triplea-7794b
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-fbsvc@triplea-7794b.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----"
```

Make sure to add `.env` to your `.gitignore` file to prevent it from being committed to your repository:

```
# .gitignore
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

## 2. Update Firebase Initialization Code

### Client-Side Firebase Initialization

Update your client-side Firebase initialization to use environment variables:

```javascript
// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
```

### Server-Side Admin SDK Initialization

Update your Firebase Admin SDK initialization:

```javascript
// server/firebase-admin.js
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Convert the escaped newlines in the private key
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n');

const adminConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: privateKey
  })
};

const adminApp = initializeApp(adminConfig);
const adminDb = getFirestore(adminApp);

export { adminApp, adminDb };
```

## 3. Update Scripts to Use Environment Variables

Update your `admin-setup.js` and `db-init.js` scripts to use environment variables:

### admin-setup.js

```javascript
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
    console.log('You should now be able to log in to the admin dashboard.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

// Run the setup
setupAdmin();
```

### db-init.js (similar changes)

For `db-init.js`, make similar changes to use environment variables instead of hardcoded values.

## 4. Adding Environment Variables to Vercel

1. Go to your Vercel dashboard and select your project.
2. Navigate to the "Settings" tab and find the "Environment Variables" section.
3. Add each of your environment variables:

| Name | Value |
|------|-------|
| FIREBASE_API_KEY | your-api-key |
| FIREBASE_AUTH_DOMAIN | triplea-7794b.firebaseapp.com |
| FIREBASE_PROJECT_ID | triplea-7794b |
| FIREBASE_STORAGE_BUCKET | triplea-7794b.appspot.com |
| FIREBASE_MESSAGING_SENDER_ID | your-sender-id |
| FIREBASE_APP_ID | your-app-id |
| FIREBASE_MEASUREMENT_ID | your-measurement-id |
| FIREBASE_ADMIN_PROJECT_ID | triplea-7794b |
| FIREBASE_ADMIN_CLIENT_EMAIL | firebase-adminsdk-fbsvc@triplea-7794b.iam.gserviceaccount.com |
| FIREBASE_ADMIN_PRIVATE_KEY | "-----BEGIN PRIVATE KEY-----\nYour private key with newlines as \n\n-----END PRIVATE KEY-----" |

4. Make sure to check any environment-specific settings (Production, Preview, Development).
5. Click "Save" to save your environment variables.

> **Important**: For the private key in Vercel, make sure to:
> 1. Copy the entire key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
> 2. Replace actual newline characters with `\n`
> 3. Keep the quotes around the entire string

## 5. Vercel Deployment Configuration

Create or update your `vercel.json` file to ensure environment variables are properly loaded:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

## 6. Testing Environment Variables

Create a simple test route or function to verify your environment variables are being loaded correctly:

```javascript
// server/test-env.js
export function testEnvVars(req, res) {
  // Only show non-sensitive information
  const envStatus = {
    projectId: process.env.FIREBASE_PROJECT_ID ? "Configured" : "Missing",
    adminProjectId: process.env.FIREBASE_ADMIN_PROJECT_ID ? "Configured" : "Missing",
    // Add other variables you want to check
  };
  
  res.status(200).json({ status: "Environment variables check", env: envStatus });
}
```

## Security Best Practices

1. **Never commit .env files** to version control
2. **Rotate credentials** if you suspect they have been compromised
3. **Use different credentials** for development and production environments
4. **Restrict API keys** in the Firebase Console to specific domains and IP addresses
5. **Use Firebase Auth for additional authentication**

## Troubleshooting

### Missing Environment Variables
- Verify the variables are correctly set in Vercel dashboard
- For local development, make sure your .env file is in the root directory and has the correct format

### Private Key Issues
- Make sure newlines are properly escaped (`\n`)
- Ensure the entire key is enclosed in quotes
- Check for any extra spaces or characters

### Vercel Environment Issues
- You may need to redeploy your application after changing environment variables
- Try clearing browser cache if you're still seeing old configurations

By following these steps, your Firebase credentials will be securely stored in environment variables rather than hardcoded in your application, significantly improving your application's security posture. 