export const generateInvoiceNo = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INV${year}${month}${random}`;
};

export const generatePaymentNo = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).padStart(4, '0');
  return `PAY${year}${month}${random}`;
};

export const generatePONo = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).padStart(4, '0');
  return `PO${year}${month}${random}`;
};

export const generateCode = (prefix) => {
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `${prefix}${random}`;
};

export const formatCurrency = (amount) => {
  return Number(amount).toFixed(2);
};

export const calculateDiscount = (subtotal, discountPercent) => {
  return (subtotal * discountPercent) / 100;
};

export const paginate = (page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  return { offset, limit };
};

export const buildPaginatedResponse = (data, total, page, limit) => {
  return {
    data,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit)
    }
  };
};
