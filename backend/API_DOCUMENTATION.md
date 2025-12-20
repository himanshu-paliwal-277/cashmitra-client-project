# Cashmitra Backend API Documentation

## Overview

The Cashmitra Backend API provides comprehensive endpoints for managing a marketplace platform for buying and selling electronic devices. The API follows RESTful conventions and includes proper authentication, validation, and error handling.

## Base URL

```
http://localhost:5000/api
```

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow a consistent format:

```json
{
  "success": true|false,
  "message": "Response message",
  "data": {}, // Response data
  "count": 10, // For paginated responses
  "total": 100, // Total items available
  "page": 1, // Current page
  "pages": 10 // Total pages
}
```

## Error Handling

Error responses include appropriate HTTP status codes and detailed error information:

```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

## HTTP Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

---

# Category Management API

## Endpoints

### Get All Categories

```http
GET /api/categories
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `search` (optional): Search term for category names
- `parent` (optional): Filter by parent category ID
- `sortBy` (optional): Sort field (name, createdAt)
- `sortOrder` (optional): Sort order (asc, desc)

**Response:**

```json
{
  "success": true,
  "count": 10,
  "total": 25,
  "page": 1,
  "pages": 3,
  "data": [
    {
      "_id": "category_id",
      "name": "Smartphones",
      "slug": "smartphones",
      "description": "Mobile phones and accessories",
      "parentCategory": null,
      "subcategories": ["subcategory_id"],
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Category by ID

```http
GET /api/categories/:id
```

### Create Category

```http
POST /api/categories
```

**Authentication:** Required (Admin)

**Request Body:**

```json
{
  "name": "Smartphones",
  "description": "Mobile phones and accessories",
  "parentCategory": "parent_category_id", // optional
  "metadata": {
    "icon": "smartphone-icon.svg",
    "color": "#007bff"
  }
}
```

### Update Category

```http
PUT /api/categories/:id
```

**Authentication:** Required (Admin)

### Delete Category

```http
DELETE /api/categories/:id
```

**Authentication:** Required (Admin)

### Get Category Hierarchy

```http
GET /api/categories/:id/hierarchy
```

### Get Category Tree

```http
GET /api/categories/tree
```

---

# Product Management API

## Endpoints

### Search Products

```http
GET /api/products/search
```

**Query Parameters:**

- `q` (optional): Search query
- `category` (optional): Category ID
- `brand` (optional): Brand name
- `minPrice` (optional): Minimum price
- `maxPrice` (optional): Maximum price
- `condition` (optional): Product condition
- `location` (optional): Location filter
- `sortBy` (optional): Sort field
- `sortOrder` (optional): Sort order
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:**

```json
{
  "success": true,
  "count": 10,
  "total": 150,
  "data": [
    {
      "_id": "product_id",
      "brand": "Apple",
      "model": "iPhone 14",
      "variant": "128GB Blue",
      "category": {
        "_id": "category_id",
        "name": "Smartphones"
      },
      "images": ["image1.jpg"],
      "specifications": {
        "storage": "128GB",
        "color": "Blue"
      },
      "inventory": [
        {
          "_id": "inventory_id",
          "price": 45000,
          "condition": "like-new",
          "quantity": 5,
          "partner": {
            "shopName": "TechStore"
          }
        }
      ]
    }
  ]
}
```

### Get Product Details

```http
GET /api/products/:id
```

### Get Product Suggestions

```http
GET /api/products/suggestions
```

### Get Categories

```http
GET /api/products/categories
```

### Get Brands

```http
GET /api/products/brands
```

### Get Filters

```http
GET /api/products/filters
```

---

# Sales Processing API

## Endpoints

### Create Order

```http
POST /api/sales/orders
```

**Authentication:** Required

**Request Body:**

```json
{
  "items": [
    {
      "inventoryId": "inventory_id",
      "quantity": 1
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "phone": "9876543210"
  },
  "paymentMethod": "card",
  "couponCode": "SAVE10" // optional
}
```

**Response:**

```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "order": {
      "_id": "order_id",
      "orderNumber": "ORD-2024-001",
      "orderType": "buy",
      "user": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "items": [...],
      "totalAmount": 45000,
      "status": "pending",
      "paymentDetails": {
        "method": "card",
        "status": "pending"
      }
    },
    "transactions": [...],
    "paymentRequired": 45000
  }
}
```

### Process Payment

```http
POST /api/sales/orders/:orderId/payment
```

**Authentication:** Required

**Request Body:**

```json
{
  "paymentDetails": {
    "method": "card",
    "transactionId": "txn_123456",
    "gatewayResponse": {
      "status": "success",
      "reference": "ref_123"
    }
  }
}
```

### Get Order Details

```http
GET /api/sales/orders/:orderId
```

**Authentication:** Required

### Get User Orders

```http
GET /api/sales/orders
```

**Authentication:** Required

**Query Parameters:**

- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Order status
- `orderType` (optional): Order type (buy/sell)
- `sortBy` (optional): Sort field
- `sortOrder` (optional): Sort order

### Cancel Order

```http
PATCH /api/sales/orders/:orderId/cancel
```

**Authentication:** Required

**Request Body:**

```json
{
  "reason": "Changed my mind"
}
```

### Update Shipping Status

```http
PATCH /api/sales/orders/:orderId/shipping
```

**Authentication:** Required (Partner/Admin)

**Request Body:**

```json
{
  "status": "shipped",
  "trackingNumber": "TRK123456",
  "estimatedDelivery": "2024-01-15T00:00:00.000Z"
}
```

### Get Sales Analytics

```http
GET /api/sales/analytics
```

**Authentication:** Required (Admin)

**Query Parameters:**

- `startDate` (optional): Start date for analytics
- `endDate` (optional): End date for analytics
- `groupBy` (optional): Group by day/week/month

---

# Inventory Management API

## Endpoints

### Get Inventory Items

```http
GET /api/inventory
```

**Query Parameters:**

- `page` (optional): Page number
- `limit` (optional): Items per page
- `partner` (optional): Partner ID
- `product` (optional): Product ID
- `condition` (optional): Item condition
- `isAvailable` (optional): Availability filter
- `minPrice` (optional): Minimum price
- `maxPrice` (optional): Maximum price
- `location` (optional): Location filter
- `search` (optional): Search term
- `sortBy` (optional): Sort field
- `sortOrder` (optional): Sort order

**Response:**

```json
{
  "success": true,
  "count": 10,
  "total": 100,
  "data": [
    {
      "_id": "inventory_id",
      "partner": {
        "_id": "partner_id",
        "shopName": "TechStore",
        "address": "Mumbai, Maharashtra"
      },
      "product": {
        "_id": "product_id",
        "brand": "Apple",
        "model": "iPhone 14",
        "variant": "128GB Blue"
      },
      "condition": "like-new",
      "price": 45000,
      "quantity": 5,
      "isAvailable": true,
      "description": "Excellent condition, barely used",
      "images": ["image1.jpg"],
      "warranty": {
        "duration": 6,
        "type": "seller"
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Inventory Item

```http
GET /api/inventory/:id
```

### Add Inventory Item

```http
POST /api/inventory
```

**Authentication:** Required (Partner/Admin)

**Request Body:**

```json
{
  "product": "product_id",
  "condition": "like-new",
  "price": 45000,
  "quantity": 5,
  "description": "Excellent condition, barely used",
  "images": ["image1.jpg", "image2.jpg"],
  "specifications": {
    "storage": "128GB",
    "color": "Blue"
  },
  "warranty": {
    "duration": 6,
    "type": "seller"
  },
  "location": "Mumbai, Maharashtra"
}
```

### Update Inventory Item

```http
PUT /api/inventory/:id
```

**Authentication:** Required (Partner/Admin)

### Delete Inventory Item

```http
DELETE /api/inventory/:id
```

**Authentication:** Required (Partner/Admin)

### Update Stock

```http
PATCH /api/inventory/:id/stock
```

**Authentication:** Required (Partner/Admin)

**Request Body:**

```json
{
  "quantity": 10,
  "operation": "set" // "set", "add", or "subtract"
}
```

### Bulk Update Inventory

```http
PATCH /api/inventory/bulk-update
```

**Authentication:** Required (Partner/Admin)

**Request Body:**

```json
{
  "updates": [
    {
      "id": "inventory_id_1",
      "price": 44000,
      "quantity": 3
    },
    {
      "id": "inventory_id_2",
      "isAvailable": false
    }
  ]
}
```

### Get Inventory Analytics

```http
GET /api/inventory/analytics/overview
```

**Authentication:** Required (Partner/Admin)

**Query Parameters:**

- `partnerId` (optional): Partner ID (Admin only)
- `startDate` (optional): Start date
- `endDate` (optional): End date

**Response:**

```json
{
  "success": true,
  "data": {
    "overview": {
      "totalValue": 1500000,
      "totalItems": 150,
      "totalQuantity": 300,
      "availableItems": 140
    },
    "inventoryByCondition": [
      {
        "_id": "like-new",
        "count": 50,
        "totalQuantity": 100,
        "avgPrice": 35000
      }
    ],
    "lowStockItems": [...],
    "outOfStockCount": 10,
    "topProductsByQuantity": [...]
  }
}
```

---

# Data Models

## Category Model

```javascript
{
  name: String, // required, unique
  slug: String, // auto-generated
  description: String,
  parentCategory: ObjectId, // reference to Category
  subcategories: [ObjectId], // references to Categories
  isActive: Boolean, // default: true
  metadata: Object, // additional data
  createdAt: Date,
  updatedAt: Date
}
```

## Product Model

```javascript
{
  category: ObjectId, // reference to Category, required
  brand: String, // required
  model: String, // required
  variant: String,
  images: [String], // URLs
  specifications: Object,
  depreciation: {
    rate: Number, // annual depreciation rate
    factors: Object // condition-based factors
  },
  conditionFactors: Object, // pricing factors by condition
  createdAt: Date,
  updatedAt: Date
}
```

## Inventory Model

```javascript
{
  partner: ObjectId, // reference to Partner, required
  product: ObjectId, // reference to Product, required
  condition: String, // enum: ['new', 'like-new', 'good', 'fair', 'poor']
  price: Number, // required
  quantity: Number, // required, default: 0
  reservedQuantity: Number, // default: 0
  isAvailable: Boolean, // default: true
  description: String,
  images: [String],
  specifications: Object,
  warranty: {
    duration: Number, // months
    type: String // enum: ['manufacturer', 'seller', 'extended', 'none']
  },
  location: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Order Model

```javascript
{
  orderNumber: String, // auto-generated
  orderType: String, // enum: ['buy', 'sell']
  user: ObjectId, // reference to User, required
  partner: ObjectId, // reference to Partner
  items: [{
    inventory: ObjectId, // reference to Inventory
    product: ObjectId, // reference to Product
    partner: ObjectId, // reference to Partner
    quantity: Number,
    unitPrice: Number,
    totalPrice: Number,
    condition: String
  }],
  totalAmount: Number, // required
  discountAmount: Number, // default: 0
  commission: Number, // platform commission
  paymentDetails: {
    method: String, // enum: ['card', 'upi', 'netbanking', 'wallet', 'cod']
    status: String, // enum: ['pending', 'completed', 'failed', 'refunded']
    transactionId: String,
    paidAt: Date,
    refundStatus: String
  },
  shippingDetails: {
    address: Object,
    status: String, // enum: ['pending', 'processing', 'shipped', 'delivered', 'returned']
    trackingNumber: String,
    estimatedDelivery: Date,
    updatedAt: Date
  },
  status: String, // enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned']
  deliveredAt: Date,
  metadata: Object,
  createdAt: Date,
  updatedAt: Date
}
```

---

# Error Codes

## Validation Errors (400)

- `VALIDATION_ERROR`: Request validation failed
- `INVALID_CREDENTIALS`: Invalid login credentials
- `INSUFFICIENT_STOCK`: Not enough inventory
- `ORDER_CANNOT_BE_CANCELLED`: Order status doesn't allow cancellation

## Authentication Errors (401)

- `TOKEN_MISSING`: JWT token not provided
- `TOKEN_INVALID`: JWT token is invalid or expired
- `USER_NOT_FOUND`: User account not found

## Authorization Errors (403)

- `ACCESS_DENIED`: Insufficient permissions
- `PARTNER_ONLY`: Endpoint requires partner access
- `ADMIN_ONLY`: Endpoint requires admin access

## Resource Errors (404)

- `CATEGORY_NOT_FOUND`: Category not found
- `PRODUCT_NOT_FOUND`: Product not found
- `INVENTORY_NOT_FOUND`: Inventory item not found
- `ORDER_NOT_FOUND`: Order not found

## Business Logic Errors (422)

- `DUPLICATE_CATEGORY`: Category name already exists
- `PARENT_CATEGORY_INVALID`: Invalid parent category
- `PAYMENT_FAILED`: Payment processing failed
- `STOCK_UNAVAILABLE`: Product out of stock

---

# Rate Limiting

API endpoints are rate limited to prevent abuse:

- **General endpoints**: 100 requests per 15 minutes
- **Authentication endpoints**: 5 requests per 15 minutes
- **Search endpoints**: 50 requests per 15 minutes

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

# Pagination

All list endpoints support pagination with the following parameters:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

Pagination information is included in the response:

```json
{
  "count": 20,
  "total": 150,
  "page": 1,
  "pages": 8
}
```

---

# Sorting and Filtering

Most list endpoints support sorting and filtering:

**Sorting:**

- `sortBy`: Field to sort by
- `sortOrder`: `asc` or `desc`

**Common Filters:**

- `search`: Text search
- `status`: Status filter
- `dateRange`: Date range filters
- `priceRange`: Price range filters

---

# Webhooks

The API supports webhooks for real-time notifications:

## Supported Events

- `order.created`
- `order.paid`
- `order.shipped`
- `order.delivered`
- `order.cancelled`
- `inventory.low_stock`
- `inventory.out_of_stock`

## Webhook Payload

```json
{
  "event": "order.created",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "data": {
    "order": {...}
  }
}
```

---

# Testing

Use the following test credentials for API testing:

**Admin User:**

- Email: `admin@cashmitra.com`
- Password: `admin123`

**Partner User:**

- Email: `partner@techstore.com`
- Password: `partner123`

**Regular User:**

- Email: `user@example.com`
- Password: `user123`

**Test Environment:**

```
Base URL: http://localhost:5000/api
Database: cashmitra_test
```

---

# Support

For API support and questions:

- Email: api-support@cashmitra.com
- Documentation: https://docs.cashmitra.com
- Status Page: https://status.cashmitra.com
