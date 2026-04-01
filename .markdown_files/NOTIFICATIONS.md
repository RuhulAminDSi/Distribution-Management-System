# Notifications Feature Documentation

## Overview
The notifications feature provides users with real-time alerts and updates about important events in the Distribution Management System. Users can view, manage, and track notifications for various system events.

## Features

### 1. Notification Types
- **Low Stock Alerts**: Notifies when product stock falls below alert threshold
- **Product Expiry Alerts**: Alerts when products are expired or expiring soon
- **Invoice Due**: Notifies about overdue invoices
- **Payment Received**: Confirms when payments are received
- **Field Disabled**: Notifies when system fields are disabled (for synchronization)

### 2. Notification States
- **Unread**: New notifications that haven't been marked as read
- **Read**: Notifications that have been viewed by the user
- **Categorized**: Notifications are organized by type/category

### 3. User Interface

#### Notifications Page (`/dashboard/notifications`)
- Full notification list with pagination (10/20/50/100 per page)
- Search functionality to find specific notifications
- Filter by notification type/category
- Mark individual notifications as read/delete
- Mark all notifications as read at once
- Status badges with color coding

#### Notification Badge (Top Navigation)
- Real-time unread notification count badge on the bell icon
- Notification dropdown showing latest 3 unread notifications
- Quick action to mark all as read from dropdown
- Link to full notifications page

## Database Schema

### Notifications Table
```sql
CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('info', 'warning', 'error', 'success') DEFAULT 'info',
  category VARCHAR(50),
  reference_type VARCHAR(50),
  reference_id INT,
  is_read TINYINT DEFAULT 0,
  action_url VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_read (user_id, is_read),
  INDEX idx_created_at (created_at)
);
```

## Backend Implementation

### Models (`backend/src/models/Notification.js`)
- `findByUser(userId, page, limit)` - Get paginated notifications for user
- `getUnread(userId)` - Get unread notifications
- `markAsRead(notificationId, userId)` - Mark single notification as read
- `markAllAsRead(userId)` - Mark all user notifications as read
- `getByCategory(userId, category, page, limit)` - Filter by category
- `deleteOlderThan(days)` - Cleanup old notifications

### Service (`backend/src/services/notificationService.js`)
- `createNotification(userId, data)` - Create single notification
- `createBulkNotifications(notifications)` - Create multiple notifications
- `getUserNotifications(userId, page, limit)` - Fetch paginated list
- `getUnreadNotifications(userId)` - Get unread count and preview
- `markNotificationAsRead(userId, notificationId)` - Mark as read
- `markAllNotificationsAsRead(userId)` - Mark all as read
- `deleteNotification(userId, notificationId)` - Delete notification
- Helper methods:
  - `notifyLowStock(userId, product)` - Create low stock alert
  - `notifyExpiredProduct(userId, product)` - Create expiry alert
  - `notifyInvoiceDue(userId, invoice)` - Create invoice due alert
  - `notifyPaymentReceived(userId, payment)` - Create payment received alert
  - `notifyDisabledFieldUpdate(affectedUserIds, fieldData)` - Sync disabled fields

### Controller (`backend/src/controllers/notificationController.js`)
- `getNotifications(req, res)` - List user notifications with pagination
- `getUnread(req, res)` - Get unread count and preview
- `getDetail(req, res)` - Get single notification details
- `markAsRead(req, res)` - Mark as read
- `markAllAsRead(req, res)` - Mark all as read
- `delete(req, res)` - Delete notification
- `getByCategory(req, res)` - Filter by category

### Routes (`backend/src/routes/notificationRoutes.js`)
```
GET    /api/notifications              - Get all notifications (paginated)
GET    /api/notifications/unread       - Get unread count and preview
GET    /api/notifications/:id          - Get notification details
GET    /api/notifications/category/:category - Get by category
PUT    /api/notifications/:id/read     - Mark as read
PUT    /api/notifications/all/read     - Mark all as read
DELETE /api/notifications/:id          - Delete notification
```

## Frontend Implementation

### Notification Service (`frontend/src/services/api.js`)
```javascript
notificationService.getAll(params)           // Get all notifications
notificationService.getUnread()              // Get unread count
notificationService.getDetail(id)            // Get single notification
notificationService.markAsRead(id)           // Mark as read
notificationService.markAllAsRead()          // Mark all as read
notificationService.delete(id)               // Delete notification
notificationService.getByCategory(category)  // Filter by category
```

### Notifications Page (`frontend/src/pages/Notifications.jsx`)
- Displays full notification list with table view
- Pagination controls (10/20/50/100 entries per page)
- Search functionality
- Category filtering dropdown
- Mark as read/delete actions for each notification
- Status icons and badges based on notification type
- Empty state when no notifications

### TopNav Component Updates
- Real-time unread notification badge
- Notification dropdown with latest unread notifications
- Fetches unread count every 30 seconds
- Links to full notifications page

### Styling (`frontend/src/styles/index.css`)
- `.notification-item` - Individual notification styling
- `.notification-unread` - Highlight unread notifications
- `.notification-icon` - Icon container with type-based coloring
- `.notification-header` - Title and badge layout
- `.notification-footer` - Metadata (time, category)
- `.btn-icon` - Action buttons (mark read, delete)
- Responsive design for mobile devices

### Translations
English and Bengali translations for all notification-related UI elements:
- Navigation labels
- Filter options
- Button labels
- Category names
- Empty states

## Usage Examples

### Create a Notification (from other services)
```javascript
import notificationService from '../services/notificationService.js';

// Create low stock notification
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
  category: 'custom',
  reference_type: 'document',
  reference_id: 123,
  action_url: '/path/to/resource'
});
```

### Get Notifications (Frontend)
```javascript
import { notificationService } from './services/api.js';

// Get paginated notifications
const response = await notificationService.getAll({ page: 1, limit: 20 });

// Get unread notifications
const unread = await notificationService.getUnread();

// Filter by category
const stockAlerts = await notificationService.getByCategory('low_stock', { 
  page: 1, 
  limit: 10 
});
```

## Permissions

New permission added to the system:
- `notifications_view` - View notifications (added to all roles)

All user roles have access to view notifications:
- system_admin
- admin
- manager
- salesman
- accountant
- driver
- loader

## Integration with Disabled Fields Sync

The notification system is designed to sync disabled field information across pages:

1. When a field is disabled (e.g., in Settings page), a notification is created
2. All affected users receive a "Field Disabled" notification
3. The notification includes:
   - Field name
   - Reference to settings page
   - Timestamp for tracking

Users can view these notifications in the Notifications page to stay updated on system configuration changes.

## Data Cleanup

Old notifications are automatically cleaned up via the `cleanupOldNotifications(days)` method:
```javascript
// Delete notifications older than 30 days
await notificationService.cleanupOldNotifications(30);
```

This can be scheduled as a cron job in production.

## Testing

### Seeding Sample Notifications
Run the seed script to generate sample notifications:
```bash
node seedNotifications.js
```

This creates 6 sample notifications for the admin user with various types and read states.

### Manual Testing Checklist
- [ ] Navigate to `/dashboard/notifications`
- [ ] Verify notification list loads
- [ ] Test search functionality
- [ ] Test category filtering
- [ ] Test mark as read (single)
- [ ] Test mark all as read
- [ ] Test delete notification
- [ ] Test pagination
- [ ] Verify unread badge in top navigation updates
- [ ] Check notification dropdown in header
- [ ] Test responsiveness on mobile

## Performance Considerations

1. **Indexes**: Optimized indexes on `user_id` and `is_read` for quick queries
2. **Pagination**: All list endpoints support pagination to limit data transfer
3. **Caching**: Unread count cached client-side and refreshed every 30 seconds
4. **Cleanup**: Old notifications automatically deleted after 30 days
5. **Lazy Loading**: Notifications dropdown shows only latest 3 items

## Future Enhancements

- Push notifications (browser/mobile)
- Email notifications for critical alerts
- Notification preferences (enable/disable by type)
- Notification templates with variables
- Notification scheduling and delayed sending
- WebSocket real-time updates
- Notification archives
- Notification statistics/reports

## File Structure

```
Distribution Management/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   └── Notification.js
│   │   ├── services/
│   │   │   └── notificationService.js
│   │   ├── controllers/
│   │   │   └── notificationController.js
│   │   ├── routes/
│   │   │   └── notificationRoutes.js
│   │   ├── config/
│   │   │   └── database.js (updated with notifications table)
│   │   └── app.js (updated with notification routes)
│   └── seedNotifications.js
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   └── Notifications.jsx
    │   ├── components/
    │   │   └── layout/
    │   │       ├── MainLayout.jsx (updated with notifications route)
    │   │       └── TopNav.jsx (updated with notification badge)
    │   ├── services/
    │   │   └── api.js (updated with notificationService)
    │   ├── context/
    │   │   └── LanguageContext.jsx (updated with translations)
    │   ├── styles/
    │   │   └── index.css (updated with notification styles)
    │   └── App.jsx (updated with notifications route)
```

## Support & Troubleshooting

### Common Issues

1. **Notification badge not showing**
   - Check network tab in browser DevTools
   - Verify `/api/notifications/unread` endpoint is accessible
   - Check user permissions (notifications_view)

2. **Notifications not appearing**
   - Verify notification creation code is called
   - Check database for notification records
   - Verify user_id is correct

3. **Mark as read not working**
   - Check browser console for errors
   - Verify notification belongs to logged-in user
   - Check API response status

### Debug Tips
- Enable browser DevTools Network tab to monitor API calls
- Check backend logs for service errors
- Use database tools to verify notifications are being created
- Test API endpoints directly with curl/Postman

## API Response Examples

### Get All Notifications
```json
{
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "title": "Low Stock Alert",
      "message": "Product X is running low",
      "type": "warning",
      "category": "low_stock",
      "reference_type": "product",
      "reference_id": 5,
      "is_read": 0,
      "action_url": "/products?id=5",
      "created_at": "2025-03-31 10:30:00",
      "updated_at": "2025-03-31 10:30:00"
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

### Get Unread Notifications
```json
{
  "count": 3,
  "notifications": [
    {
      "id": 1,
      "title": "Low Stock Alert",
      "message": "Product X is running low",
      "type": "warning",
      "category": "low_stock",
      "is_read": 0,
      "created_at": "2025-03-31 10:30:00"
    }
  ]
}
```
