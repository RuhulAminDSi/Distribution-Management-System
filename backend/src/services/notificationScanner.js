import { query } from '../config/database.js';
import notificationService from './notificationService.js';

const NOTIFICATION_COOLDOWN_HOURS = 0; // Set to 0 to skip cooldown for testing

async function getUsersWithPermission(permission) {
  const results = await query(
    `SELECT id FROM users WHERE is_active = 1`,
    []
  );
  console.log(`[Scanner] Active users: ${results.length}`, results.map(r => r.id));
  return results.map(r => r.id);
}

async function hasRecentNotification(userId, category, referenceType, referenceId) {
  const results = await query(
    `SELECT COUNT(*) as count FROM notifications 
     WHERE user_id = ? AND category = ? AND reference_type = ? AND reference_id = ?
     AND created_at > DATE_SUB(NOW(), INTERVAL ? HOUR)`,
    [userId, category, referenceType, referenceId, NOTIFICATION_COOLDOWN_HOURS]
  );
  const hasRecent = results[0].count > 0;
  if (hasRecent) {
    console.log(`[Scanner] Skipping notification for user ${userId}, category ${category}, ref ${referenceType}:${referenceId} (cooldown active)`);
  }
  return hasRecent;
}

export const notificationScanner = {
  async scanLowStock() {
    try {
      const lowStockProducts = await query(
        `SELECT * FROM products 
         WHERE is_active = 1 AND stock_quantity <= low_stock_alert`
      );

      if (lowStockProducts.length === 0) return { scanned: 0, created: 0 };

      const userIds = await getUsersWithPermission('products_view');
      let created = 0;

      for (const product of lowStockProducts) {
        for (const userId of userIds) {
          const hasRecent = await hasRecentNotification(
            userId, 'low_stock', 'product', product.id
          );
          if (!hasRecent) {
            await notificationService.notifyLowStock(userId, product);
            created++;
          }
        }
      }

      console.log(`[Scanner] Low stock: ${lowStockProducts.length} products, ${created} notifications created, ${userIds.length * lowStockProducts.length - created} skipped (cooldown)`);
      return { scanned: lowStockProducts.length, created };
    } catch (error) {
      console.error('[Scanner] Low stock scan error:', error.message);
      return { scanned: 0, created: 0, error: error.message };
    }
  },

  async scanExpiredProducts() {
    try {
      const expiredProducts = await query(
        `SELECT * FROM products 
         WHERE is_active = 1 AND expiry_date IS NOT NULL 
         AND expiry_date <= CURDATE() AND stock_quantity > 0`
      );

      if (expiredProducts.length === 0) return { scanned: 0, created: 0 };

      const userIds = await getUsersWithPermission('products_view');
      let created = 0;

      for (const product of expiredProducts) {
        for (const userId of userIds) {
          const hasRecent = await hasRecentNotification(
            userId, 'product_expiry', 'product', product.id
          );
          if (!hasRecent) {
            await notificationService.notifyExpiredProduct(userId, product);
            created++;
          }
        }
      }

      console.log(`[Scanner] Expired products: ${expiredProducts.length} products, ${created} notifications created`);
      return { scanned: expiredProducts.length, created };
    } catch (error) {
      console.error('[Scanner] Expired products scan error:', error.message);
      return { scanned: 0, created: 0, error: error.message };
    }
  },

  async scanDueInvoices() {
    try {
      const dueInvoices = await query(
        `SELECT i.*, r.name as retailer_name 
         FROM invoices i
         JOIN retailers r ON i.retailer_id = r.id
         WHERE i.status IN ('due', 'partial')
         AND i.invoice_date < CURDATE()`
      );

      if (dueInvoices.length === 0) return { scanned: 0, created: 0 };

      const userIds = await getUsersWithPermission('payments_view');
      let created = 0;

      for (const invoice of dueInvoices) {
        for (const userId of userIds) {
          const hasRecent = await hasRecentNotification(
            userId, 'invoice_due', 'invoice', invoice.id
          );
          if (!hasRecent) {
            await notificationService.notifyInvoiceDue(userId, invoice);
            created++;
          }
        }
      }

      console.log(`[Scanner] Due invoices: ${dueInvoices.length} invoices, ${created} notifications created`);
      return { scanned: dueInvoices.length, created };
    } catch (error) {
      console.error('[Scanner] Due invoices scan error:', error.message);
      return { scanned: 0, created: 0, error: error.message };
    }
  },

  async cleanupOldNotifications() {
    try {
      const deleted = await notificationService.cleanupOldNotifications(30);
      console.log(`[Scanner] Cleaned up ${deleted.affectedRows || 0} old notifications`);
      return { deleted: deleted.affectedRows || 0 };
    } catch (error) {
      console.error('[Scanner] Cleanup error:', error.message);
      return { deleted: 0, error: error.message };
    }
  },

  async runAllScans() {
    const results = {
      lowStock: await this.scanLowStock(),
      expired: await this.scanExpiredProducts(),
      dueInvoices: await this.scanDueInvoices()
    };
    return results;
  }
};
