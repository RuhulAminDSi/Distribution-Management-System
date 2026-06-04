/**
 * Validation middleware for Express
 * Centralizes validation rules for all controllers
 * 
 * Usage:
 *   router.post('/login', validateLogin, authController.login);
 *   router.post('/products', validateProduct, productController.create);
 */

import { body, param, query as queryValidator, validationResult } from 'express-validator';
import { ApiError } from './ApiError.js';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const fieldErrors = errors.array().reduce((acc, err) => {
      const field = err.path || err.param || 'field';
      acc[field] = err.msg;
      return acc;
    }, {});
    throw new ApiError(400, 'Validation failed', fieldErrors);
  }
  next();
};

// ============ AUTH VALIDATIONS ============
export const validateLogin = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

export const validateRegister = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('full_name').trim().notEmpty().withMessage('Full name is required'),
  body('email').optional(),
  body('phone').optional(),
  handleValidationErrors
];

export const validateUpdateUser = [
  param('id').notEmpty().withMessage('Invalid user ID'),
  body('username').optional().trim().notEmpty().withMessage('Username cannot be empty'),
  body('full_name').optional().trim().notEmpty().withMessage('Full name cannot be empty'),
  body('email').optional(),
  body('phone').optional(),
  handleValidationErrors
];

export const validateChangePassword = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) throw new Error('Passwords do not match');
    return true;
  }),
  handleValidationErrors
];

export const validateResetPassword = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  handleValidationErrors
];

export const validateShopkeeperRegister = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('full_name').trim().notEmpty().withMessage('Full name is required'),
  body('email').optional({ values: 'falsy' }).isEmail().withMessage('Invalid email address'),
  body('phone').optional({ values: 'falsy' }),
  handleValidationErrors
];

// ============ PRODUCT VALIDATIONS ============
export const validateCreateProduct = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('code').optional({ values: 'falsy' }).trim(),
  body('category_id').optional(),
  body('stock_quantity').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative number'),
  handleValidationErrors
];

export const validateUpdateProduct = [
  param('id').notEmpty().withMessage('Invalid product ID'),
  body('name').optional().trim().notEmpty().withMessage('Product name cannot be empty'),
  body('code').optional().trim().notEmpty().withMessage('Product code cannot be empty'),
  handleValidationErrors
];

// ============ INVOICE VALIDATIONS ============
export const validateCreateInvoice = [
  body('retailer_id').notEmpty().withMessage('Valid retailer required'),
  body('invoice_date').notEmpty().withMessage('Invoice date is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.product_id').notEmpty().withMessage('Valid product ID required for each item'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  handleValidationErrors
];

// ============ RETAILER VALIDATIONS ============
export const validateCreateRetailer = [
  body('name').trim().notEmpty().withMessage('Retailer name is required'),
  body('owner_name').optional().trim(),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('email').optional(),
  handleValidationErrors
];

export const validateUpdateRetailer = [
  param('id').notEmpty().withMessage('Invalid retailer ID'),
  body('name').optional().trim().notEmpty().withMessage('Retailer name cannot be empty'),
  body('owner_name').optional().trim(),
  body('phone').optional().notEmpty().withMessage('Phone number cannot be empty'),
  handleValidationErrors
];

// ============ STOCK VALIDATIONS ============
export const validateAdjustStock = [
  body('product_id').notEmpty().withMessage('Valid product ID required'),
  body('quantity').notEmpty().withMessage('Quantity is required'),
  body('type').notEmpty().withMessage('Stock type is required'),
  handleValidationErrors
];

// ============ PAYMENT VALIDATIONS ============
export const validateCreatePayment = [
  body('retailer_id').notEmpty().withMessage('Retailer is required'),
  body('amount').notEmpty().withMessage('Amount is required'),
  body('payment_date').notEmpty().withMessage('Payment date is required'),
  body('payment_method').notEmpty().withMessage('Payment method is required'),
  handleValidationErrors
];

// ============ COMPANY VALIDATIONS ============
export const validateCreateCompany = [
  body('name').trim().notEmpty().withMessage('Company name is required'),
  body('email').notEmpty().withMessage('Email is required'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('address').optional().trim(),
  handleValidationErrors
];

export const validateUpdateCompany = [
  param('id').notEmpty().withMessage('Invalid company ID'),
  body('name').optional().trim().notEmpty().withMessage('Company name cannot be empty'),
  body('email').optional().notEmpty().withMessage('Email cannot be empty'),
  handleValidationErrors
];

// ============ ROLE VALIDATIONS ============
export const validateCreateRole = [
  body('name').trim().notEmpty().withMessage('Role name is required'),
  body('description').optional().trim(),
  handleValidationErrors
];

export const validateUpdateRolePermissions = [
  param('id').notEmpty().withMessage('Invalid role ID'),
  body('permissions').optional().isArray().withMessage('Permissions must be an array'),
  handleValidationErrors
];
