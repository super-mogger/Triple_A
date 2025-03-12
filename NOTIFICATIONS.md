# Triple A Notification System

This document provides an overview of the notification system implemented in the Triple A fitness app.

## Notification Types

The app supports several types of notifications:

1. **Workout Reminders** - Reminders for scheduled workouts
2. **Membership Updates** - Information about membership status changes
3. **New Features** - Announcements about new app features
4. **Progress Alerts** - Notifications about user progress and achievements
5. **Special Offers** - Promotional offers and discounts
6. **Water Reminders** - Reminders to maintain hydration

## Testing Notifications

The app includes a notification testing panel that allows you to test each type of notification. This can be accessed from the **Notification Settings** page.

### How to Test Notifications

1. Navigate to the Notification Settings page
2. Scroll down to the "Test Notifications" section
3. Ensure you have granted notification permissions if prompted
4. Click on any of the test buttons to trigger a sample notification

### Scheduled Notifications

The system also supports scheduling notifications for future delivery:

1. **Workout Reminders** - You can schedule a test workout reminder for 1 minute in the future using the dedicated button
2. **Check Scheduled Notifications** - This button will manually check for any pending scheduled notifications and trigger them if it's time

## Implementation Details

The notification system uses:

1. Browser Notification API for web notifications
2. React-Hot-Toast as a fallback for unsupported browsers
3. Local storage for tracking scheduled notifications

## Troubleshooting

If notifications aren't working:

1. **Browser Permissions** - Ensure you've granted notification permissions to the site
2. **Notification Settings** - Check that the notification type is enabled in the settings
3. **Browser Support** - Make sure your browser supports the Notification API
4. **Focus** - Some browsers may not show notifications when the app is in focus

## For Developers

The notification system is implemented with the following components:

- `NotificationContext.tsx` - Provides the notification context to the app
- `useNotification.tsx` - Hook for consuming the notification context
- `useNotificationManager.tsx` - Hook for managing different notification types
- `NotificationTester.ts` - Utility for testing notifications
- `NotificationTesterPanel.tsx` - UI component for testing notifications

Scheduled notifications are stored in local storage and checked when the app loads and when manually triggered. 