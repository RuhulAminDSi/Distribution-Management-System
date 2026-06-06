import { Router } from 'express';
import { query } from '../config/database.js';
import { isBot } from '../middleware/botDetector.js';

const router = Router();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const OG_IMAGE = `${FRONTEND_URL}/og-image.png`;

function ogHtml({ title, description, image, url, type = 'website' }) {
  const safe = (s) => (s || '').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta property="og:title" content="${safe(title)}">
<meta property="og:description" content="${safe(description)}">
<meta property="og:image" content="${safe(image)}">
<meta property="og:url" content="${safe(url)}">
<meta property="og:type" content="${safe(type)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${safe(title)}">
<meta name="twitter:description" content="${safe(description)}">
<meta name="twitter:image" content="${safe(image)}">
<title>${safe(title)}</title>
<meta http-equiv="refresh" content="0;url=${safe(url)}">
</head>
<body></body>
</html>`;
}

const pageMeta = {
  '/': { title: 'DMS - Distribution Suite', description: 'Distribution Management System' },
  '/login': { title: 'Login - DMS', description: 'Login to Distribution Management System' },
  '/register': { title: 'Register - DMS', description: 'Create an account' },
};

router.get('*', async (req, res, next) => {
  if (!isBot(req)) return next();

  const path = req.path;

  // Product detail pages: /products/123
  const productMatch = path.match(/^\/products\/(\d+)$/);
  if (productMatch) {
    try {
      const rows = await query('SELECT name, code FROM products WHERE id = ? AND is_active = 1', [productMatch[1]]);
      if (rows.length) {
        const p = rows[0];
        return res.send(ogHtml({
          title: p.name,
          description: `Product Code: ${p.code}`,
          image: `${OG_IMAGE}`,
          url: `${FRONTEND_URL}/products/${productMatch[1]}`,
        }));
      }
    } catch { /* fall through to default */ }
  }

  // Invoice pages: /invoices/123 (path might be /sales)
  const invoiceMatch = path.match(/^\/(?:sales|invoices)\/(\d+)$/);
  if (invoiceMatch) {
    try {
      const rows = await query(`
        SELECT i.invoice_no, i.total_amount, r.name AS retailer_name
        FROM invoices i
        LEFT JOIN retailers r ON i.retailer_id = r.id
        WHERE i.id = ? AND i.is_active = 1
      `, [invoiceMatch[1]]);
      if (rows.length) {
        const inv = rows[0];
        return res.send(ogHtml({
          title: `Invoice #${inv.invoice_no}`,
          description: `Retailer: ${inv.retailer_name} | Amount: ৳${inv.total_amount}`,
          image: `${OG_IMAGE}`,
          url: `${FRONTEND_URL}/invoices/${invoiceMatch[1]}`,
        }));
      }
    } catch { /* fall through */ }
  }

  // Static pages
  const meta = pageMeta[path];
  if (meta) {
    return res.send(ogHtml({
      ...meta,
      image: `${OG_IMAGE}`,
      url: `${FRONTEND_URL}${path}`,
    }));
  }

  next();
});

export default router;
