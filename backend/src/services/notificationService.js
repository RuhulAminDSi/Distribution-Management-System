import Notification from '../models/Notification.js';

export const notificationService = {
  async createNotification(userId, data) {
    const notification = await Notification.create({
      user_id: userId,
      title: data.title,
      message: data.message,
      type: data.type || 'info',
      category: data.category || null,
      reference_type: data.reference_type || null,
      reference_id: data.reference_id || null,
      action_url: data.action_url || null
    });
    return notification;
  },

  async createBulkNotifications(notifications) {
    return await Notification.createBulk(notifications);
  },

  async getUserNotifications(userId, page = 1, limit = 20) {
    const notifications = await Notification.findByUser(userId, page, limit);
    const total = await Notification.countByUser(userId);
    
    return {
      data: notifications,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  },

  async getUnreadNotifications(userId) {
    const unread = await Notification.countUnread(userId);
    const notifications = await Notification.getUnread(userId);
    
    return {
      count: unread,
      notifications
    };
  },

  async getNotificationDetail(userId, notificationId) {
    const notification = await Notification.findById(notificationId);
    
    if (!notification || notification.user_id !== userId) {
      throw new Error('Notification not found');
    }
    
    return notification;
  },

  async markNotificationAsRead(userId, notificationId) {
    const notification = await Notification.findById(notificationId);
    
    if (!notification || notification.user_id !== userId) {
      throw new Error('Notification not found');
    }
    
    await Notification.markAsRead(notificationId, userId);
    return await Notification.findById(notificationId);
  },

  async markAllNotificationsAsRead(userId) {
    await Notification.markAllAsRead(userId);
    return { success: true };
  },

  async deleteNotification(userId, notificationId) {
    const notification = await Notification.findById(notificationId);
    
    if (!notification || notification.user_id !== userId) {
      throw new Error('Notification not found');
    }
    
    await Notification.delete(notificationId);
    return { success: true };
  },

  async notifyDisabledFieldUpdate(affectedUserIds, fieldData) {
    // Create notifications for disabled field synchronization
    const notifications = affectedUserIds.map(userId => ({
      user_id: userId,
      title: 'Field Disabled',
      message: `A field has been disabled: ${fieldData.fieldName}`,
      type: 'warning',
      category: 'field_disabled',
      reference_type: 'field',
      reference_id: fieldData.fieldId,
      action_url: fieldData.actionUrl || null
    }));

    return await this.createBulkNotifications(notifications);
  },

  async notifyLowStock(userId, product) {
    return await this.createNotification(userId, {
      title: 'Low Stock Alert',
      message: `Product ${product.name} is running low on stock (${product.stock_quantity} units remaining)`,
      type: 'warning',
      category: 'low_stock',
      reference_type: 'product',
      reference_id: product.id,
      action_url: `/products?id=${product.id}`
    });
  },

  async notifyExpiredProduct(userId, product) {
    return await this.createNotification(userId, {
      title: 'Product Expiry Alert',
      message: `Product ${product.name} has expired on ${product.expiry_date}`,
      type: 'error',
      category: 'product_expiry',
      reference_type: 'product',
      reference_id: product.id,
      action_url: `/products?id=${product.id}`
    });
  },

  async notifyInvoiceDue(userId, invoice) {
    return await this.createNotification(userId, {
      title: 'Invoice Due',
      message: `Invoice #${invoice.invoice_no} for ${invoice.retailer_name} is due`,
      type: 'warning',
      category: 'invoice_due',
      reference_type: 'invoice',
      reference_id: invoice.id,
      action_url: `/sales?id=${invoice.id}`
    });
  },

  async notifyPaymentReceived(userId, payment) {
    return await this.createNotification(userId, {
      title: 'Payment Received',
      message: `Payment of ${payment.amount} received from ${payment.retailer_name}`,
      type: 'success',
      category: 'payment_received',
      reference_type: 'payment',
      reference_id: payment.id,
      action_url: `/payments?id=${payment.id}`
    });
  },

  async cleanupOldNotifications(days = 30) {
    return await Notification.deleteOlderThan(days);
  }
};

export default notificationService;
