import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function updateProductCompanies() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'dms_db'
  });

  try {
    // Get all companies
    const [companies] = await connection.execute('SELECT id, name FROM companies');
    console.log('Companies found:', companies.length);
    
    // Map company names to IDs
    const companyMap = {};
    companies.forEach(c => {
      companyMap[c.name.toLowerCase()] = c.id;
    });
    
    console.log('Company map:', companyMap);
    
    // Get all products
    const [products] = await connection.execute('SELECT id, name, company_id FROM products');
    console.log('Products found:', products.length);
    
    let updated = 0;
    
    // Define mapping based on product names
    for (const product of products) {
      const name = product.name.toLowerCase();
      let newCompanyId = null;
      
      // Soap products
      if (name.includes('lux') || name.includes('dove') || name.includes('santoor') || name.includes('life boy')) {
        newCompanyId = companyMap['unilever bangladesh'] || companyMap['soap industries'];
      }
      // Diaper products  
      else if (name.includes('diaper')) {
        newCompanyId = companyMap['unilever bangladesh'] || companyMap['pran-rfl group'];
      }
      // Oil products
      else if (name.includes('oil') || name.includes('食用油')) {
        newCompanyId = companyMap['pran-rfl group'] || companyMap['dbm group'];
      }
      // Rice products
      else if (name.includes('rice')) {
        newCompanyId = companyMap['city group'] || companyMap['desh cheng'];
      }
      // Sugar, Flour, Salt
      else if (name.includes('sugar') || name.includes('flour') || name.includes('salt')) {
        newCompanyId = companyMap['city group'] || companyMap['bangladesh fish'];
      }
      // Shampoo, Toothpaste
      else if (name.includes('shampoo') || name.includes('toothpaste') || name.includes('toothbrush')) {
        newCompanyId = companyMap['unilever bangladesh'] || companyMap['nestle bangladesh'];
      }
      // Baby products
      else if (name.includes('baby') || name.includes('milk') || name.includes('food')) {
        newCompanyId = companyMap['nestle bangladesh'] || companyMap['unilever bangladesh'];
      }
      // Water, Juice, Soft Drink
      else if (name.includes('water') || name.includes('juice') || name.includes('soft drink') || name.includes('energy')) {
        newCompanyId = companyMap['coca-cola bangladesh'] || companyMap['pepsico bangladesh'];
      }
      // Biscuit, Chips, Noodles, Chocolate
      else if (name.includes('biscuit') || name.includes('chips') || name.includes('noodles') || name.includes('chocolate')) {
        newCompanyId = companyMap['partex group'] || companyMap['akij group'];
      }
      // Default - random company
      else {
        newCompanyId = companies[Math.floor(Math.random() * companies.length)].id;
      }
      
      if (newCompanyId) {
        await connection.execute(
          'UPDATE products SET company_id = ? WHERE id = ?',
          [newCompanyId, product.id]
        );
        updated++;
      }
    }
    
    console.log(`Successfully updated ${updated} products`);
    
    // Show sample products with company names
    const [sampleProducts] = await connection.execute(`
      SELECT p.name, c.name as company_name 
      FROM products p 
      LEFT JOIN companies c ON p.company_id = c.id 
      LIMIT 10
    `);
    console.log('\nSample products:');
    sampleProducts.forEach(p => {
      console.log(`- ${p.name} -> ${p.company_name}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

updateProductCompanies();
