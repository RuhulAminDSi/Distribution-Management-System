import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const products = [
  // Soap Category
  { name: 'Lux Soap 75gm', code: 'SOAP001', unit: 'piece', pack_size: 1, purchase_price: 20, dealer_price: 25, mrp: 30 },
  { name: 'Lux Soap 100gm', code: 'SOAP002', unit: 'piece', pack_size: 1, purchase_price: 28, dealer_price: 35, mrp: 42 },
  { name: 'Dove Soap 75gm', code: 'SOAP003', unit: 'piece', pack_size: 1, purchase_price: 35, dealer_price: 42, mrp: 50 },
  { name: 'Dove Soap 100gm', code: 'SOAP004', unit: 'piece', pack_size: 1, purchase_price: 45, dealer_price: 55, mrp: 65 },
  { name: 'Santoor Soap 75gm', code: 'SOAP005', unit: 'piece', pack_size: 1, purchase_price: 18, dealer_price: 22, mrp: 28 },
  { name: 'Santoor Soap 100gm', code: 'SOAP006', unit: 'piece', pack_size: 1, purchase_price: 24, dealer_price: 30, mrp: 36 },
  { name: 'Life Boy Soap 75gm', code: 'SOAP007', unit: 'piece', pack_size: 1, purchase_price: 15, dealer_price: 18, mrp: 22 },
  { name: 'Life Boy Soap 100gm', code: 'SOAP008', unit: 'piece', pack_size: 1, purchase_price: 20, dealer_price: 25, mrp: 30 },
  
  // Diaper Category
  { name: 'Baby Diaper Small', code: 'DIAP001', unit: 'piece', pack_size: 1, purchase_price: 120, dealer_price: 140, mrp: 165 },
  { name: 'Baby Diaper Medium', code: 'DIAP002', unit: 'piece', pack_size: 1, purchase_price: 140, dealer_price: 165, mrp: 195 },
  { name: 'Baby Diaper Large', code: 'DIAP003', unit: 'piece', pack_size: 1, purchase_price: 160, dealer_price: 190, mrp: 225 },
  { name: 'Baby Diaper XL', code: 'DIAP004', unit: 'piece', pack_size: 1, purchase_price: 180, dealer_price: 215, mrp: 255 },
  { name: 'Adult Diaper Small', code: 'DIAP005', unit: 'piece', pack_size: 1, purchase_price: 150, dealer_price: 180, mrp: 215 },
  { name: 'Adult Diaper Medium', code: 'DIAP006', unit: 'piece', pack_size: 1, purchase_price: 170, dealer_price: 205, mrp: 245 },
  { name: 'Adult Diaper Large', code: 'DIAP007', unit: 'piece', pack_size: 1, purchase_price: 190, dealer_price: 230, mrp: 275 },
  
  // Oil Category
  { name: '食用油 500ml', code: 'OIL001', unit: 'bottle', pack_size: 1, purchase_price: 85, dealer_price: 100, mrp: 120 },
  { name: '食用油 1Liter', code: 'OIL002', unit: 'bottle', pack_size: 1, purchase_price: 160, dealer_price: 190, mrp: 230 },
  { name: '食用油 2Liter', code: 'OIL003', unit: 'bottle', pack_size: 1, purchase_price: 300, dealer_price: 360, mrp: 430 },
  { name: '食用油 5Liter', code: 'OIL004', unit: 'bottle', pack_size: 1, purchase_price: 720, dealer_price: 860, mrp: 1020 },
  { name: 'Mustard Oil 500ml', code: 'OIL005', unit: 'bottle', pack_size: 1, purchase_price: 90, dealer_price: 110, mrp: 130 },
  { name: 'Mustard Oil 1Liter', code: 'OIL006', unit: 'bottle', pack_size: 1, purchase_price: 170, dealer_price: 205, mrp: 245 },
  
  // Rice Category
  { name: 'Premium Rice 1kg', code: 'RICE001', unit: 'kg', pack_size: 1, purchase_price: 55, dealer_price: 65, mrp: 78 },
  { name: 'Premium Rice 5kg', code: 'RICE002', unit: 'kg', pack_size: 5, purchase_price: 260, dealer_price: 310, mrp: 370 },
  { name: 'Premium Rice 10kg', code: 'RICE003', unit: 'kg', pack_size: 10, purchase_price: 500, dealer_price: 600, mrp: 720 },
  { name: 'Basmati Rice 1kg', code: 'RICE004', unit: 'kg', pack_size: 1, purchase_price: 120, dealer_price: 145, mrp: 175 },
  { name: 'Basmati Rice 5kg', code: 'RICE005', unit: 'kg', pack_size: 5, purchase_price: 550, dealer_price: 660, mrp: 790 },
  
  // Sugar & staples
  { name: 'Sugar 1kg', code: 'SUGAR001', unit: 'kg', pack_size: 1, purchase_price: 45, dealer_price: 52, mrp: 62 },
  { name: 'Sugar 5kg', code: 'SUGAR002', unit: 'kg', pack_size: 5, purchase_price: 210, dealer_price: 250, mrp: 295 },
  { name: 'Flour 1kg', code: 'FLOUR001', unit: 'kg', pack_size: 1, purchase_price: 35, dealer_price: 42, mrp: 50 },
  { name: 'Flour 5kg', code: 'FLOUR002', unit: 'kg', pack_size: 5, purchase_price: 160, dealer_price: 190, mrp: 230 },
  { name: 'Flour 10kg', code: 'FLOUR003', unit: 'kg', pack_size: 10, purchase_price: 300, dealer_price: 360, mrp: 430 },
  { name: 'Salt 1kg', code: 'SALT001', unit: 'kg', pack_size: 1, purchase_price: 15, dealer_price: 18, mrp: 22 },
  { name: 'Salt 5kg', code: 'SALT002', unit: 'kg', pack_size: 5, purchase_price: 65, dealer_price: 78, mrp: 95 },
  
  // Personal Care
  { name: 'Shampoo 100ml', code: 'SHAM001', unit: 'bottle', pack_size: 1, purchase_price: 45, dealer_price: 55, mrp: 65 },
  { name: 'Shampoo 200ml', code: 'SHAM002', unit: 'bottle', pack_size: 1, purchase_price: 80, dealer_price: 95, mrp: 115 },
  { name: 'Shampoo 500ml', code: 'SHAM003', unit: 'bottle', pack_size: 1, purchase_price: 170, dealer_price: 205, mrp: 245 },
  { name: 'Toothpaste 100gm', code: 'DENT001', unit: 'piece', pack_size: 1, purchase_price: 35, dealer_price: 42, mrp: 50 },
  { name: 'Toothpaste 150gm', code: 'DENT002', unit: 'piece', pack_size: 1, purchase_price: 50, dealer_price: 60, mrp: 72 },
  { name: 'Toothbrush', code: 'DENT003', unit: 'piece', pack_size: 1, purchase_price: 25, dealer_price: 30, mrp: 38 },
  
  // Baby Care
  { name: 'Baby Milk 400gm', code: 'BABY001', unit: 'tin', pack_size: 1, purchase_price: 280, dealer_price: 340, mrp: 410 },
  { name: 'Baby Food 250gm', code: 'BABY002', unit: 'packet', pack_size: 1, purchase_price: 120, dealer_price: 145, mrp: 175 },
  { name: 'Baby Lotion 200ml', code: 'BABY003', unit: 'bottle', pack_size: 1, purchase_price: 95, dealer_price: 115, mrp: 140 },
  { name: 'Baby Oil 200ml', code: 'BABY004', unit: 'bottle', pack_size: 1, purchase_price: 85, dealer_price: 102, mrp: 125 },
  { name: 'Baby Cream 50gm', code: 'BABY005', unit: 'tube', pack_size: 1, purchase_price: 55, dealer_price: 66, mrp: 80 },
  
  // Beverages
  { name: 'Drinking Water 1Liter', code: 'WATER001', unit: 'bottle', pack_size: 1, purchase_price: 15, dealer_price: 18, mrp: 22 },
  { name: 'Drinking Water 500ml', code: 'WATER002', unit: 'bottle', pack_size: 1, purchase_price: 10, dealer_price: 12, mrp: 15 },
  { name: 'Juice 1Liter', code: 'JUICE001', unit: 'bottle', pack_size: 1, purchase_price: 60, dealer_price: 72, mrp: 85 },
  { name: 'Juice 200ml', code: 'JUICE002', unit: 'packet', pack_size: 1, purchase_price: 15, dealer_price: 18, mrp: 22 },
  { name: 'Soft Drink 300ml', code: 'SOFT001', unit: 'bottle', pack_size: 1, purchase_price: 20, dealer_price: 24, mrp: 30 },
  { name: 'Soft Drink 1Liter', code: 'SOFT002', unit: 'bottle', pack_size: 1, purchase_price: 50, dealer_price: 60, mrp: 72 },
  { name: 'Energy Drink 250ml', code: 'ENERGY001', unit: 'can', pack_size: 1, purchase_price: 45, dealer_price: 55, mrp: 65 },
  
  // Snacks
  { name: 'Biscuit Pack Regular', code: 'BISC001', unit: 'packet', pack_size: 1, purchase_price: 20, dealer_price: 24, mrp: 30 },
  { name: 'Biscuit Pack Large', code: 'BISC002', unit: 'packet', pack_size: 1, purchase_price: 40, dealer_price: 48, mrp: 58 },
  { name: 'Chips Small', code: 'CHIP001', unit: 'packet', pack_size: 1, purchase_price: 15, dealer_price: 18, mrp: 22 },
  { name: 'Chips Large', code: 'CHIP002', unit: 'packet', pack_size: 1, purchase_price: 30, dealer_price: 36, mrp: 45 },
  { name: 'Noodles Pack', code: 'NOOD001', unit: 'packet', pack_size: 1, purchase_price: 15, dealer_price: 18, mrp: 22 },
  { name: 'Noodles Box', code: 'NOOD002', unit: 'box', pack_size: 1, purchase_price: 35, dealer_price: 42, mrp: 50 },
  { name: 'Chocolate Bar', code: 'CHOC001', unit: 'piece', pack_size: 1, purchase_price: 20, dealer_price: 25, mrp: 30 },
  { name: 'Chocolate Box', code: 'CHOC002', unit: 'box', pack_size: 1, purchase_price: 150, dealer_price: 180, mrp: 220 },
];

async function seedProducts() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'dms_db'
  });

  try {
    // Get companies to link products
    const [companies] = await connection.execute('SELECT id, name FROM companies LIMIT 10');
    
    if (companies.length === 0) {
      console.log('No companies found. Please create companies first.');
      return;
    }

    console.log(`Found ${companies.length} companies`);
    
    // Insert products
    let inserted = 0;
    for (const product of products) {
      const company_id = companies[Math.floor(Math.random() * companies.length)].id;
      
      try {
        await connection.execute(
          `INSERT INTO products (name, code, unit, pack_size, purchase_price, dealer_price, mrp, company_id, stock_quantity, low_stock_alert) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            product.name,
            product.code,
            product.unit,
            product.pack_size,
            product.purchase_price,
            product.dealer_price,
            product.mrp,
            company_id,
            Math.floor(Math.random() * 500) + 50,
            10
          ]
        );
        inserted++;
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          console.log(`Product already exists: ${product.name}`);
        } else {
          console.error(`Error inserting ${product.name}:`, err.message);
        }
      }
    }
    
    console.log(`Successfully inserted ${inserted} products`);
    
    // Show total count
    const [count] = await connection.execute('SELECT COUNT(*) as count FROM products');
    console.log(`Total products in database: ${count[0].count}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

seedProducts();
