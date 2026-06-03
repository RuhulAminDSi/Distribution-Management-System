import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'dms_db'
});

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(startDays, endDays) {
  const d = new Date();
  d.setDate(d.getDate() - randomInt(startDays, endDays));
  return d.toISOString().split('T')[0];
}

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seedAll() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // ============================================
    // 1. COMPANIES
    // ============================================
    const companiesData = [
      { name: 'Unilever Bangladesh Ltd', code: 'UNV', contact_person: 'Karim Hasan', phone: '01711111111', address: 'Gulshan, Dhaka', due_limit: 500000 },
      { name: 'Nestle Bangladesh Ltd', code: 'NST', contact_person: 'Farhana Rahman', phone: '01722222222', address: 'Banani, Dhaka', due_limit: 400000 },
      { name: 'PepsiCo Bangladesh', code: 'PEP', contact_person: 'Shahidul Islam', phone: '01733333333', address: 'Motijheel, Dhaka', due_limit: 300000 },
      { name: 'Coca-Cola Bangladesh', code: 'COKE', contact_person: 'Nasrin Akter', phone: '01744444444', address: 'Tejgaon, Dhaka', due_limit: 350000 },
      { name: 'Pran-RFL Group', code: 'PRAN', contact_person: 'Hasan Mahmud', phone: '01755555555', address: 'Mirpur, Dhaka', due_limit: 600000 },
      { name: 'City Group', code: 'CITY', contact_person: 'Rafiq Uddin', phone: '01766666666', address: 'Kawran Bazar, Dhaka', due_limit: 250000 },
      { name: 'Akij Group', code: 'AKJ', contact_person: 'Mizanur Rahman', phone: '01777777777', address: 'Dhanmondi, Dhaka', due_limit: 450000 },
      { name: 'Partex Group', code: 'PTX', contact_person: 'Jahangir Alam', phone: '01788888888', address: 'Uttara, Dhaka', due_limit: 200000 },
      { name: 'Square Toiletries Ltd', code: 'SQR', contact_person: 'Shamim Chowdhury', phone: '01799999999', address: 'Paltan, Dhaka', due_limit: 300000 },
      { name: 'ACI Limited', code: 'ACI', contact_person: 'Nazmul Hossain', phone: '01811111111', address: 'Mohakhali, Dhaka', due_limit: 350000 }
    ];

    for (const c of companiesData) {
      await client.query(
        `INSERT INTO companies (name, code, contact_person, phone, address, due_limit)
         VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (code) DO NOTHING`,
        [c.name, c.code, c.contact_person, c.phone, c.address, c.due_limit]
      );
    }
    const companies = (await client.query('SELECT id, name, code FROM companies')).rows;
    console.log(`✓ Seeded ${companies.length} companies`);

    // ============================================
    // 2. CATEGORIES
    // ============================================
    const categoriesData = [
      { name: 'Soap & Body Wash', company_code: 'UNV' },
      { name: 'Shampoo & Conditioner', company_code: 'UNV' },
      { name: 'Diapers & Baby Care', company_code: 'UNV' },
      { name: 'Cooking Oil', company_code: 'PRAN' },
      { name: 'Rice & Grains', company_code: 'CITY' },
      { name: 'Sugar & Salt', company_code: 'CITY' },
      { name: 'Beverages', company_code: 'COKE' },
      { name: 'Juice & Energy Drinks', company_code: 'PEP' },
      { name: 'Biscuits & Snacks', company_code: 'AKJ' },
      { name: 'Noodles & Pasta', company_code: 'NST' },
      { name: 'Milk & Dairy', company_code: 'NST' },
      { name: 'Toiletries', company_code: 'SQR' },
      { name: 'Detergent & Cleaners', company_code: 'ACI' },
      { name: 'Confectionery', company_code: 'PTX' }
    ];

    const compMap = {};
    companies.forEach(c => { compMap[c.code] = c.id; });

    for (const cat of categoriesData) {
      const companyId = compMap[cat.company_code] || null;
      await client.query(
        `INSERT INTO categories (name, company_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [cat.name, companyId]
      );
    }
    const categories = (await client.query('SELECT id, name FROM categories')).rows;
    console.log(`✓ Seeded ${categories.length} categories`);

    // ============================================
    // 3. PRODUCTS
    // ============================================
    const catMap = {};
    categories.forEach(c => { catMap[c.name] = c.id; });

    const productsData = [
      { name: 'Lux Soap 75gm', code: 'PRO001', category: 'Soap & Body Wash', company: 'UNV', pp: 20, dp: 25, mrp: 30, unit: 'piece' },
      { name: 'Lux Soap 100gm', code: 'PRO002', category: 'Soap & Body Wash', company: 'UNV', pp: 28, dp: 35, mrp: 42, unit: 'piece' },
      { name: 'Dove Soap 75gm', code: 'PRO003', category: 'Soap & Body Wash', company: 'UNV', pp: 35, dp: 42, mrp: 50, unit: 'piece' },
      { name: 'Lifebuoy Soap 75gm', code: 'PRO004', category: 'Soap & Body Wash', company: 'UNV', pp: 15, dp: 18, mrp: 22, unit: 'piece' },
      { name: 'Clinic Plus Shampoo 100ml', code: 'PRO005', category: 'Shampoo & Conditioner', company: 'UNV', pp: 45, dp: 55, mrp: 65, unit: 'bottle' },
      { name: 'Sunsilk Shampoo 200ml', code: 'PRO006', category: 'Shampoo & Conditioner', company: 'UNV', pp: 80, dp: 95, mrp: 115, unit: 'bottle' },
      { name: 'Baby Diaper Small', code: 'PRO007', category: 'Diapers & Baby Care', company: 'UNV', pp: 120, dp: 140, mrp: 165, unit: 'piece' },
      { name: 'Baby Diaper Medium', code: 'PRO008', category: 'Diapers & Baby Care', company: 'UNV', pp: 140, dp: 165, mrp: 195, unit: 'piece' },
      { name: 'Baby Diaper Large', code: 'PRO009', category: 'Diapers & Baby Care', company: 'UNV', pp: 160, dp: 190, mrp: 225, unit: 'piece' },
      { name: 'Soyabean Oil 1L', code: 'PRO010', category: 'Cooking Oil', company: 'PRAN', pp: 160, dp: 190, mrp: 230, unit: 'bottle' },
      { name: 'Soyabean Oil 5L', code: 'PRO011', category: 'Cooking Oil', company: 'PRAN', pp: 720, dp: 860, mrp: 1020, unit: 'bottle' },
      { name: 'Mustard Oil 1L', code: 'PRO012', category: 'Cooking Oil', company: 'PRAN', pp: 170, dp: 205, mrp: 245, unit: 'bottle' },
      { name: 'Miniket Rice 1kg', code: 'PRO013', category: 'Rice & Grains', company: 'CITY', pp: 55, dp: 65, mrp: 78, unit: 'kg' },
      { name: 'Miniket Rice 5kg', code: 'PRO014', category: 'Rice & Grains', company: 'CITY', pp: 260, dp: 310, mrp: 370, unit: 'kg' },
      { name: 'Basmati Rice 1kg', code: 'PRO015', category: 'Rice & Grains', company: 'CITY', pp: 120, dp: 145, mrp: 175, unit: 'kg' },
      { name: 'Sugar 1kg', code: 'PRO016', category: 'Sugar & Salt', company: 'CITY', pp: 45, dp: 52, mrp: 62, unit: 'kg' },
      { name: 'Sugar 5kg', code: 'PRO017', category: 'Sugar & Salt', company: 'CITY', pp: 210, dp: 250, mrp: 295, unit: 'kg' },
      { name: 'Salt 1kg', code: 'PRO018', category: 'Sugar & Salt', company: 'CITY', pp: 15, dp: 18, mrp: 22, unit: 'kg' },
      { name: 'Coca-Cola 300ml', code: 'PRO019', category: 'Beverages', company: 'COKE', pp: 20, dp: 24, mrp: 30, unit: 'bottle' },
      { name: 'Coca-Cola 1L', code: 'PRO020', category: 'Beverages', company: 'COKE', pp: 50, dp: 60, mrp: 72, unit: 'bottle' },
      { name: 'Sprite 300ml', code: 'PRO021', category: 'Beverages', company: 'COKE', pp: 20, dp: 24, mrp: 30, unit: 'bottle' },
      { name: 'Pepsi 300ml', code: 'PRO022', category: 'Beverages', company: 'PEP', pp: 20, dp: 24, mrp: 30, unit: 'bottle' },
      { name: '7Up 300ml', code: 'PRO023', category: 'Beverages', company: 'PEP', pp: 20, dp: 24, mrp: 30, unit: 'bottle' },
      { name: 'Pran Juice 250ml', code: 'PRO024', category: 'Juice & Energy Drinks', company: 'PRAN', pp: 15, dp: 18, mrp: 22, unit: 'packet' },
      { name: 'Pran Juice 1L', code: 'PRO025', category: 'Juice & Energy Drinks', company: 'PRAN', pp: 60, dp: 72, mrp: 85, unit: 'bottle' },
      { name: 'Biscuit Regular', code: 'PRO026', category: 'Biscuits & Snacks', company: 'AKJ', pp: 20, dp: 24, mrp: 30, unit: 'packet' },
      { name: 'Biscuit Cream', code: 'PRO027', category: 'Biscuits & Snacks', company: 'AKJ', pp: 30, dp: 36, mrp: 45, unit: 'packet' },
      { name: 'Chips Small', code: 'PRO028', category: 'Biscuits & Snacks', company: 'AKJ', pp: 15, dp: 18, mrp: 22, unit: 'packet' },
      { name: 'Maggi Noodles', code: 'PRO029', category: 'Noodles & Pasta', company: 'NST', pp: 15, dp: 18, mrp: 22, unit: 'packet' },
      { name: 'Maggi Noodles Box', code: 'PRO030', category: 'Noodles & Pasta', company: 'NST', pp: 35, dp: 42, mrp: 50, unit: 'box' },
      { name: 'Nestle Milk 1L', code: 'PRO031', category: 'Milk & Dairy', company: 'NST', pp: 80, dp: 95, mrp: 115, unit: 'packet' },
      { name: 'Nido Milk Powder 400g', code: 'PRO032', category: 'Milk & Dairy', company: 'NST', pp: 280, dp: 340, mrp: 410, unit: 'tin' },
      { name: 'Toothpaste 100gm', code: 'PRO033', category: 'Toiletries', company: 'SQR', pp: 35, dp: 42, mrp: 50, unit: 'piece' },
      { name: 'Toothbrush', code: 'PRO034', category: 'Toiletries', company: 'SQR', pp: 25, dp: 30, mrp: 38, unit: 'piece' },
      { name: 'Shampoo Sachet', code: 'PRO035', category: 'Shampoo & Conditioner', company: 'UNV', pp: 5, dp: 7, mrp: 10, unit: 'piece' },
      { name: 'Washing Powder 1kg', code: 'PRO036', category: 'Detergent & Cleaners', company: 'ACI', pp: 65, dp: 78, mrp: 95, unit: 'packet' },
      { name: 'Dishwashing Liquid', code: 'PRO037', category: 'Detergent & Cleaners', company: 'ACI', pp: 55, dp: 66, mrp: 80, unit: 'bottle' },
      { name: 'Chocolate Bar', code: 'PRO038', category: 'Confectionery', company: 'PTX', pp: 20, dp: 25, mrp: 30, unit: 'piece' },
      { name: 'Candy Jar', code: 'PRO039', category: 'Confectionery', company: 'PTX', pp: 50, dp: 60, mrp: 75, unit: 'jar' },
      { name: 'Mineral Water 1L', code: 'PRO040', category: 'Beverages', company: 'PRAN', pp: 15, dp: 18, mrp: 22, unit: 'bottle' }
    ];

    for (const p of productsData) {
      const catId = catMap[p.category] || null;
      const compId = compMap[p.company] || null;
      await client.query(
        `INSERT INTO products (name, code, category_id, company_id, purchase_price, dealer_price, mrp, stock_quantity, low_stock_alert, unit, pack_size)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) ON CONFLICT (code) DO NOTHING`,
        [p.name, p.code, catId, compId, p.pp, p.dp, p.mrp, randomInt(20, 500), 10, p.unit, 1]
      );
    }
    const products = (await client.query('SELECT id, name, code, dealer_price FROM products')).rows;
    console.log(`✓ Seeded ${products.length} products`);

    // ============================================
    // 4. RETAILERS
    // ============================================
    const areas = ['Gulshan', 'Banani', 'Dhanmondi', 'Mirpur', 'Uttara', 'Baridhara', 'Mohakhali', 'Badda', 'Rampura', 'Malibagh', 'Shahbagh', 'Motijheel', 'Lalbagh', 'Savar', 'Demra', 'Jatrabari', 'Kamlapur', 'Wari', 'Kotwali'];
    const retailerNames = ['City Store', 'Metro Shop', 'Daily Needs', 'Super Shop', 'Quick Mart', 'Family Mart', 'Best Buy', 'Quality Store', 'Prime Store', 'Easy Shop', 'Happy Store', 'Lucky Shop', 'Modern Store', 'New Market', 'Green Valley Store', 'Sunrise Mart', 'Star Store', 'Galaxy Shop', 'Fresh Mart', 'Organic Store', 'Grocery Hub', 'Food Court', 'Restaurant Depot', 'Electronics Hub', 'Tech World', 'Mobile Palace', 'Furniture House', 'Kitchen World', 'Bakery House', 'Sweet Mart', 'Fruit Corner', 'Vegetable Shop', 'Coffee World', 'Ice Cream Parlor', 'Fast Food Corner', 'Chicken Republic'];

    for (let i = 0; i < 30; i++) {
      const name = retailerNames[i % retailerNames.length] + (i >= retailerNames.length ? ` ${Math.floor(i / retailerNames.length) + 1}` : '');
      const area = areas[randomInt(0, areas.length - 1)];
      await client.query(
        `INSERT INTO retailers (name, code, owner_name, phone, address, area, credit_limit, due_limit)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (code) DO NOTHING`,
        [name, 'RTL' + String(i + 1).padStart(4, '0'), 'Owner ' + (i + 1), '01' + String(randomInt(1000000000, 9999999999)), area + ', Dhaka', area, randomInt(10000, 100000), randomInt(5000, 50000)]
      );
    }
    const retailers = (await client.query('SELECT id, name FROM retailers')).rows;
    console.log(`✓ Seeded ${retailers.length} retailers`);

    // ============================================
    // 5. PURCHASE ORDERS + ITEMS
    // ============================================
    const poStatuses = ['pending', 'received', 'cancelled'];
    for (let i = 1; i <= 15; i++) {
      const company = randomElement(companies);
      const items = [];
      const itemCount = randomInt(2, 5);
      let totalAmount = 0;
      for (let j = 0; j < itemCount; j++) {
        const product = randomElement(products);
        const qty = randomInt(10, 100);
        const rate = parseFloat(product.dealer_price);
        items.push({ productId: product.id, qty, rate, amount: qty * rate });
        totalAmount += qty * rate;
      }
      const status = poStatuses[randomInt(0, 2)];
      const poResult = await client.query(
        `INSERT INTO purchase_orders (po_no, company_id, total_amount, status, notes, order_date, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        ['PO' + String(i).padStart(4, '0'), company.id, totalAmount, status, 'Purchase order ' + i, randomDate(5, 60), 1]
      );
      const poId = poResult.rows[0].id;

      for (const item of items) {
        const received = status === 'received' ? item.qty : (status === 'pending' ? 0 : 0);
        await client.query(
          `INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, rate, amount, received_quantity)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [poId, item.productId, item.qty, item.rate, item.amount, received]
        );
      }

      if (status === 'received') {
        for (const item of items) {
          await client.query(
            'UPDATE products SET stock_quantity = stock_quantity + $1 WHERE id = $2',
            [item.qty, item.productId]
          );
          await client.query(
            `INSERT INTO stock_logs (product_id, quantity, type, reference_type, reference_id, notes, created_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [item.productId, item.qty, 'IN', 'purchase_order', poId, 'PO: PO' + String(i).padStart(4, '0'), 1]
          );
        }
      }
    }
    console.log('✓ Seeded 15 purchase orders with items + stock logs');

    // ============================================
    // 6. INVOICES + ITEMS
    // ============================================
    for (let i = 1; i <= 40; i++) {
      const retailer = randomElement(retailers);
      const items = [];
      const itemCount = randomInt(1, 5);
      let subtotal = 0;
      for (let j = 0; j < itemCount; j++) {
        const product = randomElement(products);
        const qty = randomInt(1, 10);
        const rate = parseFloat(product.dealer_price);
        const amount = qty * rate;
        items.push({ productId: product.id, qty, rate, amount });
        subtotal += amount;
      }
      const discountPercent = [0, 0, 0, 5, 10][randomInt(0, 4)];
      const discountAmount = (subtotal * discountPercent) / 100;
      const totalAmount = subtotal - discountAmount;
      const paidAmount = [0, 0, totalAmount, totalAmount * 0.5][randomInt(0, 3)];
      const dueAmount = totalAmount - paidAmount;
      const status = dueAmount <= 0 ? 'paid' : (paidAmount > 0 ? 'partial' : 'due');
      const invoiceDate = randomDate(1, 45);

      const invResult = await client.query(
        `INSERT INTO invoices (invoice_no, retailer_id, created_by, subtotal, discount_percent, discount_amount, total_amount, paid_amount, due_amount, status, notes, invoice_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
        ['INV' + String(i).padStart(4, '0'), retailer.id, 1, subtotal, discountPercent, discountAmount, totalAmount, paidAmount, dueAmount, status, 'Invoice ' + i, invoiceDate]
      );
      const invId = invResult.rows[0].id;

      for (const item of items) {
        await client.query(
          `INSERT INTO invoice_items (invoice_id, product_id, quantity, rate, amount)
           VALUES ($1, $2, $3, $4, $5)`,
          [invId, item.productId, item.qty, item.rate, item.amount]
        );

        const currentStock = (await client.query('SELECT stock_quantity FROM products WHERE id = $1', [item.productId])).rows[0];
        if (currentStock && currentStock.stock_quantity >= item.qty) {
          await client.query('UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2', [item.qty, item.productId]);
          await client.query(
            `INSERT INTO stock_logs (product_id, quantity, type, reference_type, reference_id, notes, created_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [item.productId, -item.qty, 'OUT', 'invoice', invId, 'Invoice: INV' + String(i).padStart(4, '0'), 1]
          );
        }
      }

      const outstandingChange = dueAmount > 0 ? totalAmount : (totalAmount - paidAmount);
      if (outstandingChange !== 0) {
        await client.query('UPDATE retailers SET outstanding_balance = outstanding_balance + $1 WHERE id = $2', [outstandingChange, retailer.id]);
      }
    }
    console.log('✓ Seeded 40 invoices with items + stock logs + retailer balances');

    // ============================================
    // 7. PAYMENTS
    // ============================================
    const paymentMethods = ['cash', 'bank', 'mobile_banking', 'cheque'];
    for (let i = 1; i <= 25; i++) {
      const retailer = randomElement(retailers);
      const amount = randomInt(500, 50000);
      const method = randomElement(paymentMethods);
      const paymentDate = randomDate(1, 30);

      await client.query(
        `INSERT INTO payments (payment_no, retailer_id, amount, payment_method, reference_no, notes, collected_by, payment_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (payment_no) DO NOTHING`,
        ['PAY' + String(i).padStart(4, '0'), retailer.id, amount, method, method === 'bank' ? 'REF' + String(randomInt(1000, 9999)) : null, 'Payment ' + i, 1, paymentDate]
      );

      await client.query('UPDATE retailers SET outstanding_balance = GREATEST(outstanding_balance - $1, 0) WHERE id = $2', [amount, retailer.id]);

      const dueInvoices = (await client.query(
        "SELECT id, due_amount FROM invoices WHERE retailer_id = $1 AND status IN ('due', 'partial') ORDER BY invoice_date ASC",
        [retailer.id]
      )).rows;

      let remaining = amount;
      for (const inv of dueInvoices) {
        if (remaining <= 0) break;
        const payForInv = Math.min(inv.due_amount, remaining);
        await client.query(
          'UPDATE invoices SET paid_amount = paid_amount + $1, due_amount = GREATEST(due_amount - $1, 0), status = CASE WHEN due_amount - $1 <= 0 THEN $2 WHEN paid_amount + $1 > 0 THEN $3 ELSE $4 END WHERE id = $5',
          [payForInv, 'paid', 'partial', 'due', inv.id]
        );
        remaining -= payForInv;
      }
    }
    console.log('✓ Seeded 25 payments');

    // ============================================
    // 8. NOTIFICATIONS
    // ============================================
    const lowStockProducts = (await client.query('SELECT id, name, stock_quantity FROM products WHERE stock_quantity <= low_stock_alert')).rows;
    for (const p of lowStockProducts) {
      await client.query(
        `INSERT INTO notifications (user_id, title, message, type, category, reference_type, reference_id, is_read)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [1, 'Low Stock Alert', `Product ${p.name} is running low (${p.stock_quantity} units remaining)`, 'warning', 'low_stock', 'product', p.id, 0]
      );
    }

    const expiredProducts = (await client.query("SELECT id, name, expiry_date FROM products WHERE expiry_date IS NOT NULL AND expiry_date <= CURRENT_DATE AND stock_quantity > 0")).rows;
    for (const p of expiredProducts) {
      await client.query(
        `INSERT INTO notifications (user_id, title, message, type, category, reference_type, reference_id, is_read)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [1, 'Product Expired', `Product ${p.name} expired on ${p.expiry_date}`, 'error', 'product_expiry', 'product', p.id, 0]
      );
    }

    const dueInvoices = (await client.query("SELECT i.id, i.invoice_no, r.name as rname, i.total_amount, i.due_amount FROM invoices i JOIN retailers r ON i.retailer_id = r.id WHERE i.status IN ('due', 'partial') AND i.due_amount > 0 LIMIT 5")).rows;
    for (const inv of dueInvoices) {
      await client.query(
        `INSERT INTO notifications (user_id, title, message, type, category, reference_type, reference_id, is_read)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [1, 'Invoice Due', `Invoice #${inv.invoice_no} for ${inv.rname} - Due: ${inv.due_amount} Tk`, 'warning', 'invoice_due', 'invoice', inv.id, 0]
      );
    }

    await client.query(
      `INSERT INTO notifications (user_id, title, message, type, category, is_read)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [1, 'Welcome to DMS', 'Your Distribution Management System is ready. Start managing sales, inventory, and retailers.', 'info', 'system', 0]
    );

    console.log('✓ Seeded notifications');

    await client.query('COMMIT');
    console.log('\n✅ All tables seeded successfully!');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Seed error:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedAll();