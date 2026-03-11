import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  me: () => api.get('/auth/me'),
  register: (data) => api.post('/auth/register', data),
  getUsers: () => api.get('/auth/users'),
  updateUser: (id, data) => api.put(`/auth/users/${id}`, data),
  deleteUser: (id) => api.delete(`/auth/users/${id}`)
};

export const productService = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  getLowStock: () => api.get('/products/low-stock')
};

export const retailerService = {
  getAll: (params) => api.get('/retailers', { params }),
  getById: (id) => api.get(`/retailers/${id}`),
  create: (data) => api.post('/retailers', data),
  update: (id, data) => api.put(`/retailers/${id}`, data),
  delete: (id) => api.delete(`/retailers/${id}`),
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
  getRetailerPayments: (retailerId) => api.get(`/payments/retailer/${retailerId}`)
};

export const reportService = {
  dailySales: (params) => api.get('/reports/daily-sales', { params }),
  productSales: (params) => api.get('/reports/product-sales', { params }),
  companySales: (params) => api.get('/reports/company-sales', { params }),
  profit: (params) => api.get('/reports/profit', { params }),
  stock: () => api.get('/reports/stock'),
  due: () => api.get('/reports/due')
};

export const dashboardService = {
  getSummary: () => api.get('/dashboard/summary')
};

export const stockService = {
  getHistory: (params) => api.get('/stock/history', { params }),
  getPurchaseOrders: (params) => api.get('/stock/purchase-orders', { params }),
  createPurchaseOrder: (data) => api.post('/stock/purchase-orders', data),
  receivePurchaseOrder: (id) => api.put(`/stock/purchase-orders/${id}/receive`)
};

export const companyService = {
  getCompanies: () => api.get('/companies'),
  createCompany: (data) => api.post('/companies', data),
  updateCompany: (id, data) => api.put(`/companies/${id}`, data),
  deleteCompany: (id) => api.delete(`/companies/${id}`),
  getCategories: (params) => api.get('/categories', { params }),
  createCategory: (data) => api.post('/categories', data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/categories/${id}`)
};

export default api;
