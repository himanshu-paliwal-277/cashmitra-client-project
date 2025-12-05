# 📘 **Project Documentation – ReCommerce Platform (Cashify/OLX Style)**

A full-stack marketplace platform where users can **Sell used devices**, **Buy refurbished devices**, and where **Partners & Admins** manage catalog, pricing, orders, and logistics.

---

# ✅ **1. Platform Roles / Users**

### **1. Regular User (Customer)**

They can:

- Browse & buy devices
- Add to cart
- Checkout & place orders
- Sell old devices using multi-step evaluation flow
- Manage their account (profile, orders, addresses, KYC, wallet)

---

### **2. Partner (Vendor / Franchise / Pickup Agent Owner)**

They can:

- Manage buying & selling product catalog
- Approve inventory
- View & manage buy/sell orders
- Manage pricing, finance, promotions
- View partner analytics
- Manage pickups
- Manage partner staff/users

---

### **3. Admin**

They can:

- Full access to platform
- Manage catalog (categories, brands, models, products)
- Manage partners
- Manage sell questionnaires, accessories, defects
- Manage buy-side product catalog
- Manage pricing, commissions
- View all orders
- View reports
- Manage sessions, configurations

---

### **4. Agents**

Pickup agents or delivery agents:

- Login
- View assigned tasks
- Manage pickups

---

# ✅ **2. High-Level Project Flows**

This project contains **3 major flows:**

---

## ⭐ **A. SELL FLOW (User Sells Their Device)**

Sell flow is a _multi-step guided evaluation_ similar to Cashify.

### **Sell Steps (Sequential)**

1.  **Category Selection**  
    `/sell` or `/sell-device`
2.  **Brand Selection**  
    `/sell/brand`
3.  **Model Selection**  
    `/sell/model`
4.  **Variant Selection (optional)**  
    `/sell/product/:productId/variants`
5.  **Evaluation Questionnaire**  
    `/sell/evaluation`
6.  **Defects Check**  
    `/sell/defects`
7.  **Accessories Selection**  
    `/sell/accessories`
8.  **Condition/Questionnaire**  
    `/sell/condition`
9.  **Price Quote**  
    `/sell/quote`
10. **Pickup Booking**  
    `/sell/pickup` or `/sell/booking`

11. **Booking Confirmation**  
    `/sell/confirmation`

### **Data Stored in SellFlow State**

`category, brand, model, variant, evaluationAnswers,
defects, accessories, conditionAnswers, priceQuote, bookingData`

---

## ⭐ **B. BUY FLOW (User Buys Refurbished Devices)**

### **Main pages**

- Marketplace → `/buy`
- Category Home → `/buy`
- Product Details → `/buy/product/:id`
- Cart → `/buy/cart`
- Checkout → `/buy/checkout`
- Order Confirmation → `/buy/order-confirmation`

This is similar to OLX/Cashify store.

---

## ⭐ **C. ACCOUNT FLOW (Customer Dashboard)**

### **Account pages**

- Profile → `/account/profile`
- Orders → `/account/orders`
- Order details → `/account/orders/:orderId`
- Saved Addresses → `/account/addresses`
- Wallet → `/account/wallet`
- KYC → `/account/kyc`

This gives the customer full control over their buying/selling history and personal details.

---

# ✅ **3. Admin Flow (Full Dashboard)**

Admin routes are protected with `ProtectedRoute` + `AdminLayout`.

### **Admin main menu**

- Dashboard
- Sell Management
- Buy Management
- Catalog (Sell + Buy)
- Categories, Brands, Models
- Products (Sell + Buy)
- Super Categories
- Sell Questions / Defects / Accessories
- Sessions + Configurations
- Partner Management
- Payouts, Pricing, Finance
- Reports

---

## **Admin Pages (Grouped)**

### **A. Sell Management**

- `/admin/sell`
- `/admin/sell-super-categories`
- `/admin/sell-categories`
- `/admin/sell-products`
- `/admin/sell-questions-management`
- `/admin/sell-defects-management`
- `/admin/sell-accessories-management`
- `/admin/sell-sessions-management`
- `/admin/sell-configuration-management`

---

### **B. Buy Management**

- `/admin/buy`
- `/admin/buy/categories`
- `/admin/buy/products`
- `/admin/buy/products/add`
- `/admin/buy/products/edit/:id`
- `/admin/buy/orders`

---

### **C. Catalog**

- `/admin/products`
- `/admin/categories`
- `/admin/brands`
- `/admin/models`
- `/admin/condition/questionnaire`

---

### **D. Partners**

- `/admin/partners`
- `/admin/partner/applications`
- `/admin/partner/list`
- `/admin/partner/permissions`
- `/admin/inventory/approval`

---

### **E. User Management**

- `/admin/users`
- `/admin/users/create`
- `/admin/users/edit/:userId`

---

### **F. Finance & Pricing**

- `/admin/pricing`
- `/admin/finance`
- `/admin/commission/rules`
- `/admin/wallet/payouts`

---

### **G. Reports**

- `/admin/reports`

---

# ✅ **4. Partner Flow**

Partner routes are protected with `PartnerProtectedRoute` + `PartnerLayout`.

### **Partners can manage:**

#### **Sell side**

- Categories
- Products
- Sell questions
- Defects
- Accessories
- Sessions
- Sell orders
- Leads

#### **Buy side**

- Buy categories
- Buy products
- Add/edit products
- Manage buy orders
- View order details

#### **Logistics**

- Pickup management
- Returns

#### **Catalog & Inventory**

- Product list
- Categories
- Brands
- Models
- Inventory approval

#### **Partner Management**

- Other partners
- Partner applications
- Permissions
- Users under partner

#### **Finance & Reports**

- Pricing
- Finance
- Commission rules
- Reports

---

# ✅ **5. Agent Flow**

Very simple:

- `/agent/login`
- `/agent/dashboard`

where they see assigned pickups/deliveries.

---

# ✅ **6. Routing Structure (Simplified Tree)**

Here is a simplified **route map**:

`/  
/about  
/contact  
/help  
/login  
/signup  
/profile  
/account/_  
/buy/_  
/sell/\*

/admin/login  
/admin/\* (Protected)

/partner/login  
/partner/\* (Protected)

/agent/login  
/agent/dashboard`

---

# ✅ **7. What Actually Happens in This Project (Real Flow)**

### ✔ **User comes to home page**

Views categories → decides to **Buy** or **Sell**.

### ✔ **If Selling:**

User is guided step-by-step through  
category → brand → model → evaluation → defects → accessories → quote → booking → confirmation.

This ensures:

- Accurate pricing
- Verified device condition
- Smooth booking and pickup

### ✔ **If Buying:**

User browses marketplace → adds to cart → checks out → order saved.

### ✔ **User Account**

Everything user does (buy/sell) is visible inside their profile.

### ✔ **Partners**

Partners manage:

- Buy flow products
- Sell flow catalogue
- Pickup operations
- Leads + Orders
- Pricing & reports

### ✔ **Admin**

Has full system control:

- Approve partners
- Manage catalogue
- Manage financial rules
- Manage categories, products, questionnaires
- View reports + analytics

---

# 📄 **8. Final Summary (One-Line Project Description)**

> **A full recommerce platform like Cashify + OLX, with complete Buy/Sell flows, multi-role dashboards (Admin, Partner, Customer, Agent), catalog management, pricing engine, and order workflow system.**

---

If you want, I can also generate:

✅ **Readable PDF Documentation**  
✅ **System Architecture Diagram**  
✅ **Flowcharts for Buy/Sell/Admin flows**  
✅ **API Documentation (Swagger style)**  
✅ **Database Schema Design**

Just tell me **which one** you want next.

---
