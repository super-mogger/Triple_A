import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import Progress from './pages/Progress';
import DietPlan from './pages/DietPlan';
import Attendance from './pages/Attendance';
import UserInfoForm from './pages/UserInfoForm';
import Profile from './pages/Profile';
import Layout from './components/Layout';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/user-info" element={<UserInfoForm />} />
        <Route element={<Layout />}>
          <Route path="/" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/progress" element={
            <PrivateRoute>
              <Progress />
            </PrivateRoute>
          } />
          <Route path="/diet" element={
            <PrivateRoute>
              <DietPlan />
            </PrivateRoute>
          } />
          <Route path="/attendance" element={
            <PrivateRoute>
              <Attendance />
            </PrivateRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;