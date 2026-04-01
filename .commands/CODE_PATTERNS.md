# Code Patterns and Best Practices

## Backend Service Pattern

Services handle business logic and database operations. Always separate from controllers.

### Service Structure
```javascript
// services/productService.js
import { query } from '../config/database.js';

export const productService = {
  async getAll(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const [products] = await query(
      'SELECT * FROM products WHERE is_active = 1 LIMIT ? OFFSET ?',
      [limit, offset]
    );
    return products;
  },

  async create(data) {
    const [result] = await query(
      'INSERT INTO products (name, company_id, price, stock_quantity) VALUES (?, ?, ?, ?)',
      [data.name, data.company_id, data.price, data.stock_quantity]
    );
    return result.insertId;
  }
};
```

## Backend Controller Pattern

Controllers handle HTTP requests and delegate to services.

### Controller Structure
```javascript
// controllers/productController.js
import { productService } from '../services/productService.js';

export const productController = {
  async getAll(req, res, next) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const products = await productService.getAll(page, limit);
      res.json(products);
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const { name, company_id, price, stock_quantity } = req.body;
      
      if (!name || !company_id) {
        return res.status(400).json({ message: 'Name and company required' });
      }

      const id = await productService.create(req.body);
      res.status(201).json({ id, message: 'Product created' });
    } catch (error) {
      next(error);
    }
  }
};
```

## Backend Route Pattern

Routes define endpoints with authentication and permission checks.

### Route Structure
```javascript
// routes/productRoutes.js
import express from 'express';
import { authorize, permit } from '../middleware/auth.js';
import { productController } from '../controllers/productController.js';

const router = express.Router();

// All routes require authentication
router.use(authorize);

// List products (requires permission)
router.get('/', permit('products_view'), productController.getAll);

// Create product
router.post('/', permit('products_create'), productController.create);

// Update product
router.put('/:id', permit('products_edit'), productController.update);

// Delete product
router.delete('/:id', permit('products_delete'), productController.delete);

export default router;
```

## Backend Error Handling Pattern

Always use try/catch and pass errors to next(error) middleware.

```javascript
async function someAsyncFunction(req, res, next) {
  try {
    // Business logic here
    const result = await doSomething();
    res.json(result);
  } catch (error) {
    // Don't use res.status().json(error), use next()
    next(error);
    // Error middleware will handle it with proper status codes
  }
}
```

## Database Transaction Pattern

Use transactions for operations that must succeed atomically.

```javascript
import { query, getConnection } from '../config/database.js';

export const invoiceService = {
  async createWithItems(invoiceData, items) {
    const conn = await getConnection();
    try {
      await conn.beginTransaction();
      
      // Create invoice
      const [invoiceResult] = await conn.query(
        'INSERT INTO invoices (retailer_id, total) VALUES (?, ?)',
        [invoiceData.retailer_id, invoiceData.total]
      );
      const invoiceId = invoiceResult.insertId;
      
      // Create items
      for (const item of items) {
        await conn.query(
          'INSERT INTO invoice_items (invoice_id, product_id, quantity) VALUES (?, ?, ?)',
          [invoiceId, item.product_id, item.quantity]
        );
        
        // Deduct stock
        await conn.query(
          'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
          [item.quantity, item.product_id]
        );
      }
      
      await conn.commit();
      return invoiceId;
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }
};
```

## Frontend Component Pattern

Use functional components with hooks. Always handle loading and error states.

```javascript
import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { productService } from './services/api';

function ProductList() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const response = await productService.getAll({ page: 1, limit: 20 });
        setProducts(response.data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchProducts();
    }
  }, [user]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!products.length) return <div>No products found</div>;

  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default ProductList;
```

## Frontend Form Pattern

Always validate before submission and handle API errors.

```javascript
function CreateProductForm() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({ name: '', price: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    const newErrors = {};
    if (!formData.name) newErrors.name = t('name_required');
    if (!formData.price) newErrors.price = t('price_required');
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      await productService.create(formData);
      // Success handling
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || 'Error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder={t('product_name')}
      />
      {errors.name && <span className="error">{errors.name}</span>}
      
      <button type="submit" disabled={loading}>
        {loading ? t('saving') : t('save')}
      </button>
    </form>
  );
}
```

## Permission Checking Pattern

Always check permissions before rendering sensitive operations.

```javascript
function ProductActions({ product }) {
  const { hasPermission } = useAuth();

  return (
    <div>
      {hasPermission('products_edit') && (
        <button onClick={() => editProduct(product.id)}>Edit</button>
      )}
      {hasPermission('products_delete') && (
        <button onClick={() => deleteProduct(product.id)}>Delete</button>
      )}
    </div>
  );
}
```

## SQL Injection Prevention

Always use parameterized queries with `?` placeholders.

```javascript
// GOOD - Uses placeholders
const [result] = await query(
  'SELECT * FROM users WHERE username = ? AND is_active = 1',
  [username]
);

// BAD - String concatenation (SQL injection risk!)
const [result] = await query(
  `SELECT * FROM users WHERE username = '${username}' AND is_active = 1`
);
```
