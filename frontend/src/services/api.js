import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 30000
});

// Request interceptor to add token to Authorization header
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('token_expiry');
      window.dispatchEvent(new Event('auth:logout'));
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  register: (data) => api.post('/auth/register', data),
  shopkeeperRegister: (data) => api.post('/auth/shopkeeper-register', data),
  getUsers: (params) => api.get('/auth/users', { params }),
  updateUser: (id, data) => api.put(`/auth/users/${id}`, data),
  deleteUser: (id) => api.delete(`/auth/users/${id}`),
  changePassword: (data) => api.post('/auth/change-password', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  uploadProfilePicture: (id, formData) => api.post(`/users/${id}/upload-photo`, formData),
  deleteProfilePicture: (id) => api.delete(`/users/${id}/upload-photo`)
};

export const productService = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  getLowStock: () => api.get('/products/low-stock'),
  getExpired: () => api.get('/products/expired'),
  getExpiringSoon: () => api.get('/products/expiring-soon')
};

export const retailerService = {
  getAll: (params) => api.get('/retailers', { params }),
  getById: (id) => api.get(`/retailers/${id}`),
  create: (data) => api.post('/retailers', data),
  update: (id, data) => api.put(`/retailers/${id}`, data),
  delete: (id) => api.delete(`/retailers/${id}`),
  getAreas: () => api.get('/retailers/areas'),
  getBalance: (id) => api.get(`/retailers/${id}/balance`)
};

export const invoiceService = {
  getAll: (params) => api.get('/invoices', { params }),
  getById: (id) => api.get(`/invoices/${id}`),
  create: (data) => api.post('/invoices', data),
  updatePayment: (id, data) => api.put(`/invoices/${id}/payment`, data)
};

export const paymentService = {
  getAll: (params) => api.get('/payments', { params }),
  getById: (id) => api.get(`/payments/${id}`),
  create: (data) => api.post('/payments', data),
  getByRetailer: (retailerId) => api.get(`/payments/retailer/${retailerId}`)
};

export const stockService = {
  getHistory: (params) => api.get('/stock/history', { params }),
  getPurchaseOrders: (params) => api.get('/stock/purchase-orders', { params }),
  createPurchaseOrder: (data) => api.post('/stock/purchase-orders', data),
  receivePurchaseOrder: (id, data) => api.put(`/stock/purchase-orders/${id}/receive`, data)
};

export const orderService = {
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data)
};

export const reportService = {
  getSummary: (params) => api.get('/reports/summary', { params }),
  dailySales: (params) => api.get('/reports/daily-sales', { params }),
  productSales: (params) => api.get('/reports/product-sales', { params }),
  companySales: (params) => api.get('/reports/company-sales', { params }),
  profit: (params) => api.get('/reports/profit', { params }),
  stock: (params) => api.get('/reports/stock', { params }),
  due: (params) => api.get('/reports/due', { params }),
  expiry: (params) => api.get('/reports/expiry', { params })
};

export const dashboardService = {
  getSummary: () => api.get('/dashboard/summary')
};

export const companyService = {
  getCompanies: (params) => api.get('/companies', { params }),
  createCompany: (data) => api.post('/companies', data),
  updateCompany: (id, data) => api.put(`/companies/${id}`, data),
  deleteCompany: (id) => api.delete(`/companies/${id}`),
  getCategories: (params) => api.get('/categories', { params }),
  createCategory: (data) => api.post('/categories', data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/categories/${id}`)
};

export const roleService = {
  getAll: () => api.get('/roles'),
  getPermissions: () => api.get('/roles/permissions'),
  getById: (id) => api.get(`/roles/${id}`),
  create: (data) => api.post('/roles', data),
  update: (id, data) => api.put(`/roles/${id}`, data),
  delete: (id) => api.delete(`/roles/${id}`)
};

export const notificationService = {
  getAll: (params) => api.get('/notifications', { params }),
  getUnread: () => api.get('/notifications/unread'),
  getById: (id) => api.get(`/notifications/${id}`),
  getByCategory: (category, params) => api.get(`/notifications/category/${category}`, { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/all/read'),
  delete: (id) => api.delete(`/notifications/${id}`)
};

export default api;
