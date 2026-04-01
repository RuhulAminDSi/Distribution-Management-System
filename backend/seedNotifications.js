import { query } from './src/config/database.js';
import bcrypt from 'bcryptjs';

async function seedNotifications() {
  try {
    console.log('Starting comprehensive notification seeding...\n');

    // Get all users
    const users = await query('SELECT id, username, role_id FROM users');
    
    if (users.length === 0) {
      console.log('No users found. Please create users first.');
      return;
    }

    // Get user by role for targeted notifications
    const usersByRole = {};
    users.forEach(user => {
      if (!usersByRole[user.role_id]) {
        usersByRole[user.role_id] = [];
      }
      usersByRole[user.role_id].push(user.id);
    });

    console.log(`Found ${users.length} users across ${Object.keys(usersByRole).length} roles\n`);

    // Clear existing notifications
    await query('DELETE FROM notifications');
    console.log('✓ Cleared existing notifications\n');

    const notifications = [];
    const now = new Date();

    // Helper function to create timestamps for notifications
    const getTimestamp = (daysAgo, hoursAgo = 0) => {
      const date = new Date(now);
      date.setDate(date.getDate() - daysAgo);
      date.setHours(date.getHours() - hoursAgo);
      return date.toISOString().slice(0, 19).replace('T', ' ');
    };

    // ============================================
    // 1. SYSTEM ADMIN NOTIFICATIONS (All roles get these)
    // ============================================
    const allUserIds = users.map(u => u.id);
    
    allUserIds.forEach((userId, idx) => {
      notifications.push({
        user_id: userId,
        title: 'Welcome to Distribution Management System',
        message: 'You have successfully logged in to the DMS platform. Explore all features available for your role.',
        type: 'success',
        category: 'system_notification',
        created_at: getTimestamp(25 + idx % 5)
      });
    });

    // ============================================
    // 2. LOW STOCK ALERTS (For managers, admins, system_admin, loader)
    // ============================================
    const lowStockAlertUsers = [
      ...(usersByRole[1] || []), // system_admin
      ...(usersByRole[2] || []), // admin
      ...(usersByRole[3] || []), // manager
      ...(usersByRole[7] || [])  // loader
    ];

    const products = [
      { id: 1, name: 'Aspirin 500mg', stock: 5 },
      { id: 2, name: 'Paracetamol 250mg', stock: 3 },
      { id: 3, name: 'Vitamin C 1000mg', stock: 8 },
      { id: 4, name: 'Ibuprofen 400mg', stock: 2 },
      { id: 5, name: 'Metformin 500mg', stock: 4 },
      { id: 6, name: 'Lisinopril 10mg', stock: 1 },
      { id: 7, name: 'Amoxicillin 250mg', stock: 6 }
    ];

    lowStockAlertUsers.forEach((userId, idx) => {
      const product = products[idx % products.length];
      notifications.push({
        user_id: userId,
        title: 'Low Stock Alert',
        message: `Product "${product.name}" is running low on stock (${product.stock} units remaining). Consider ordering more.`,
        type: 'warning',
        category: 'low_stock',
        reference_type: 'product',
        reference_id: product.id,
        action_url: '/inventory/products',
        is_read: idx % 3 === 0 ? 1 : 0,
        created_at: getTimestamp(Math.floor(idx / 2) + 1)
      });
    });

    // ============================================
    // 3. PRODUCT EXPIRY ALERTS (For managers, admins, system_admin, loader)
    // ============================================
    const expiryAlertUsers = lowStockAlertUsers;
    const expiryProducts = [
      { id: 2, name: 'Paracetamol 250mg', date: '2025-02-15' },
      { id: 8, name: 'Cough Syrup', date: '2025-03-10' },
      { id: 9, name: 'Antacid Tablet', date: '2025-02-28' },
      { id: 10, name: 'Vitamin B Complex', date: '2025-04-05' }
    ];

    expiryAlertUsers.forEach((userId, idx) => {
      const product = expiryProducts[idx % expiryProducts.length];
      const isExpired = idx % 5 === 0;
      notifications.push({
        user_id: userId,
        title: isExpired ? 'Product Expired' : 'Product Expiry Warning',
        message: isExpired 
          ? `Product "${product.name}" has expired on ${product.date}. Remove from stock immediately.`
          : `Product "${product.name}" will expire on ${product.date}. Only ${Math.ceil(30 - idx)} days remaining.`,
        type: isExpired ? 'error' : 'warning',
        category: 'product_expiry',
        reference_type: 'product',
        reference_id: product.id,
        action_url: '/inventory/products',
        is_read: idx % 2 === 0 ? 1 : 0,
        created_at: getTimestamp(idx + 2)
      });
    });

    // ============================================
    // 4. INVOICE & SALES ALERTS (For salesman, admin, manager, accountant)
    // ============================================
    const salesUsers = [
      ...(usersByRole[4] || []), // salesman
      ...(usersByRole[2] || []), // admin
      ...(usersByRole[3] || []), // manager
      ...(usersByRole[5] || [])  // accountant
    ];

    const retailers = [
      { id: 1, name: 'ABC Pharmacy', amount: 15000 },
      { id: 2, name: 'XYZ Retailers', amount: 8500 },
      { id: 3, name: 'Health Store Plus', amount: 22000 },
      { id: 4, name: 'Medicine Hub', amount: 5500 },
      { id: 5, name: 'Care Pharmacy', amount: 12000 }
    ];

    salesUsers.forEach((userId, idx) => {
      const retailer = retailers[idx % retailers.length];
      const invoiceNo = `INV-${String(idx + 1).padStart(4, '0')}`;
      
      notifications.push({
        user_id: userId,
        title: 'Invoice Created',
        message: `Invoice ${invoiceNo} created for "${retailer.name}". Amount: ${retailer.amount.toLocaleString()} TK`,
        type: 'info',
        category: 'invoice_created',
        reference_type: 'invoice',
        reference_id: idx + 1,
        action_url: '/sales/invoices',
        is_read: idx % 4 === 0 ? 1 : 0,
        created_at: getTimestamp(Math.floor(idx / 3) + 3)
      });

      // Invoice due reminders
      if (idx % 2 === 0) {
        notifications.push({
          user_id: userId,
          title: 'Invoice Due',
          message: `Invoice ${invoiceNo} for "${retailer.name}" is due. Amount: ${retailer.amount.toLocaleString()} TK. Outstanding for ${5 + idx} days.`,
          type: 'warning',
          category: 'invoice_due',
          reference_type: 'invoice',
          reference_id: idx + 1,
          action_url: '/sales/invoices',
          is_read: idx % 3 === 0 ? 1 : 0,
          created_at: getTimestamp(idx + 7)
        });
      }
    });

    // ============================================
    // 5. PAYMENT NOTIFICATIONS (For salesman, accountant, admin)
    // ============================================
    const paymentUsers = [
      ...(usersByRole[4] || []), // salesman
      ...(usersByRole[5] || []), // accountant
      ...(usersByRole[2] || [])  // admin
    ];

    paymentUsers.forEach((userId, idx) => {
      const retailer = retailers[idx % retailers.length];
      const amount = 2000 + (idx * 500);
      
      notifications.push({
        user_id: userId,
        title: 'Payment Received',
        message: `Payment of ${amount.toLocaleString()} TK received from "${retailer.name}". Reference: PAY-${String(idx + 1).padStart(4, '0')}`,
        type: 'success',
        category: 'payment_received',
        reference_type: 'payment',
        reference_id: idx + 1,
        action_url: '/finance/payments',
        is_read: idx % 2 === 0 ? 1 : 0,
        created_at: getTimestamp(idx + 5)
      });

      // Partial payment notifications
      if (idx % 3 === 0) {
        notifications.push({
          user_id: userId,
          title: 'Partial Payment Received',
          message: `Partial payment of ${(amount * 0.6).toLocaleString()} TK received from "${retailer.name}". Remaining: ${(amount * 0.4).toLocaleString()} TK`,
          type: 'info',
          category: 'payment_partial',
          reference_type: 'payment',
          reference_id: idx + 1,
          action_url: '/finance/payments',
          is_read: 1,
          crea
