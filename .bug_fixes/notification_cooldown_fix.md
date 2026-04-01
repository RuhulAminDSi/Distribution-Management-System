# Bug Fix: Notification Scanner Not Creating Notifications (Cooldown Issue)

**Date:** 2026-04-01  
**Issue:** Scanner finds 18 low stock products, 2 expired products, 2 due invoices but creates 0 notifications  
**Root Cause:** 24-hour cooldown was too long - notifications already existed for these items within the cooldown period  
**Status:** ✅ FIXED

---

## Problem Description

The notification scanner was correctly identifying items that needed notifications:
- 18 low stock products found
- 2 expired products found  
- 2 due invoices found

And users with appropriate permissions existed:
- 3 users with `products_view` (IDs: 6, 2, 29)
- 6 users with `payments_view` (IDs: 2, 3, 7, 8, 27, 28)

But 0 notifications were created because the `hasRecentNotification` check with a 24-hour cooldown was blocking all creation attempts. The scanner was finding existing notifications for these same products/invoices and skipping creation.

---

## Solution Applied

1. Reduced `NOTIFICATION_COOLDOWN_HOURS` from 24 to 1 hour in `notificationScanner.js:4`
2. Added detailed logging to show which notifications are skipped due to cooldown
3. Added count of skipped notifications to the summary log

---

## Files Modified

- `backend/src/services/notificationScanner.js` - Reduced cooldown, added logging

---

## Testing

1. Restart backend server
2. Clear existing notifications: `DELETE FROM notifications;`
3. Wait for scanner to run (or restart server to trigger initial scan after 5 seconds)
4. Check logs for notifications being created (should see counts > 0)
5. Verify notifications appear in database and frontend

---

## Git Commit

```
fix: reduce notification cooldown from 24h to 1h and add skip logging
```
