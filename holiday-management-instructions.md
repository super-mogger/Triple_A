# Adding Holiday Management to TripleA-Admin App

## 1. Fix App.tsx Error

First, fix the TripleA-Admin/src/App.tsx file by removing the problematic imports:

```typescript
// Remove this line
import ProtectedRoute from './components/ProtectedRoute';
```

This will fix the redeclaration error since the ProtectedRoute component is already defined inside App.tsx.

## 2. Add Holiday Management to Settings Modal

In `TripleA-Admin/src/components/Layout.tsx`, locate the Settings modal section (around line 390) and add the Holiday Management option right before the Logout button:

```jsx
{/* Find this section in the file */}
{userRole === 'admin' && (
  <button
    onClick={() => {
      navigate('/admin/settings');
      setIsSettingsModalOpen(false);
    }}
    className={`block w-full text-left px-4 py-3 rounded-md transition-colors ${
      isDarkMode 
        ? 'text-gray-300 hover:bg-gray-700' 
        : 'text-gray-700 hover:bg-gray-100'
    }`}
  >
    <div className="flex items-center">
      <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      Admin Settings
    </div>
  </button>
)}

{/* Add this new Holiday Management button right here */}
{userRole === 'admin' && (
  <button
    onClick={() => {
      navigate('/admin/holidays');
      setIsSettingsModalOpen(false);
    }}
    className={`block w-full text-left px-4 py-3 rounded-md transition-colors ${
      isDarkMode 
        ? 'text-gray-300 hover:bg-gray-700' 
        : 'text-gray-700 hover:bg-gray-100'
    }`}
  >
    <div className="flex items-center">
      <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      Holiday Management
    </div>
  </button>
)}

{/* This is the logout button that should appear after the options above */}
<button
  onClick={handleSignOut}
  className={`block w-full text-left px-4 py-3 rounded-md transition-colors ${
    isDarkMode 
      ? 'text-red-400 hover:bg-gray-700' 
      : 'text-red-600 hover:bg-gray-100'
  }`}
>
```

## 3. Confirm the Route is Defined

The route should already be defined in App.tsx:

```jsx
<Route
  path="/admin/holidays"
  element={
    <ProtectedRoute>
      <Layout>
        <AdminHolidays />
      </Layout>
    </ProtectedRoute>
  }
/>
```

## 4. Test the Changes

After making these changes:
1. Start the application
2. Log in as an admin user
3. Click the Settings icon in the header
4. You should see the "Holiday Management" option in the dropdown menu
5. Clicking it should take you to the Holiday Management page

These changes will allow admin users to easily access the holiday management functionality. 