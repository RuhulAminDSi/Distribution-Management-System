import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const companies = [
  { name: 'Bangladesh Soap Industries', code: 'BSI' },
  { name: 'Olympic Consumer Products', code: 'OCP' },
  { name: 'RFL Plastics Ltd', code: 'RFL' },
  { name: 'Apex Consumer Electronics', code: 'ACE' },
  { name: 'Pran-RFL Group', code: 'PRAN' },
  { name: 'Bangladesh Fish', code: 'BF' },
  { name: 'City Group', code: 'CITY' },
  { name: 'Desh Cheng', code: 'DC' },
  { name: 'Kashmir Food Products', code: 'KFP' },
  { name: 'MGI Cement', code: 'MGI' },
  { name: 'Bata Shoe Company', code: 'BATA' },
  { name: 'Unilever Bangladesh', code: 'UNV' },
  { name: 'Nestle Bangladesh', code: 'NST' },
  { name: 'PepsiCo Bangladesh', code: 'PEP' },
  { name: 'Coca-Cola Bangladesh', code: 'COKE' },
  { name: 'Partex Group', code: 'PTX' },
  { name: 'DBM Group', code: 'DBM' },
  { name: 'Akij Group', code: 'AKJ' },
  { name: 'BRAC', code: 'BRAC' },
  { name: 'Panthochar', code: 'PTH' },
];

async function seedCompanies() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'dms_db'
  });

  try {
    let inserted = 0;
    for (const company of companies) {
      try {
        await connection.execute(
          `INSERT INTO companies (name, code, phone, address) VALUES (?, ?, ?, ?)`,
          [
            company.name,
            company.code,
            '01' + Math.floor(Math.random() * 9000000000 + 1000000000),
            'Dhaka, Bangladesh'
          ]
        );
        inserted++;
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          console.log(`Company already exists: ${company.name}`);
        } else {
          console.error(`Error inserting ${company.name}:`, err.message);
        }
      }
    }
    
    console.log(`Successfully inserted ${inserted} companies`);
    
    const [count] = await connection.execute('SELECT COUNT(*) as count FROM companies');
    console.log(`Total companies in database: ${count[0].count}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

seedCompanies();
