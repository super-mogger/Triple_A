# AdminDashboard Holiday Management Integration

Follow these steps to enhance your existing AdminDashboard with holiday management features:

## 1. Import the Holiday Service

Add this import to the top of `src/pages/AdminDashboard.tsx`:

```typescript
import { Calendar } from 'lucide-react';
import { getAllHolidays, getUpcomingHolidays } from '../services/HolidayService';
```

## 2. Add a State for Upcoming Holidays

Add this state variable with your other state declarations:

```typescript
const [upcomingHolidays, setUpcomingHolidays] = useState<number>(0);
```

## 3. Create a Function to Fetch Holiday Data

Add this function to fetch holiday count:

```typescript
// Function to fetch upcoming holidays
const fetchUpcomingHolidays = async () => {
  try {
    const holidays = await getUpcomingHolidays(60); // Get holidays for next 60 days
    setUpcomingHolidays(holidays.length);
  } catch (error) {
    console.error('Error fetching upcoming holidays:', error);
  }
};
```

## 4. Call the Function on Component Mount

Update your useEffect that runs on component mount:

```typescript
useEffect(() => {
  // Your existing code
  fetchUpcomingHolidays();
}, []);
```

## 5. Add Holiday Card to Stats Section

Add this card to your stats section, alongside your existing stats cards:

```jsx
{/* Upcoming Holidays Card */}
<div 
  className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} overflow-hidden shadow-sm rounded-xl transition-all hover:shadow-md cursor-pointer`}
  onClick={() => navigate('/admin/holidays')}
>
  <div className="p-6">
    <div className="flex items-center">
      <div className={`rounded-xl p-3 ${isDarkMode ? 'bg-amber-900/40' : 'bg-amber-100'}`}>
        <Calendar className={`h-6 w-6 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />
      </div>
      <div className="ml-5 w-0 flex-1">
        <dt className={`text-sm font-medium truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Upcoming Holidays</dt>
        <dd className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{upcomingHolidays}</dd>
      </div>
    </div>
  </div>
</div>
```

## 6. Add Quick Actions Section

Add this function to render quick action buttons after the member table:

```typescript
// Render additional actions or quick links section after the member table
const renderAdditionalActions = () => {
  return (
    <div className="my-8">
      <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => navigate('/admin/users')}
          className={`flex flex-col items-center p-4 ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} rounded-xl shadow-sm border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} transition-colors`}
        >
          <div className={`p-3 rounded-lg mb-3 ${isDarkMode ? 'bg-emerald-900/30' : 'bg-emerald-100'}`}>
            <Users className={`w-5 h-5 ${isDarkMode ? 'text-emerald-500' : 'text-emerald-600'}`} />
          </div>
          <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Manage Users</span>
        </button>
        
        <button
          onClick={() => navigate('/admin/membership')}
          className={`flex flex-col items-center p-4 ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} rounded-xl shadow-sm border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} transition-colors`}
        >
          <div className={`p-3 rounded-lg mb-3 ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
            <CreditCard className={`w-5 h-5 ${isDarkMode ? 'text-blue-500' : 'text-blue-600'}`} />
          </div>
          <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Memberships</span>
        </button>
        
        <button
          onClick={() => navigate('/admin/holidays')}
          className={`flex flex-col items-center p-4 ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} rounded-xl shadow-sm border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} transition-colors`}
        >
          <div className={`p-3 rounded-lg mb-3 ${isDarkMode ? 'bg-amber-900/30' : 'bg-amber-100'}`}>
            <Calendar className={`w-5 h-5 ${isDarkMode ? 'text-amber-500' : 'text-amber-600'}`} />
          </div>
          <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Holiday Management</span>
        </button>
        
        <button
          onClick={() => navigate('/admin/settings')}
          className={`flex flex-col items-center p-4 ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} rounded-xl shadow-sm border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} transition-colors`}
        >
          <div className={`p-3 rounded-lg mb-3 ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
            <Settings className={`w-5 h-5 ${isDarkMode ? 'text-purple-500' : 'text-purple-600'}`} />
          </div>
          <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Admin Settings</span>
        </button>
      </div>
    </div>
  );
};
```

## 7. Add the Quick Actions to the Render

At the end of your render function, before the closing `</div>`, add:

```jsx
{renderAdditionalActions()}
```

## 8. Update Import for Additional Icons

If not already imported, add these imports to your Lucide icons:

```typescript
import { Calendar, CreditCard, Settings } from 'lucide-react';
```

## Result

These changes will:
1. Display the number of upcoming holidays in the dashboard stats
2. Add a Quick Actions section with links to key admin functions
3. Make the Holiday Management feature easily accessible
4. Maintain your existing dashboard functionality and design

The Holiday Management card will be clickable and take admins directly to the holiday management page. 