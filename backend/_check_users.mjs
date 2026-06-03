import pkg from 'pg';
const { Pool } = pkg;
const pool = new Pool({ host:'localhost', port:5432, user:'postgres', password:'postgres', database:'dms_db' });
const r = await pool.query("SELECT u.id, u.username, u.role_id, r.name as role FROM users u JOIN roles r ON r.id = u.role_id ORDER BY u.id");
console.log('Users:', JSON.stringify(r.rows, null, 2));
await pool.end();
