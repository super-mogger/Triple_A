# Setting Up Environment Variables in Vercel for Triple-A Project

This guide will walk you through the process of securely setting up your Firebase credentials and other environment variables in Vercel for the Triple-A Gym Management application.

## Prerequisites

- A Vercel account connected to your GitHub repository
- Your Firebase project configuration details
- The Firebase Admin SDK service account key

## Step 1: Prepare Your Environment Variables

Collect all the required environment variables from your Firebase project. You'll need:

### Firebase Client SDK Variables
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN` 
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`

### Firebase Admin SDK Variables
- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`

## Step 2: Format Your Private Key for Vercel

The Firebase Admin SDK private key needs special formatting for Vercel:

1. Open your service account key JSON file
2. Find the `private_key` field
3. Copy the entire key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
4. Replace all newline characters with `\n`
5. Make sure to enclose the entire key in quotes

For example, transform this:
```
"private_key": "-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC/Q69N+IQXaZJp
...more lines...
C5vsfyNLDyzqYI7Bt3jVug==
-----END PRIVATE KEY-----"
```

Into this:
```
"-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC/Q69N+IQXaZJp\n...more lines...\nC5vsfyNLDyzqYI7Bt3jVug==\n-----END PRIVATE KEY-----"
```

## Step 3: Add Environment Variables in Vercel

1. Log in to the [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your Triple-A project
3. Go to "Settings" > "Environment Variables"
4. Add each variable one by one:

| Name | Value | Environments |
|------|-------|--------------|
| VITE_FIREBASE_API_KEY | your-api-key | Production, Preview, Development |
| VITE_FIREBASE_AUTH_DOMAIN | triplea-7794b.firebaseapp.com | Production, Preview, Development |
| VITE_FIREBASE_PROJECT_ID | triplea-7794b | Production, Preview, Development |
| VITE_FIREBASE_STORAGE_BUCKET | triplea-7794b.appspot.com | Production, Preview, Development |
| VITE_FIREBASE_MESSAGING_SENDER_ID | your-sender-id | Production, Preview, Development |
| VITE_FIREBASE_APP_ID | your-app-id | Production, Preview, Development |
| VITE_FIREBASE_MEASUREMENT_ID | your-measurement-id | Production, Preview, Development |
| FIREBASE_ADMIN_PROJECT_ID | triplea-7794b | Production, Preview, Development |
| FIREBASE_ADMIN_CLIENT_EMAIL | firebase-adminsdk-fbsvc@triplea-7794b.iam.gserviceaccount.com | Production, Preview, Development |
| FIREBASE_ADMIN_PRIVATE_KEY | "-----BEGIN PRIVATE KEY-----\nYour formatted private key\n-----END PRIVATE KEY-----" | Production, Preview, Development |

5. Click "Save" after adding each variable

## Step 4: Deploy Your Application

1. Make sure your code is using environment variables as shown in the updated configuration files
2. Commit and push your changes to GitHub
3. Vercel will automatically deploy your application with the new environment variables

## Step 5: Verify Environment Variables

After deployment, verify that your environment variables are working correctly:

1. Check the Vercel deployment logs for any errors
2. Test authentication, Firestore operations, and any admin functionality
3. If you've implemented the environment variable testing endpoint, use it to verify the configuration

## Troubleshooting

### Private Key Issues

If you're having trouble with the Firebase Admin SDK private key:

1. **Double-check the format:** Make sure all newlines are replaced with `\n` and the key is enclosed in quotes
2. **Check for special characters:** Ensure any special characters are properly escaped
3. **Verify in logs:** Check your function logs for any "invalid private key" errors

### Missing Variables

If some environment variables aren't being loaded:

1. **Check naming:** Make sure the variable names match exactly what your code is looking for
2. **Verify scope:** Ensure variables are available in the correct environments (Production/Preview/Development)
3. **Redeploy if needed:** Sometimes a fresh deployment is needed after adding new variables

### Authentication Problems

If Firebase authentication isn't working:

1. **API restrictions:** Check if your Firebase API key has domain restrictions in the Firebase Console
2. **Auth methods:** Verify that the authentication methods you're using are enabled in Firebase

## Security Best Practices

1. **Use environment-specific variables:** Consider using different Firebase projects or configurations for development and production
2. **Rotate keys regularly:** Update your Firebase Admin SDK service account key periodically
3. **Use preview branches:** Take advantage of Vercel's preview environments to test environment variable changes
4. **Monitor usage:** Set up Firebase alerts for unusual authentication or database activity

By following these steps, your Triple-A application should have securely configured Firebase credentials in Vercel, protecting your sensitive keys while allowing full functionality of your application. 