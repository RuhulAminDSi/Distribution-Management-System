import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const areas = [
  'Gulshan', 'Banani', 'Dhanmondi', 'Mirpur', 'Uttara', 'Baridhara',
  'Mohakhali', 'Badda', 'Rampura', 'Malibagh', 'Shahbagh', 'Paltan',
  'Motijheel', 'Lalbagh', 'Keraniganj', 'Savar', 'Demra', 'Jatrabari',
  'Siddeshwari', 'Kamlapur', 'Bangshal', 'Wari', 'Kotwali'
];

const retailerNames = [
  'City Store', 'Metro Shop', 'Daily Needs', 'Super Shop', 'Quick Mart',
  'Family Mart', 'Best Buy', 'Quality Store', 'Prime Store', 'Easy Shop',
  'Happy Store', 'Lucky Shop', 'Modern Store', 'New Market', 'Old Town Shop',
  'Riverside Store', 'Hill Top Shop', 'Green Valley Store', 'Sunrise Mart',
  'Moonlight Shop', 'Star Store', 'Galaxy Shop', 'Universe Mart', 'Planet Store',
  'Fashion House', 'Clothing Corner', 'Textile World', 'Garments Plus',
  'Pharma Plus', 'Medicine Corner', 'Health Shop', 'Medical Store',
  'Grocery Hub', 'Fresh Mart', 'Organic Store', 'Daily Fresh',
  'Tasteful Bites', 'Food Court', 'Restaurant Depot', 'Catering Supplies',
  'Electronics Hub', 'Tech World', 'Gadget Zone', 'Mobile Palace',
  'Stationery House', 'Book Corner', 'Office Supplies', 'School Essentials',
  'Hardware Store', 'Paint World', 'Tools Center', 'Electrical Depot',
  'Gift Gallery', 'Toy Paradise', 'Sports Arena', 'Fitness Zone',
  'Beauty Parlor', 'Salon Supplies', 'Fashion Accessories', 'Jewelry Corner',
  'Footwear Factory', 'Bag House', 'Watch World', 'Optical Store',
  'Bike Center', 'Car Accessories', 'Pet Supplies', 'Garden Center',
  'Home Decor', 'Furniture House', 'Kitchen World', 'Bath Essentials',
  'Cleaning Supplies', 'Laundry Service', 'Repair Shop', 'Key Maker',
  'Photo Studio', 'Cafe Corner', 'Tea Stall', 'Bakery House',
  'Sweet Mart', 'Fruit Corner', 'Vegetable Shop', 'Meat & Fish',
  'Coffee World', 'Ice Cream Parlor', 'Pizza Hub', 'Burger Joint',
  'Chicken Republic', 'Fast Food Corner', 'Restaurant', 'Hotel Supplies',
  'Event Management', 'Party Accessories', 'Decoration House', 'Flower Shop'
];

async function seedRetailers() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'dms_db'
  });

  try {
    let inserted = 0;
    for (let i = 0; i < 100; i++) {
      const name = retailerNames[i % retailerNames.length] + (i >= retailerNames.length ? ` ${Math.floor(i / retailerNames.length) + 1}` : '');
      const area = areas[Math.floor(Math.random() * areas.length)];
      
      try {
        await connection.execute(
          `INSERT INTO retailers (name, code, owner_name, phone, address, area, credit_limit, due_limit) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            name,
            'RTL' + String(i + 1).padStart(4, '0'),
            'Owner ' + (i + 1),
            '01' + Math.floor(Math.random() * 9000000000 + 1000000000),
            area + ', Dhaka',
            area,
            Math.floor(Math.random() * 50000) + 10000,
            Math.floor(Math.random() * 30000) + 5000
          ]
        );
        inserted++;
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          console.log(`Retailer already exists: ${name}`);
        } else {
          console.error(`Error inserting ${name}:`, err.message);
        }
      }
    }
    
    console.log(`Successfully inserted ${inserted} retailers`);
    
    const [count] = await connection.execute('SELECT COUNT(*) as count FROM retailers');
    console.log(`Total retailers in database: ${count[0].count}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

seedRetailers();
