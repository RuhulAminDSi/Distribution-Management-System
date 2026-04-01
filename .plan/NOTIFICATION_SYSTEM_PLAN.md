# Notification System Implementation Plan

## Overview
Connect the existing but disconnected notification system end-to-end, integrate it with business workflows, and add real-time synchronization with the database.

---

## Current State Analysis

### What Already Exists ✅
- **Backend**: Full CRUD (model, service, controller, routes)
- **Frontend**: Notifications.jsx page with filtering, pagination, mark-as-read, delete
- **TopNav**: Bell icon with dropdown (hardcoded data)
- **Helper methods**: `notifyLowStock`, `notifyExpiredProduct`, `notifyInvoiceDue`, `notifyPaymentReceived`

### Critical Gaps ❌
1. `notifications` table NOT created in `database.js`
2. Notification routes NOT registered in `app.js`
3. `notificationService` NOT exported from `api.js`
4. No route for `/dashboard/notifications` in `App.jsx`
5. Notification helpers NEVER called (no triggers in business workflows)
6. TopNav badge is hardcoded "3"
7. Settings toggles are cosmetic only
8. No scheduled job for periodic scanning

---

## Implementation Plan

### Phase 1: Infrastructure & Wiring (Quick Fixes) ✅ COMPLETED

#### 1.1 Database - Add Notifications Table
**File:** `backend/src/config/database.js`

Added to `initializeDatabase()` after the `purchase_order_items` table:
```sql
CREATE TABLE IF NOT EXISTS notifications (
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

#### 1.2 Backend - Register Notification Routes
**File:** `backend/src/app.js`

Added import and route registration:
```javascript
import notificationRoutes from './routes/notificationRoutes.js';
app.use('/api/notifications', notificationRoutes);
```

#### 1.3 Frontend - Add Notification Service to API
**File:** `frontend/src/services/api.js`

Added export:
```javascript
export const notificationService = {
  getAll: (params) => api.get('/notifications', { params }),
  getUnread: () => api.get('/notifications/unread'),
  getById: (id) => api.get(`/notifications/${id}`),
  getByCategory: (category, params) => api.get(`/notifications/category/${category}`, { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/all/read'),
  delete: (id) => api.delete(`/notifications/${id}`)
};
```

#### 1.4 Frontend - Add Route for Notifications Page
**File:** `frontend/src/App.jsx`

Added route inside the dashboard section:
```jsx
<Route path="/dashboard/notifications" element={<Notifications />} />
```

#### 1.5 Frontend - Add to Sidebar Navigation
**File:** `frontend/src/components/layout/MainLayout.jsx`

Added to `navItems` array (after dashboard):
```javascript
{ path: '/dashboard/notifications', icon: Bell, labelKey: 'Notifications', permission: null },
```

#### 1.6 Frontend - Add Translation Keys
**File:** `frontend/src/context/LanguageContext.jsx`

Added 14 translation keys for both EN and BN:
- Notifications, MarkAllAsRead, SearchNotifications, NoNotifications
- LowStock, ProductExpiry, InvoiceDue, PaymentReceived, FieldDisabled
- AllNotifications, EntriesPerPage, Of, Previous, Next

---

### Phase 2: Business Workflow Integration (Trigger Notifications)

#### 2.1 Invoice Creation → Notify Due Invoices
**File:** `backend/src/services/invoiceService.js`

In the `create` method, after invoice creation:
- If `status === 'due'` or `status === 'partial'`:
  - Get all users with `payments_view` or `sales_view` permission
  - Call `notificationService.notifyInvoiceDue(userId, invoice)` for each

#### 2.2 Payment Recording → Notify Payment Received
**File:** `backend/src/services/paymentService.js`

In the `create` method, after payment creation:
- Get users with `payments_view` permission
- Call `notificationService.notifyPaymentReceived(userId, payment)` for each

#### 2.3 Stock Updates → Notify Low Stock
**File:** `backend/src/services/productService.js` or `backend/src/services/stockService.js`

After any stock operation that reduces quantity:
- Check if `stock_quantity <= low_stock_alert`
- If yes, get users with `products_view` permission
- Call `notificationService.notifyLowStock(userId, product)` for each

#### 2.4 Product Expiry → Notify Expired/Expiring Products
**File:** `backend/src/services/productService.js`

On product update or via scheduled check:
- Check if `expiry_date <= CURDATE()` AND `stock_quantity > 0`
- If yes, get users with `products_view` permission
- Call `notificationService.notifyExpiredProduct(userId, product)` for each

---

### Phase 3: TopNav Real-Time Badge & Dropdown

#### 3.1 Fetch Real Unread Count
**File:** `frontend/src/components/layout/TopNav.jsx`

Replace hardcoded badge with API call:
```javascript
const [unreadCount, setUnreadCount] = useState(0);
const [recentNotifs, setRecentNotifs] = useState([]);

useEffect(() => {
  fetchUnreadNotifications();
  const interval = setInterval(fetchUnreadNotifications, 30000);
  return () => clearInterval(interval);
}, []);

const fetchUnreadNotifications = async () => {
  try {
    const res = await notificationService.getUnread();
    setUnreadCount(res.data.count);
    setRecentNotifs(res.data.notifications.slice(0, 3));
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
  }
};
```

#### 3.2 Update Dropdown to Show Real Data
Replace hardcoded notification items with `recentNotifs` state.
Update "Mark all read" button to call `notificationService.markAllAsRead()`.

#### 3.3 Badge Visibility
Show badge only when `unreadCount > 0`, hide otherwise.

---

### Phase 4: Settings Toggle Persistence

#### 4.1 Create Notification Preferences Table
**File:** `backend/src/config/database.js`

```sql
CREATE TABLE IF NOT EXISTS notification_preferences (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  low_stock_alert TINYINT DEFAULT 1,
  expiry_alert TINYINT DEFAULT 1,
  payment_reminder TINYINT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_prefs (user_id)
);
```

#### 4.2 Backend API for Preferences
**File:** `backend/src/routes/notificationRoutes.js`

Add endpoints:
- `GET /api/notifications/preferences` - Get user preferences
- `PUT /api/notifications/preferences` - Update user preferences

**File:** `backend/src/controllers/notificationController.js`

Add handlers for get/update preferences.

#### 4.3 Frontend Settings Integration
**File:** `frontend/src/pages/Settings.jsx`

- Add state for notification preferences
- Fetch preferences on mount
- Save on toggle change
- Use preferences to filter which notifications are created

---

### Phase 5: Scheduled Notification Scanner

#### 5.1 Create Notification Scanner Service
**File:** `backend/src/services/notificationScanner.js`

New file with scheduled checks:
```javascript
export const notificationScanner = {
  async scanLowStock() {
    // Find products where stock_quantity <= low_stock_alert
    // Create notifications for users with products_view permission
  },
  
  async scanExpiredProducts() {
    // Find products where expiry_date <= CURDATE() AND stock_quantity > 0
    // Create notifications for users with products_view permission
  },
  
  async scanDueInvoices() {
    // Find invoices with status = 'due' or 'partial'
    // Create notifications for users with payments_view permission
  },
  
  async cleanupOldNotifications() {
    // Delete notifications older than 30 days
    await notificationService.cleanupOldNotifications(30);
  }
};
```

#### 5.2 Schedule with setInterval
**File:** `backend/src/server.js`

Add after server start:
```javascript
import { notificationScanner } from './services/notificationScanner.js';

// Run every 5 minutes
setInterval(async () => {
  try {
    await notificationScanner.scanLowStock();
    await notificationScanner.scanExpiredProducts();
    await notificationScanner.scanDueInvoices();
  } catch (error) {
    console.error('Notification scanner error:', error);
  }
}, 5 * 60 * 1000);

// Cleanup old notifications daily
setInterval(async () => {
  try {
    await notificationScanner.cleanupOldNotifications();
  } catch (error) {
    console.error('Notification cleanup error:', error);
  }
}, 24 * 60 * 60 * 1000);
```

---

### Phase 6: Dashboard Summary Enhancement

#### 6.1 Add Notification Count to Dashboard
**File:** `backend/src/services/dashboardService.js`

Add to `getSummary()`:
```javascript
const unreadCount = await Notification.countUnread(req.user.id);
```

Return in summary:
```javascript
{
  // ... existing data
  notifications: {
    unread: unreadCount
  }
}
```

#### 6.2 Frontend Dashboard Display
**File:** `frontend/src/pages/Dashboard.jsx`

Add notification stat card showing unread count with link to notifications page.

---

## File Change Summary

| File | Action | Description |
|------|--------|-------------|
| `backend/src/config/database.js` | ✅ Modified | Added notifications table |
| `backend/src/app.js` | ✅ Modified | Registered notification routes |
| `backend/src/server.js` | Pending | Add scheduled scanner |
| `backend/src/services/notificationScanner.js` | Pending | Create - Scheduled notification checks |
| `backend/src/services/invoiceService.js` | Pending | Add notification triggers |
| `backend/src/services/paymentService.js` | Pending | Add notification triggers |
| `backend/src/services/productService.js` | Pending | Add notification triggers |
| `backend/src/controllers/notificationController.js` | Pending | Add preference endpoints |
| `backend/src/routes/notificationRoutes.js` | Pending | Add preference routes |
| `frontend/src/services/api.js` | ✅ Modified | Added notificationService export |
| `frontend/src/App.jsx` | ✅ Modified | Added /dashboard/notifications route |
| `frontend/src/components/layout/MainLayout.jsx` | ✅ Modified | Added notifications to sidebar |
| `frontend/src/components/layout/TopNav.jsx` | Pending | Real-time badge + dropdown |
| `frontend/src/pages/Notifications.jsx` | Pending | Minor fixes if needed |
| `frontend/src/pages/Settings.jsx` | Pending | Connect notification toggles |
| `frontend/src/pages/Dashboard.jsx` | Pending | Add notification stat card |
| `frontend/src/context/LanguageContext.jsx` | ✅ Modified | Added 14 translation keys |

---

## Testing Checklist

- [x] Notifications table created on startup
- [x] `/api/notifications` endpoints registered
- [x] `/dashboard/notifications` page accessible
- [x] Sidebar shows Notifications link
- [ ] TopNav bell shows real unread count
- [ ] Creating invoice with due status generates notification
- [ ] Recording payment generates notification
- [ ] Low stock product generates notification
- [ ] Expired product generates notification
- [ ] Mark as read works
- [ ] Mark all as read works
- [ ] Delete notification works
- [ ] Category filtering works
- [ ] Settings toggles persist
- [ ] Scheduled scanner runs every 5 minutes
- [ ] Old notifications cleaned up after 30 days

---

## Priority Order

1. **Phase 1** - Infrastructure ✅ COMPLETED
2. **Phase 3** - TopNav badge (user-facing, high visibility)
3. **Phase 2** - Workflow triggers (core functionality)
4. **Phase 5** - Scheduled scanner (automation)
5. **Phase 4** - Settings persistence (nice-to-have)
6. **Phase 6** - Dashboard enhancement (polish)

---

## Estimated Effort

- Phase 1: ~15 minutes ✅ DONE
- Phase 2: ~30 minutes (integrate into 3 services)
- Phase 3: ~20 minutes (TopNav updates)
- Phase 4: ~25 minutes (preferences system)
- Phase 5: ~30 minutes (scanner + scheduling)
- Phase 6: ~15 minutes (dashboard card)

**Total: ~2.25 hours**
