# Database Commands

## Quick Database Reset
```bash
# Reset entire database (MySQL)
mysql -u root -p dms < database/schema.sql
```

## Database Initialization
```bash
# Initialize database with default roles, permissions, and admin user
# Runs automatically on server startup via config/database.js
npm run dev:backend
```

## Seed Test Data
```bash
# Add test data (companies, products, retailers)
node backend/src/seeds/seedData.js
```

## View Database Tables
```bash
# List all tables in DMS database
mysql -u root -p -e "USE dms; SHOW TABLES;"
```

## Database Backup
```bash
# Create database backup
mysqldump -u root -p dms > dms_backup_$(date +%Y%m%d_%H%M%S).sql
```

## Database Restore
```bash
# Restore from backup
mysql -u root -p dms < dms_backup_20240101_120000.sql
```

## Check Database Connection
```bash
# Test MySQL connection
mysql -u root -p -e "SELECT 1"
```

---

## Key Tables
- **users** - User accounts with roles
- **roles** - 7 predefined roles (admin, manager, salesman, etc.)
- **permissions** - 30 fine-grained permissions
- **role_permissions** - Maps roles to permissions
- **products** - Product catalog with stock tracking
- **retailers** - Retailer accounts with credit limits
- **invoices** - Sales invoices
- **invoice_items** - Invoice line items
- **payments** - Payment records
- **stock_logs** - Stock movement audit trail (IN/OUT/ADJUSTMENT)
- **companies** - Product companies/manufacturers
- **categories** - Product categories
- **purchase_orders** - Stock replenishment orders
- **purchase_order_items** - Purchase order line items
- **notifications** - System notifications
