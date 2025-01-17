import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProfileProvider } from './context/ProfileContext';
import { PaymentProvider } from './context/PaymentContext';
import { ThemeProvider } from './context/ThemeContext';
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

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProfileProvider>
          <PaymentProvider>
            <Routes>
              <Route path="/welcome" element={<GetStarted />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/user-info" element={<UserInfoForm />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route 
                element={
                  <PrivateRoute>
                    <Layout />
                  </PrivateRoute>
                }
              >
                <Route path="/" element={<Dashboard />} />
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
              </Route>
              <Route path="*" element={<Navigate to="/welcome" replace />} />
            </Routes>
          </PaymentProvider>
        </ProfileProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;