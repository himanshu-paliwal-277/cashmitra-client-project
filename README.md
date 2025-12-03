# Cashmitra

A comprehensive eCommerce platform for buying and selling electronic devices including mobiles, tablets, and laptops.

## Overview

Cashmitra is a full-stack device trading platform that enables users to sell their used devices and purchase refurbished electronics. The platform provides a seamless experience for customers, partners, agents, and administrators with role-based access control and comprehensive management features.

## Features

### Customer Features
- **Sell Devices**: Multi-step device evaluation flow with price quotes
  - Category selection (Mobile, Tablet, Laptop)
  - Brand and model selection
  - Device condition assessment through questionnaires
  - Screen defects evaluation
  - Accessories tracking
  - Instant price quotes
  - Pickup booking and scheduling

- **Buy Devices**: Browse and purchase refurbished devices
  - Marketplace with product listings
  - Detailed product information
  - Shopping cart functionality
  - Secure checkout process
  - Order tracking

- **Account Management**
  - User profile management
  - Order history and tracking
  - Digital wallet integration
  - KYC verification
  - Saved addresses
  - Help and support

### Partner Portal
- Dashboard with analytics
- Inventory management
- Order processing (buy/sell)
- Product catalog management
- Pricing and finance tools
- Commission tracking
- Wallet and payouts
- Returns management

### Agent Dashboard
- Agent login and authentication
- Task management
- Order processing support

### Admin Panel
- Comprehensive dashboard
- **Sell Management**
  - Category and product management
  - Question, defects, and accessories configuration
  - Session management
  - Lead tracking
  - Order processing

- **Buy Management**
  - Super category management
  - Product inventory
  - Order fulfillment
  - Returns and refunds

- **Catalog Management**
  - Products, categories, brands, and models
  - Condition questionnaires
  - Bulk operations

- **User Management**
  - User and partner management
  - Role-based permissions
  - KYC approvals
  - Partner applications

- **Pricing & Finance**
  - Dynamic pricing tables
  - Condition-based adjustments
  - Promotions management
  - Commission rules
  - Financial reports

## Tech Stack

### Frontend
- **Framework**: React 18.2.0
- **Build Tool**: Vite 7.2.4
- **Routing**: React Router DOM 6.3.0
- **Styling**: TailwindCSS 3.4.18, Styled Components 5.3.5
- **UI Components**: Lucide React (icons), Embla Carousel
- **State Management**: React Context API
- **HTTP Client**: Axios 1.12.2
- **Notifications**: React Hot Toast, React Toastify
- **Charts**: Recharts 2.15.4

### Backend
- **Runtime**: Node.js
- **Framework**: Express 4.18.2
- **Database**: MongoDB with Mongoose 7.4.0
- **Authentication**: JWT (jsonwebtoken 9.0.1), bcryptjs 2.4.3
- **File Upload**: Multer 1.4.5, Cloudinary 1.38.0
- **Security**: Helmet 7.0.0, XSS protection, Rate limiting
- **Email**: Nodemailer 6.9.4
- **WebSocket**: ws 8.14.2
- **Testing**: Jest 29.6.1, Supertest 6.3.3

## Project Structure

```
cashmitra-client-project/
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── pages/        # Page components
│   │   ├── components/   # Reusable components
│   │   ├── AppRoutes.jsx # Route configuration
│   │   └── ...
│   ├── public/           # Static assets
│   └── package.json
│
└── backend/              # Express backend API
    ├── src/              # Source code
    ├── scripts/          # Database seeds and utilities
    ├── uploads/          # File uploads directory
    └── package.json
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd cashmitra-client-project
```

2. Install frontend dependencies
```bash
cd frontend
npm install
```

3. Install backend dependencies
```bash
cd backend
npm install
```

4. Set up environment variables
- Create `.env` file in the backend directory
- Configure MongoDB connection string, JWT secret, Cloudinary credentials, etc.

### Running the Application

#### Development Mode

Frontend:
```bash
cd frontend
npm run dev
```

Backend:
```bash
cd backend
npm run dev
```

#### Production Build

Frontend:
```bash
cd frontend
npm run build
npm run preview
```

Backend:
```bash
cd backend
npm start
```

## API Proxy

The frontend is configured to proxy API requests to `http://localhost:5000` in development mode.

## Code Quality

### Frontend
- ESLint for code linting
- Prettier for code formatting
- Run `npm run lint` to check for issues
- Run `npm run format` to format code

## Testing

Backend:
```bash
cd backend
npm test
```

## Key Routes

### Public Routes
- `/` - Home page
- `/login`, `/signup` - Authentication
- `/about`, `/contact`, `/help` - Information pages
- `/privacy`, `/terms`, `/returns` - Legal pages

### Sell Flow
- `/sell-device` - Sell device home
- `/sell/category` - Category selection
- `/sell/brand` - Brand selection
- `/sell/model` - Model selection
- `/sell/evaluation` - Device evaluation
- `/sell/quote` - Price quote
- `/sell/booking` - Pickup booking
- `/sell/confirmation` - Order confirmation

### Buy Flow
- `/buy` - Marketplace
- `/buy/product/:id` - Product details
- `/buy/cart` - Shopping cart
- `/buy/checkout` - Checkout
- `/buy/order-confirmation` - Order confirmation

### User Account
- `/account/profile` - User profile
- `/account/orders` - Order history
- `/account/wallet` - Digital wallet
- `/account/kyc` - KYC verification
- `/account/addresses` - Saved addresses

### Admin Panel
- `/admin/login` - Admin login
- `/admin/dashboard` - Admin dashboard
- `/admin/*` - Various admin management pages

### Partner Portal
- `/partner/login` - Partner login
- `/partner/dashboard` - Partner dashboard
- `/partner/*` - Partner management pages

### Agent Portal
- `/agent/login` - Agent login
- `/agent/dashboard` - Agent dashboard

## Contributing

Please follow the existing code style and ensure all tests pass before submitting pull requests.

## License

MIT

## Support

For support and queries, please contact through the Help page or reach out to the development team.
