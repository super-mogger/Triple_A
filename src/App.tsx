import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import GetStarted from './pages/GetStarted';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import Progress from './pages/Progress';
import DietPlan from './pages/DietPlan';
import Attendance from './pages/Attendance';
import UserInfoForm from './pages/UserInfoForm';
import Profile from './pages/Profile';
import Layout from './components/Layout';
import SignUp from './pages/SignUp';
import VerifyEmail from './pages/VerifyEmail';
import { ThemeProvider } from './context/ThemeContext';
import Workouts from './pages/Workouts';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/welcome" element={<GetStarted />} />
          <Route path="/login" element={<Login />} />
          <Route path="/user-info" element={<UserInfoForm />} />
          <Route path="/signup" element={<SignUp />} />
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
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;