import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProfileProvider } from './context/ProfileContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import GetStarted from './pages/GetStarted';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import Progress from './pages/Progress';
import DietPlan from './pages/DietPlan';
import DietPlanDetails from './pages/DietPlanDetails';
import Attendance from './pages/Attendance';
import UserInfoForm from './pages/UserInfoForm';
import Profile from './pages/Profile';
import SignUp from './pages/SignUp';
import VerifyEmail from './pages/VerifyEmail';
import Workouts from './pages/Workouts';
import ProfileEdit from './pages/ProfileEdit';
import MembershipDetails from './pages/MembershipDetails';
import Achievements from './pages/Achievements';
import Settings from './pages/Settings';
import NotificationSettings from './pages/NotificationSettings';
import PrivacyAndSecurity from './pages/PrivacyAndSecurity';
import { useEffect } from 'react';
import { NotificationProvider } from './context/NotificationContext';
import { PrivacyProvider } from './context/PrivacyContext';
import HelpAndSupport from './pages/HelpAndSupport';
import { MembershipProvider } from './context/MembershipContext';

function AppRoutes() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#121212] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600 dark:text-gray-400">Loading your profile...</p>
        </div>
      </div>
    );
  }
  
  return (
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
      </Route>

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/welcome" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <NotificationProvider>
      <ThemeProvider>
        <AuthProvider>
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
        </AuthProvider>
      </ThemeProvider>
    </NotificationProvider>
  );
}

export default App;