# Triple A Fitness App

A comprehensive gym and fitness management application built with React, TypeScript, and Firebase.

## Development Log

### [2024-03-20 14:30 UTC]

Initial documentation of existing application structure and features.

## Core Features

- Authentication System (Firebase)
- User Profile Management
- Workout Management
- Membership & Payment System (Razorpay)
- Attendance Tracking (QR Based)
- Achievement System

## Technical Stack

### Frontend
- React
- TypeScript
- Tailwind CSS
- React Router DOM

### Backend
- Firebase Authentication
- Firebase Firestore
- Firebase Cloud Functions

### Payment Processing
- Razorpay Integration

### Additional Features
- Face Detection for Profile Photos
- QR Code Scanning for Attendance
- Real-time Updates
- Theme Support (Light/Dark)

## Data Models

### Profile Structure
```typescript
interface Profile {
  id: string;
  user_id: string;
  email: string;
  username: string;
  photoURL?: string;
  personal_info: {
    gender: 'male' | 'female';
    date_of_birth: string;
    height: number;
    weight: number;
    contact: string;
    blood_type?: string;
  };
  medical_info: {
    conditions: string;
  };
  preferences: {
    dietary: string[];
    workout_days: string[];
    fitness_goals: string[];
    fitness_level: string;
    activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';
  };
  created_at: Timestamp;
  updated_at: Timestamp;
}
```

## Application Flow

1. **User Entry**
   - Welcome Page
   - Login/Signup
   - Email Verification

2. **Profile Setup**
   - Personal Information
   - Medical Information
   - Fitness Preferences
   - Profile Photo Upload

3. **Main Features**
   - Dashboard
   - Workout Management
   - Diet Planning
   - Attendance Tracking
   - Profile Management
   - Membership Management

## Component Structure

### Authentication Components
- Login
- SignUp
- VerifyEmail
- PrivateRoute

### Layout Components
- Header
- Navigation
- Layout
- ErrorBoundary

### Feature Components
- WorkoutCard
- PaymentPlans
- QRScanner
- StreakCounter
- ProfileSetupModal

### Context Providers
- AuthContext: Authentication state management
- ProfileContext: User profile data management
- ThemeContext: Application theme management

## Future Updates and Changes
[Changes will be logged here with date and time stamps]

---

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/Triple_A.git
cd Triple_A
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up Firebase
   - Create a new Firebase project in the [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication (Email/Password and Google Sign-in)
   - Enable Firestore Database
   - Enable Storage (for profile pictures)
   - Add a Web App to your Firebase project
   - Copy the Firebase configuration

4. Create a `.env` file in the root directory:
```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

5. Set up Firestore Security Rules:
```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isAdmin() {
      return isAuthenticated() && request.auth.token.admin == true;
    }

    function isUserOwned(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Validate payment data
    function isValidPayment() {
      let data = request.resource.data;
      return data.keys().hasAll(['amount', 'currency', 'status', 'userId', 'planId', 'createdAt', 'paymentMethod']) &&
        data.userId == request.auth.uid &&
        data.currency == 'INR' &&
        (data.status in ['completed', 'failed', 'cancelled']) &&
        (data.planId in ['monthly', 'quarterly', 'yearly']) &&
        data.paymentMethod == 'razorpay' &&
        data.amount is number &&
        data.amount > 0;
    }

    // Global admin access
    match /{document=**} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }

    // User data rules
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isUserOwned(userId) || isAdmin();
      
      match /membership/{document=**} {
        allow read: if isUserOwned(userId) || isAdmin();
        allow write: if isUserOwned(userId) || isAdmin();
      }
    }

    // Payment rules
    match /payments/{paymentId} {
      allow read: if isAuthenticated() && 
        (resource.data.userId == request.auth.uid || isAdmin());
      allow create: if isAuthenticated() && 
        (isValidPayment() || isAdmin());
      allow update, delete: if isAdmin();
    }

    // Profile rules
    match /profiles/{userId} {
      allow read: if isAuthenticated();
      allow create: if isUserOwned(userId);
      allow update: if isUserOwned(userId) || isAdmin();
      allow delete: if isAdmin();
    }

    // Membership rules
    match /memberships/{membershipId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }

    // Payment history rules
    match /payment-history/{userId} {
      allow read: if isUserOwned(userId) || isAdmin();
      
      match /transactions/{transactionId} {
        allow read: if isUserOwned(userId) || isAdmin();
      }
    }

    // Attendance rules
    match /attendance/{attendanceId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }

    // Attendance stats rules
    match /attendanceStats/{document} {
      allow read, write: if isAuthenticated() && 
        (request.auth.uid == resource.data.userId || 
         request.auth.uid == request.resource.data.userId || 
         isAdmin());
    }
  }
}
```

### Important Security Rules Notes:

1. **Admin Privileges**
   - Admins have full read/write access to all documents
   - Admin status is determined by a custom claim `admin` in the auth token

2. **User Access**
   - Users can read their own data
   - Users can create and update their own profiles
   - Only admins can delete profiles

3. **Payment Security**
   - Strict validation for payment data
   - Only admins can modify or delete payment records
   - Users can only read their own payment history

4. **Membership Management**
   - All authenticated users can read membership details
   - Only admins can modify membership records

5. **Attendance System**
   - All authenticated users can read attendance records
   - Only admins can write attendance records
   - Users can access their own attendance stats

6. Start the development server
```bash
npm start
# or
yarn start
```

### Firebase Deployment

1. Install Firebase CLI
```bash
npm install -g firebase-tools
```

2. Login to Firebase
```bash
firebase login
```

3. Initialize Firebase project
```bash
firebase init
```

4. Deploy to Firebase
```bash
firebase deploy
```

## Troubleshooting

### Common Issues

1. **Firebase Permission Errors**
   - Ensure you're signed in
   - Check if security rules are properly configured
   - Verify the user has the necessary permissions
   - Check if the document path matches the security rules

2. **Authentication Issues**
   - Verify Firebase configuration in `.env`
   - Ensure Authentication providers are enabled in Firebase Console
   - Check if the user's email is verified (if required)

3. **Membership Access Issues**
   - Confirm user is authenticated
   - Verify membership document exists
   - Check if userId in membership document matches current user
   - Review security rules for memberships collection

## Contributing

[To be added: Contribution guidelines]

## License

[To be added: License information]

