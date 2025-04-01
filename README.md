# Triple A Fitness App

A comprehensive gym and fitness management application built with React, TypeScript, and Firebase.

## Latest Updates (April 2024)

- **Workout Plans Integration**: Added integration with trainer-created workout plans
- **Enhanced Profile Photos**: Improved profile photo management across all applications
- **Real-time Data Synchronization**: Better real-time updates between admin and member apps
- **Member Verification System**: Added ability to verify member identities with visual indicators
- **Aadhaar Card Management**: Enhanced document capture and storage for member verification
- **Profile Data Synchronization**: Improved data flow between admin app and main member app

## Development Log

### [2024-04-15 10:30 UTC]

- Added integration with trainer-created workout plans
- Enhanced profile photo management and display
- Improved real-time data synchronization between apps
- Enhanced responsive design for better mobile experience

### [2024-03-01 09:15 UTC]

- Added user verification feature that displays verification status on the user profile
- Improved profile data synchronization with the admin app
- Enhanced Aadhaar card document verification system
- Added support for admin-controlled profile photo updates
- Fixed photo synchronization between Firebase Auth and Firestore

### [2024-03-20 14:30 UTC]

Initial documentation of existing application structure and features.

## Core Features

- Authentication System (Firebase)
- User Profile Management
- Workout Management
- Membership & Payment System (Razorpay)
- Attendance Tracking (QR Based)
- Achievement System
- User Verification System
- Admin-Member Data Synchronization
- Identity Document Management

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
- Member Verification System

## Data Models

### Profile Structure
```typescript
interface Profile {
  id: string;
  user_id: string;
  email: string;
  username: string;
  photoURL?: string;
  avatar_url?: string;
  personal_info: {
    gender: 'male' | 'female' | 'other';
    date_of_birth: string;
    height: number;
    weight: number;
    contact: string;
    blood_type: string;
  };
  medical_info: {
    conditions: string;
  };
  preferences: {
    dietary_preferences: string[];
    workout_preferences: string[];
    fitness_goals: string[];
    fitness_level: string;
    activity_level: 'beginner' | 'intermediate' | 'advanced' | 'moderate' | 'light' | 'sedentary' | 'active' | 'veryActive';
    dietary: string[];
    workout_time: string;
    workout_days: string[];
  };
  stats: {
    workouts_completed: number;
    total_time: number;
    calories_burned: number;
    attendance_streak: number;
  };
  // Admin-synced fields
  aadhaarCardFrontURL?: string;
  aadhaarCardBackURL?: string;
  isVerified?: boolean;
  address?: string;
  emergencyContact?: string;
  notes?: string;
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
   - Profile Photo Upload (Admin-managed)

3. **Main Features**
   - Dashboard
   - Workout Management
   - Diet Planning
   - Attendance Tracking
   - Profile Management
   - Membership Management
   - Verification Status

## Integration with Admin App

The Triple A Fitness App works in conjunction with an admin dashboard (TripleA-Admin) to provide a complete gym management system:

1. **Shared Data Structure**
   - Profiles and membership information are synchronized between both applications
   - Admin app can verify users and update profile photos
   - Member identity documents are managed by the admin application

2. **Security Model**
   - Firestore security rules control what data can be modified by members vs. administrators
   - Certain fields (photos, verification status) can only be modified by admins
   - Normal members have read-only access to verification-related fields

3. **Data Synchronization**
   - Real-time updates via Firebase ensure changes made in either app are reflected quickly
   - Automatic periodic refresh of profile data even without page reload
   - Firebase Authentication used as single source of truth for basic user data

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
- UserInfoCard (with verification badge)

### Context Providers
- AuthContext: Authentication state management
- ProfileContext: User profile data management
- ThemeContext: Application theme management

## Future Updates and Changes
[Changes will be logged here with date and time stamps]

---

## Installation and Running the App

### Prerequisites
- Node.js (v16 or newer)
- npm (v7 or newer)
- Git

### Installation Steps
1. Clone the repository:
   ```
   git clone https://github.com/yourusername/Triple_A.git
   cd Triple_A
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   
   **For Unix/Mac/Git Bash:**
   ```
   npm run dev
   ```
   
   **For Windows PowerShell:**
   ```
   npm run dev-win
   ```
   
   **Alternatives for Windows:**
   - Double-click the `start-dev.bat` file in the project root
   - Right-click on `start-dev.ps1` and select "Run with PowerShell"
   - Run `.\start-dev.ps1` in PowerShell (may require execution policy change)

4. Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal).

### Building for Production
   
   **For Unix/Mac/Git Bash:**
   ```
   npm run build
   ```
   
   **For Windows PowerShell:**
   ```
   npm run build-win
   ```

## Deployment

The application can be deployed to platforms like Vercel, Netlify, or Firebase Hosting. 

For Firebase Hosting:

```bash
npm install -g firebase-tools
firebase login
firebase init
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

