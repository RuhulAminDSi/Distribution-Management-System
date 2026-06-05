# DMS API Collection

Postman collection containing all **53 API endpoints** grouped by module.

## How to Use

1. Open **Postman** → **File** → **Import** → select `DMS.postman_collection.json`
2. Set a **collection variable** `baseUrl` = `http://localhost:5000`
3. Start with **Auth → Login** to get the JWT cookie/Bearer token
4. Subsequent authenticated requests will use the cookie automatically

## API Modules

| Folder | Endpoints | Description |
|--------|-----------|-------------|
| Auth | 12 | Login, register, user CRUD, password mgmt |
| Roles & Permissions | 6 | Role & permission CRUD |
| Companies & Categories | 10 | Company & category CRUD |
| Products | 8 | Product CRUD + low-stock/expired queries |
| Stock | 4 | Stock history, purchase orders |
| Invoices | 4 | Invoice CRUD + payment update |
| Orders | 3 | Purchase order listing/create |
| Payments | 4 | Payment CRUD + by-retailer |
| Retailers | 7 | Retailer CRUD + balance + areas |
| Dashboard | 1 | Dashboard summary |
| Reports | 8 | Sales, profit, stock, due, expiry reports |
| Notifications | 7 | Notification list, read, delete |
| Upload | 2 | Profile picture upload/delete |
| Public Messages | 10 | WhatsApp-style messaging |
| Chatbot | 1 | AI chatbot |
| Health | 1 | Health check |

**Note:** Update `baseUrl` to your production URL when deploying.
