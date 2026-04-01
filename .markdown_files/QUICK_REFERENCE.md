# NOTIFICATIONS FEATURE - QUICK REFERENCE

## 🎯 URLs

| Feature | URL |
|---------|-----|
| Notifications Page | `http://localhost:5173/dashboard/notifications` |
| Frontend Dev | `http://localhost:5173` |
| Backend API | `http://localhost:5000/api` |
| Notifications API | `http://localhost:5000/api/notifications` |

## 👤 Default Login
- **Username**: `admin`
- **Password**: `admin123`

## 📍 Access Points

### 1. Sidebar Navigation
- Click **"Notifications"** menu item (Bell icon)

### 2. Top Navigation Badge
- Click **bell icon** → dropdown with latest notifications

### 3. Direct Navigation
- Type `/dashboard/notifications` in URL

## 🧪 Generate Test Data
```bash
cd backend
node seedNotifications.js
```

## 📡 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/notifications` | List notifications |
| GET | `/api/notifications/unread` | Get unread count |
| GET | `/api/notifications/:id` | Get details |
| PUT | `/api/notifications/:id/read` | Mark as read |
| PUT | `/api/notifications/all/read` | Mark all read |
| DELETE | `/api/notifications/:id` | Delete |
| GET | `/api/notifications/category/:cat` | Filter by type |

## 📁 Key Files

### Backend
- Model: `backend/src/models/Notification.js`
- Service: `backend/src/services/notificationService.js`
- Controller: `backend/src/controllers/notificationController.js`
- Routes: `backend/src/routes/notificationRoutes.js`

### Frontend
- Page: `frontend/src/pages/Notifications.jsx`
- Service: `frontend/src/services/api.js` (notificationService)
- Navigation: `frontend/src/components/layout/MainLayout.jsx`
- Header: `frontend/src/components/layout/TopNav.jsx`

## 🎨 Notification Types

| Type | Color | Category |
|------|-------|----------|
| Info | Blue | `field_disabled` |
| Warning | Yellow | `low_stock`, `invoice_due` |
| Error | Red | `product_expiry` |
| Success | Green | `payment_received` |

## 🔑 Permissions

- **Permission Name**: `notifications_view`
- **Applied To**: All user roles
- **Required For**: Accessing notifications features

## 🗄️ Database

### Table: `notifications`
```sql
SELECT * FROM notifications;
SELECT COUNT(*) FROM notifications WHERE is_read = 0;
SELECT * FROM notifications WHERE user_id = 1;
SELECT * FROM notifications WHERE category = 'low_stock';
```

## 🚀 Quick Start

```bash
# 1. Start servers
npm run dev

# 2. Log in
# Username: admin, Password: admin123

# 3. Generate test data (optional)
cd backend && node seedNotifications.js

# 4. Visit notifications
# http://localhost:5173/dashboard/notifications
```

## 📚 Documentation

| File | Size | Purpose |
|------|------|---------|
| NOTIFICATIONS.md | 13 KB | Complete documentation |
| NOTIFICATIONS_SUMMARY.md | 8 KB | Implementation overview |
| NOTIFICATIONS_QUICKSTART.md | 6 KB | Setup guide |
| FINAL_STATUS_REPORT.md | - | Current status |
| BUG_FIX_REPORT.md | - | Syntax fix details |

## ✅ Testing Checklist

- [ ] Access `/dashboard/notifications`
- [ ] See notification list
- [ ] Search for notifications
- [ ] Filter by category
- [ ] Mark single notification as read
- [ ] Mark all as read
- [ ] Delete notification
- [ ] Check pagination
- [ ] View badge in header
- [ ] Open notification dropdown
- [ ] Verify responsive design
- [ ] Test English/Bengali switch

## 🔧 Common Commands

```bash
# Start dev servers
npm run dev

# Build frontend
npm run build

# Seed test data
cd backend && node seedNotifications.js

# Check syntax (frontend)
npm run build

# View database
mysql -u root dms_db
> SELECT * FROM notifications;
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Page doesn't load | Check console errors (F12) |
| No notifications | Run seed script |
| Badge doesn't update | Reload page |
| Can't mark as read | Check permissions |
| API errors | Verify backend running |

## 💾 Important Files

**Don't forget to check:**
- `frontend/src/context/LanguageContext.jsx` ✅ (Fixed)
- `frontend/src/App.jsx` ✅ (Routes updated)
- `backend/src/app.js` ✅ (Routes integrated)
- `backend/src/config/database.js` ✅ (Table created)

## 📊 Feature Status

✅ Database - Complete
✅ Backend API - Complete  
✅ Frontend Page - Complete
✅ Navigation - Complete
✅ Styling - Complete
✅ Translations - Complete
✅ Documentation - Complete
✅ Build - Passing
✅ Server - Running

## 🎯 Current Status

🟢 **FULLY OPERATIONAL AND READY TO USE**

---

**Updated**: March 31, 2025
**Status**: Production Ready ✅
