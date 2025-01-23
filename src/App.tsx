import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProfileProvider } from './context/ProfileContext';
import { PaymentProvider } from './context/PaymentContext';
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
import PaymentHistory from './pages/PaymentHistory';
import Achievements from './pages/Achievements';
import Settings from './pages/Settings';
import PaymentTest from './components/PaymentTest';
import { useEffect } from 'react';

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
      <Route path="/welcome" element={user ? <Navigate to="/dashboard" replace /> : <GetStarted />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <SignUp />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      
      {/* Protected routes */}
      <Route path="/user-info" element={
        <PrivateRoute>
          <UserInfoForm />
        </PrivateRoute>
      } />
      
      <Route element={
        <PrivateRoute>
          <Layout />
        </PrivateRoute>
      }>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/workouts" element={<Workouts />} />
        <Route path="/diet" element={<DietPlan />} />
        <Route path="/diet/plan-details" element={<DietPlanDetails />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/edit" element={<ProfileEdit />} />
        <Route path="/membership" element={<MembershipDetails />} />
        <Route path="/payment-history" element={<PaymentHistory />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/payment-test" element={<PaymentTest />} />
      </Route>

      {/* Catch-all route */}
      <Route path="*" element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/welcome" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProfileProvider>
          <PaymentProvider>
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
          </PaymentProvider>
        </ProfileProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;