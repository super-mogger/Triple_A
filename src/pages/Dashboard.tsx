import { Dumbbell, LogOut, Utensils, Activity, QrCode } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NavLink } from 'react-router-dom';
import MetricCard from '../components/MetricCard';
import WorkoutCard from '../components/WorkoutCard';

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Dumbbell className="h-8 w-8 text-emerald-600" />
              <span className="ml-2 text-xl font-semibold text-gray-900">Fitness Tracker</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{user?.email}</span>
              <button
                onClick={logout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-semibold text-gray-900">Welcome to your Dashboard</h1>
          <p className="mt-2 text-gray-600">Your fitness journey starts here.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            <MetricCard
              title="Calories Burned"
              value="500"
              target="1000"
              icon={Activity}
              color="bg-emerald-500"
              progress={50}
              unit="kcal"
            />
            <MetricCard
              title="Steps"
              value="8000"
              target="10000"
              icon={Dumbbell}
              color="bg-blue-500"
              progress={80}
              unit="steps"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            <WorkoutCard
              title="Morning Yoga"
              icon={Utensils}
              duration="30 mins"
              exercises={5}
              color="bg-purple-500"
            />
            <WorkoutCard
              title="Evening Run"
              icon={QrCode}
              duration="45 mins"
              exercises={1}
              color="bg-red-500"
            />
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto flex justify-around">
          <NavLink to="/diet" className="flex flex-col items-center text-gray-600 hover:text-emerald-600">
            <Utensils className="w-6 h-6" />
            <span className="text-sm">Diet Plan</span>
          </NavLink>
          <NavLink to="/progress" className="flex flex-col items-center text-gray-600 hover:text-emerald-600">
            <Activity className="w-6 h-6" />
            <span className="text-sm">Progress</span>
          </NavLink>
          <NavLink to="/attendance" className="flex flex-col items-center text-gray-600 hover:text-emerald-600">
            <QrCode className="w-6 h-6" />
            <span className="text-sm">Attendance</span>
          </NavLink>
        </div>
      </footer>
    </div>
  );
}