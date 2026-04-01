# Notifications Feature - Quick Setup Guide

## Installation & Setup

### Step 1: Start the Servers
```bash
npm run dev
```
This starts both frontend (5173) and backend (5000) servers.

### Step 2: Generate Sample Data (Optional)
```bash
cd backend
node seedNotifications.js
```
Creates 6 sample notifications for testing.

### Step 3: Access the Feature

#### Option A: Via Sidebar
1. Navigate to `http://localhost:5173/dashboard`
2. Log in with: `admin` / `admin123`
3. Click "Notifications" in the sidebar

#### Option B: Direct URL
1. Go to: `http://localhost:5173/dashboard/notifications`

#### Option C: Via Top Navigation
1. Click the bell icon in the top right corner
2. Click "View All" in the notification dropdown

## What You'll See

### Notifications Page
- **URL**: `http://localhost:5173/dashboard/notifications`
- Full list of your notifications
- Search and filter options
- Pagination controls
- Mark as read / Delete actions

### Notification Badge
- **Location**: Top right corner (bell icon)
- Shows unread notification count
- Dropdown with latest 3 notifications
- Updates every 30 seconds

### Notification Types
1. **Low Stock** (warning) - Product running low on inventory
2. **Product Expiry** (error) - Product has expired
3. **Invoice Due** (warning) - Invoice payment is overdue
4. **Payment Received** (success) - Payment confirmation
5. **Field Disabled** (info) - System field disabled for sync

## API Testing (with curl)

### Get All Notifications
```bash
curl -X GET http://localhost:5000/api/notifications \
  -H "Cookie: token=YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Get Unread Notifications
```bash
curl -X GET http://localhost:5000/api/notifications/unread \
  -H "Cookie: token=YOUR_JWT_TOKEN"
```

### Mark Notification as Read
```bash
curl -X PUT http://localhost:5000/api/notifications/1/read \
  -H "Cookie: token=YOUR_JWT_TOKEN"
```

### Mark All as Read
```bash
curl -X PUT http://localhost:5000/api/notifications/all/read \
  -H "Cookie: token=YOUR_JWT_TOKEN"
```

### Delete Notification
```bash
curl -X DELETE http://localhost:5000/api/notifications/1 \
  -H "Cookie: token=YOUR_JWT_TOKEN"
```

### Get Notifications by Category
```bash
curl -X GET http://localhost:5000/api/notifications/category/low_stock \
  -H "Cookie: token=YOUR_JWT_TOKEN"
```

## Frontend Components Usage

### Import the Service
```javascript
import { notificationService } from './services/api';
```

### Fetch Notifications
```javascript
const response = await notificationService.getAll({ page: 1, limit: 20 });
console.log(response.data.data); // notifications array
```

### Get Unread Count
```javascript
const unread = await notificationService.getUnread();
console.log(unread.data.count); // number of unread
```

### Mark as Read
```javascript
await notificationService.markAsRead(notificationId);
```

### Delete Notification
```javascript
await notificationService.delete(notificationId);
```

## Backend Integration

### Create a Notification
```javascript
import notificationService from '../services/notificationService.js';

// Create low stock alert
await notificationService.notifyLowStock(userId, {
  name: 'Product Name',
  stock_quantity: 5,
  id: 1
});

// Create custom notification
await notificationService.createNotification(userId, {
  title: 'Custom Alert',
  message: 'Something happened',
  type: 'info',
  category: 'custom'
});
```

### Bulk Create
```javascript
const notifications = [
  { user_id: 1, title: 'Alert 1', message: '...', type: 'warning' },
  { user_id: 2, title: 'Alert 2', message: '...', type: 'error' }
];
await notificationService.createBulkNotifications(notifications);
```

## Troubleshooting

### Notification Badge Not Showing
1. Check browser DevTools Console for errors
2. Verify `/api/notifications/unread` returns data
3. Check user has `notifications_view` permission
4. Reload the page

### Notifications Not Appearing
1. Verify sample data was seeded: `node seedNotifications.js`
2. Check database: `SELECT COUNT(*) FROM notifications;`
3. Verify correct user_id in notifications
4. Check API endpoint: `GET /api/notifications`

### Mark as Read Not Working
1. Check browser console for errors
2. Verify notification belongs to logged-in user
3. Test with curl directly
4. Check backend logs

### Styling Issues
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+Shift+R)
3. Check CSS file was properly loaded
4. Verify no CSS conflicts

## Development Notes

### File Locations
- Frontend page: `frontend/src/pages/Notifications.jsx`
- Backend model: `backend/src/models/Notification.js`
- API service: `frontend/src/services/api.js`
- Styling: `frontend/src/styles/index.css`
- Routes: `backend/src/routes/notificationRoutes.js`

### Database Table
```sql
SELECT * FROM notifications LIMIT 10;
SELECT COUNT(*) as unread FROM notifications WHERE is_read = 0 AND user_id = 1;
SELECT * FROM notifications WHERE category = 'low_stock';
```

### Key Files Modified
- backend/src/config/database.js
- backend/src/app.js
- frontend/src/App.jsx
- frontend/src/components/layout/MainLayout.jsx
- frontend/src/components/layout/TopNav.jsx
- frontend/src/services/api.js
- frontend/src/context/LanguageContext.jsx
- frontend/src/styles/index.css

## Next Steps

### Testing Checklist
- [ ] Access notifications page
- [ ] Search for notifications
- [ ] Filter by category
- [ ] Mark as read
- [ ] Mark all as read
- [ ] Delete notification
- [ ] Check unread badge in header
- [ ] Test pagination
- [ ] Verify responsive design on mobile
- [ ] Test both English and Bengali

### Future Enhancements
- WebSocket for real-time updates
- Email notifications
- Push notifications
- Notification preferences
- Advanced search/filtering
- Notification archives

## Support

For issues or questions, check:
1. `NOTIFICATIONS.md` - Full documentation
2. Browser Developer Tools (F12)
3. Backend logs (terminal output)
4. Database (MySQL/SQLite queries)
5. GitHub issues or project documentation

---

**Last Updated**: March 31, 2025
**Status**: Ready for Production
