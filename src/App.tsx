import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProfileProvider } from './context/ProfileContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import { NotificationProvider, useNotification } from './context/NotificationContext';
import { PrivacyProvider } from './context/PrivacyContext';
import { MembershipProvider } from './context/MembershipContext';
import { useEffect } from 'react';
import AdminHolidays from './pages/AdminHolidays';

// Lazy load components
const Layout = lazy(() => import('./components/Layout'));
const GetStarted = lazy(() => import('./pages/GetStarted'));
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const PrivateRoute = lazy(() => import('./components/PrivateRoute'));
const Progress = lazy(() => import('./pages/Progress'));
const DietPlan = lazy(() => import('./pages/DietPlan'));
const DietPlanDetails = lazy(() => import('./pages/DietPlanDetails'));
const Attendance = lazy(() => import('./pages/Attendance'));
const UserInfoForm = lazy(() => import('./pages/UserInfoForm'));
const Profile = lazy(() => import('./pages/Profile'));
const SignUp = lazy(() => import('./pages/SignUp'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const Workouts = lazy(() => import('./pages/Workouts'));
const ProfileEdit = lazy(() => import('./pages/ProfileEdit'));
const MembershipDetails = lazy(() => import('./pages/MembershipDetails'));
const Achievements = lazy(() => import('./pages/Achievements'));
const Settings = lazy(() => import('./pages/Settings'));
const NotificationSettings = lazy(() => import('./pages/NotificationSettings'));
const PrivacyAndSecurity = lazy(() => import('./pages/PrivacyAndSecurity'));
const HelpAndSupport = lazy(() => import('./pages/HelpAndSupport'));
const Trainers = lazy(() => import('./pages/Trainers'));

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-[#121212] flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
      <p className="text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
  </div>
);

// Component to initialize water reminders
function WaterReminderInitializer() {
  const { user } = useAuth();
  const { notifications } = useNotification();
  
  useEffect(() => {
    const initializeWaterReminders = async () => {
      if (!user?.uid || !notifications.waterReminders) return;
      
      try {
        // Dynamically import to reduce bundle size
        const waterRemindersModule = await import('./hooks/useWaterReminders');
        
        // Use the dedicated initialization hook instead
        const InitializerComponent = () => {
          waterRemindersModule.useInitializeWaterReminders();
          return null;
        };
        
        // Temporarily mount the component to initialize
        const container = document.createElement('div');
        document.body.appendChild(container);
        
        // Clean up the temporary element
        return () => {
          document.body.removeChild(container);
        };
      } catch (error) {
        console.error('Error initializing water reminders:', error);
      }
    };
    
    initializeWaterReminders();
  }, [user?.uid, notifications.waterReminders]);
  
  return null; // This component doesn't render anything
}

function AppRoutes() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Navigate to="/welcome" replace />} />
        <Route path="/welcome" element={user ? <Navigate to="/dashboard" replace /> : <GetStarted />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <SignUp />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        
        {/* Protected routes without Layout */}
        <Route path="/user-info" element={
          <PrivateRoute>
            <UserInfoForm />
          </PrivateRoute>
        } />
        <Route path="/privacy" element={
          <PrivateRoute>
            <PrivacyAndSecurity />
          </PrivateRoute>
        } />
        <Route path="/support" element={
          <PrivateRoute>
            <HelpAndSupport />
          </PrivateRoute>
        } />
        
        {/* Protected routes with Layout */}
        <Route element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/workouts" element={<Workouts />} />
          <Route path="/diet" element={<DietPlan />} />
          <Route path="/diet/plan-details" element={<DietPlanDetails />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<ProfileEdit />} />
          <Route path="/membership" element={<MembershipDetails />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/notifications" element={<NotificationSettings />} />
          <Route path="/trainers" element={<Trainers />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin">
          <Route path="holidays" element={<AdminHolidays />} />
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/welcome" replace />} />
      </Routes>
      
      {/* Initialize water reminders */}
      <WaterReminderInitializer />
    </Suspense>
  );
}

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <ProfileProvider>
              <MembershipProvider>
                <PrivacyProvider>
                  <Toaster 
                    position="top-right"
                    toastOptions={{
                      duration: 4000,
                      style: {
                        background: '#333',
                        color: '#fff',
                      }
                    }}
                  />
                  <AppRoutes />
                </PrivacyProvider>
              </MembershipProvider>
            </ProfileProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </Suspense>
  );
}

export default App;