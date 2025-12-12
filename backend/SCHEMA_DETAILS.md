# Database Schema Documentation

> Comprehensive documentation of all MongoDB schemas used in the Chashmitra platform

**Last Updated:** December 1, 2025
**Database:** MongoDB with Mongoose ODM
**Total Schemas:** 31

---

## Table of Contents

### User & Authentication

- [User](#user-schema)
- [Address](#address-schema)

### Partner Management

- [Partner](#partner-schema)
- [Partner Permission](#partnerpermission-schema)
- [Role Template](#roletemplate-schema)

### Vendor Management

- [Vendor](#vendor-schema)
- [Vendor Permission](#vendorpermission-schema)

### Agent Management

- [Agent](#agent-schema)

### Buy Platform (E-commerce)

- [Buy Super Category](#buysupercategory-schema)
- [Buy Category](#buycategory-schema)
- [Buy Product](#buyproduct-schema)

### Sell Platform (Device Trade-in)

- [Sell Super Category](#sellsupercategory-schema)
- [Category](#category-schema)
- [Sell Product](#sellproduct-schema)
- [Sell Question](#sellquestion-schema)
- [Sell Defect](#selldefect-schema)
- [Sell Accessory](#sellaccessory-schema)
- [Sell Config](#sellconfig-schema)
- [Sell Offer Session](#selloffersession-schema)
- [Sell Order](#sellorder-schema)

### Product & Pricing

- [Product](#product-schema)
- [Pricing](#pricing-schema)
- [Condition Questionnaire](#conditionquestionnaire-schema)

### Orders & Logistics

- [Order](#order-schema)
- [Pickup](#pickup-schema)

### Inventory & Cart

- [Inventory](#inventory-schema)
- [Cart](#cart-schema)

### Finance & Payments

- [Finance](#finance-schema)
- [Transaction](#transaction-schema)
- [Wallet](#wallet-schema)

### CRM

- [Lead](#lead-schema)

---

## User Schema

**Model:** `User`
**Collection:** `users`
**File:** `backend/src/models/user.model.js`

### Purpose

Manages user accounts across the platform with role-based access control.

### Fields

| Field               | Type     | Required | Validation                        | Default  | Description                               |
| ------------------- | -------- | -------- | --------------------------------- | -------- | ----------------------------------------- |
| name                | String   | Yes      | -                                 | -        | User's full name                          |
| email               | String   | Yes      | Valid email format, unique        | -        | User's email address (lowercase)          |
| password            | String   | Yes      | Min 6 characters                  | -        | Hashed password (not selected by default) |
| phone               | String   | Yes      | -                                 | -        | User's phone number                       |
| dateOfBirth         | Date     | No       | -                                 | -        | User's date of birth                      |
| address             | Object   | No       | -                                 | -        | User's address details                    |
| address.street      | String   | No       | -                                 | -        | Street address                            |
| address.city        | String   | No       | -                                 | -        | City                                      |
| address.state       | String   | No       | -                                 | -        | State                                     |
| address.pincode     | String   | No       | -                                 | -        | Postal code                               |
| address.country     | String   | No       | -                                 | 'India'  | Country                                   |
| role                | String   | No       | Enum: user, partner, admin, agent | 'user'   | User role                                 |
| roleTemplate        | ObjectId | No       | Ref: RoleTemplate                 | null     | Associated role template                  |
| isVerified          | Boolean  | No       | -                                 | false    | Email verification status                 |
| isActive            | Boolean  | No       | -                                 | true     | Account active status                     |
| profileImage        | String   | No       | -                                 | ''       | Profile image URL                         |
| resetPasswordToken  | String   | No       | -                                 | -        | Password reset token                      |
| resetPasswordExpire | Date     | No       | -                                 | -        | Password reset expiry                     |
| createdAt           | Date     | Auto     | -                                 | Date.now | Account creation date                     |
| updatedAt           | Date     | Auto     | -                                 | Date.now | Last update date                          |

### Indexes

- `email`: Unique index for email lookups

### Pre-save Hooks

- **Password Hashing**: Automatically hashes password using bcrypt with 10 salt rounds before saving (only when password is modified)

### Instance Methods

#### `matchPassword(enteredPassword)`

Compares entered password with hashed password in database.

- **Parameters:** `enteredPassword` (String)
- **Returns:** Boolean
- **Uses:** bcrypt.compare()

### Relationships

- **Referenced by:** Partner (user), Agent (user), Vendor (user), Lead (assignedTo), Pickup (assignedTo, assignedBy), SellOrder (userId, assignedTo)

---

## Address Schema

**Model:** `Address`
**Collection:** `addresses`
**File:** `backend/src/models/address.model.js`

### Purpose

Stores multiple delivery addresses for users with default address management.

### Fields

| Field       | Type     | Required | Validation              | Default  | Description                            |
| ----------- | -------- | -------- | ----------------------- | -------- | -------------------------------------- |
| user        | ObjectId | Yes      | Ref: User               | -        | User who owns this address             |
| title       | String   | Yes      | Max 50 chars            | -        | Address title (e.g., "Home", "Office") |
| fullName    | String   | Yes      | Max 100 chars           | -        | Recipient's full name                  |
| phone       | String   | Yes      | -                       | -        | Contact phone number                   |
| street      | String   | Yes      | Max 200 chars           | -        | Street address                         |
| city        | String   | Yes      | Max 50 chars            | -        | City name                              |
| state       | String   | Yes      | Max 50 chars            | -        | State name                             |
| pincode     | String   | Yes      | 6 digits                | -        | 6-digit postal code                    |
| country     | String   | No       | -                       | 'India'  | Country name                           |
| landmark    | String   | No       | Max 100 chars           | -        | Nearby landmark                        |
| addressType | String   | No       | Enum: home, work, other | 'home'   | Address type                           |
| isDefault   | Boolean  | No       | -                       | false    | Is this the default address            |
| createdAt   | Date     | Auto     | -                       | Date.now | Creation timestamp                     |
| updatedAt   | Date     | Auto     | -                       | Date.now | Last update timestamp                  |

### Indexes

- `user`: Index for user-based queries
- `user, isDefault`: Compound index for default address lookups

### Pre-save Hooks

- **Default Address Management**: When an address is set as default, removes the default flag from all other addresses of the same user

### Relationships

- **References:** User (user)

---

## Partner Schema

**Model:** `Partner`
**Collection:** `partners`
**File:** `backend/src/models/partner.model.js`

### Purpose

Manages partner (shop owner) accounts who sell products on the platform.

### Fields

| Field                             | Type       | Required | Validation                        | Default   | Description                 |
| --------------------------------- | ---------- | -------- | --------------------------------- | --------- | --------------------------- |
| user                              | ObjectId   | Yes      | Ref: User                         | -         | Associated user account     |
| shopName                          | String     | Yes      | -                                 | -         | Shop/Business name          |
| shopAddress                       | Object     | Yes      | -                                 | -         | Physical shop address       |
| shopAddress.street                | String     | No       | -                                 | -         | Street address              |
| shopAddress.city                  | String     | No       | -                                 | -         | City                        |
| shopAddress.state                 | String     | No       | -                                 | -         | State                       |
| shopAddress.pincode               | String     | Yes      | -                                 | -         | Postal code                 |
| shopAddress.country               | String     | No       | -                                 | 'India'   | Country                     |
| shopAddress.coordinates           | Object     | No       | -                                 | -         | GPS coordinates             |
| shopAddress.coordinates.latitude  | Number     | No       | -                                 | -         | Latitude                    |
| shopAddress.coordinates.longitude | Number     | No       | -                                 | -         | Longitude                   |
| gstNumber                         | String     | Yes      | Unique                            | -         | GST registration number     |
| shopPhone                         | String     | Yes      | -                                 | -         | Shop contact number         |
| shopEmail                         | String     | Yes      | Lowercase                         | -         | Shop email address          |
| shopLogo                          | String     | No       | -                                 | ''        | Shop logo URL               |
| shopImages                        | [String]   | No       | -                                 | -         | Shop images URLs            |
| documents                         | Object     | No       | -                                 | -         | Business documents          |
| documents.gstCertificate          | String     | No       | -                                 | -         | GST certificate URL         |
| documents.shopLicense             | String     | No       | -                                 | -         | Shop license URL            |
| documents.ownerIdProof            | String     | No       | -                                 | -         | Owner ID proof URL          |
| documents.additionalDocuments     | [String]   | No       | -                                 | -         | Additional document URLs    |
| isVerified                        | Boolean    | No       | -                                 | false     | Verification status         |
| verificationStatus                | String     | No       | Enum: pending, approved, rejected | 'pending' | Current verification status |
| verificationNotes                 | String     | No       | -                                 | -         | Admin notes on verification |
| rating                            | Number     | No       | Min: 0, Max: 5                    | 0         | Partner rating              |
| reviews                           | [Object]   | No       | -                                 | -         | Customer reviews            |
| wallet                            | Object     | No       | -                                 | -         | Partner wallet details      |
| wallet.balance                    | Number     | No       | -                                 | 0         | Current wallet balance      |
| wallet.transactions               | [ObjectId] | No       | Ref: Transaction                  | -         | Transaction references      |
| bankDetails                       | Object     | No       | -                                 | -         | Bank account details        |
| bankDetails.accountHolderName     | String     | No       | -                                 | -         | Account holder name         |
| bankDetails.accountNumber         | String     | No       | -                                 | -         | Bank account number         |
| bankDetails.ifscCode              | String     | No       | -                                 | -         | IFSC code                   |
| bankDetails.bankName              | String     | No       | -                                 | -         | Bank name                   |
| bankDetails.branch                | String     | No       | -                                 | -         | Branch name                 |
| upiId                             | String     | No       | -                                 | -         | UPI ID for payments         |
| createdAt                         | Date       | Auto     | -                                 | Date.now  | Registration date           |
| updatedAt                         | Date       | Auto     | -                                 | Date.now  | Last update date            |

### Indexes

- No explicit indexes defined (uses MongoDB default \_id index)

### Relationships

- **References:** User (user)
- **Referenced by:** PartnerPermission (partner), Inventory (partner), Finance (partner), Agent (assignedPartner), BuyProduct (partnerId), SellProduct (partnerId), SellOrder (partnerId), SellOfferSession (partnerId), Wallet (partner)

---

## PartnerPermission Schema

**Model:** `PartnerPermission`
**Collection:** `partnerpermissions`
**File:** `backend/src/models/partnerPermission.model.js`

### Purpose

Manages granular menu-level permissions for partners with role templates and business limits.

### Constants

#### PARTNER_MENU_ITEMS

Defines all available partner menu items with their properties:

- dashboard, inventory, addProduct, productCatalog
- orders, sellHistory, returns
- wallet, payouts, earnings, transactions
- kyc, documents
- analytics, reports
- support, notifications
- profile, shopSettings, bankDetails

### Fields

| Field                                                    | Type     | Required | Validation                                       | Default        | Description                               |
| -------------------------------------------------------- | -------- | -------- | ------------------------------------------------ | -------------- | ----------------------------------------- |
| partner                                                  | ObjectId | Yes      | Ref: Partner, Unique                             | -              | Associated partner                        |
| permissions                                              | Map      | No       | -                                                | Auto-generated | Permission map for all menu items         |
| permissions.{key}.granted                                | Boolean  | No       | -                                                | false          | Permission granted status                 |
| permissions.{key}.grantedAt                              | Date     | No       | -                                                | -              | When permission was granted               |
| permissions.{key}.grantedBy                              | ObjectId | No       | Ref: User                                        | -              | Who granted the permission                |
| permissions.{key}.restrictions                           | Object   | No       | -                                                | -              | Permission restrictions                   |
| permissions.{key}.restrictions.readOnly                  | Boolean  | No       | -                                                | false          | Read-only access                          |
| permissions.{key}.restrictions.timeRestriction           | Object   | No       | -                                                | -              | Time-based restrictions                   |
| permissions.{key}.restrictions.timeRestriction.startTime | String   | No       | HH:MM format                                     | -              | Start time                                |
| permissions.{key}.restrictions.timeRestriction.endTime   | String   | No       | HH:MM format                                     | -              | End time                                  |
| permissions.{key}.restrictions.dateRestriction           | Object   | No       | -                                                | -              | Date-based restrictions                   |
| permissions.{key}.restrictions.dateRestriction.startDate | Date     | No       | -                                                | -              | Start date                                |
| permissions.{key}.restrictions.dateRestriction.endDate   | Date     | No       | -                                                | -              | End date                                  |
| permissions.{key}.restrictions.maxTransactionAmount      | Number   | No       | -                                                | null           | Max transaction amount (null = unlimited) |
| permissions.{key}.restrictions.maxDailyTransactions      | Number   | No       | -                                                | null           | Max daily transactions (null = unlimited) |
| permissions.{key}.metadata                               | Map      | No       | -                                                | -              | Additional metadata                       |
| roleTemplate                                             | String   | No       | Enum: basic, seller, premium, enterprise, custom | 'basic'        | Role template applied                     |
| isActive                                                 | Boolean  | No       | -                                                | true           | Permission active status                  |
| lastUpdatedBy                                            | ObjectId | No       | Ref: User                                        | -              | Last updated by user                      |
| notes                                                    | String   | No       | -                                                | -              | Admin notes                               |
| businessLimits                                           | Object   | No       | -                                                | -              | Business operation limits                 |
| businessLimits.maxInventoryItems                         | Number   | No       | -                                                | 100            | Max inventory items allowed               |
| businessLimits.maxMonthlyTransactions                    | Number   | No       | -                                                | 50             | Max monthly transactions                  |
| businessLimits.maxPayoutAmount                           | Number   | No       | -                                                | 50000          | Max payout per transaction                |
| features                                                 | Object   | No       | -                                                | -              | Feature flags                             |
| features.bulkUpload                                      | Boolean  | No       | -                                                | false          | Bulk upload enabled                       |
| features.advancedAnalytics                               | Boolean  | No       | -                                                | false          | Advanced analytics enabled                |
| features.prioritySupport                                 | Boolean  | No       | -                                                | false          | Priority support enabled                  |
| features.customBranding                                  | Boolean  | No       | -                                                | false          | Custom branding enabled                   |
| createdAt                                                | Date     | Auto     | -                                                | Date.now       | Creation date                             |
| updatedAt                                                | Date     | Auto     | -                                                | Date.now       | Last update date                          |

### Indexes

- `partner`: Index for partner lookups
- `isActive`: Index for active permissions
- `roleTemplate`: Index for role template queries
- `lastUpdatedBy`: Index for audit queries

### Virtual Fields

#### `grantedPermissions`

Returns only the permissions that are granted with their menu details and restrictions.

- **Type:** Object
- **Computed from:** permissions Map

### Instance Methods

#### `hasPermission(menuItem)`

Checks if partner has specific permission.

- **Parameters:** `menuItem` (String)
- **Returns:** Boolean

#### `grantPermission(menuItem, grantedBy, restrictions)`

Grants a specific permission to the partner.

- **Parameters:**
  - `menuItem` (String)
  - `grantedBy` (ObjectId)
  - `restrictions` (Object, optional)
- **Returns:** void

#### `revokePermission(menuItem, revokedBy)`

Revokes a specific permission from the partner.

- **Parameters:**
  - `menuItem` (String)
  - `revokedBy` (ObjectId)
- **Returns:** void

#### `applyRoleTemplate(template, appliedBy)`

Applies a predefined role template to the partner.

- **Parameters:**
  - `template` (String) - basic, seller, premium, enterprise, custom
  - `appliedBy` (ObjectId)
- **Returns:** void
- **Templates:**
  - **basic**: dashboard, profile, kyc (max 100 items, 50 tx/month, 50k payout)
  - **seller**: adds inventory, orders, wallet features (max 500 items, 200 tx/month, 100k payout)
  - **premium**: adds analytics, finance, reports (max 2000 items, 1000 tx/month, 500k payout)
  - **enterprise**: all permissions, unlimited limits
  - **custom**: no default permissions

### Static Methods

#### `getMenuItems()`

Returns the complete menu items structure.

- **Returns:** Object (PARTNER_MENU_ITEMS)

#### `getPartnerPermissions(partnerId)`

Gets permissions for a specific partner with populated references.

- **Parameters:** `partnerId` (ObjectId)
- **Returns:** Promise<PartnerPermission>

#### `createDefaultPermissions(partnerId, createdBy)`

Creates default permissions for a new partner.

- **Parameters:**
  - `partnerId` (ObjectId)
  - `createdBy` (ObjectId)
- **Returns:** Promise<PartnerPermission>

### Relationships

- **References:** Partner (partner), User (grantedBy, revokedBy, lastUpdatedBy)

---

## RoleTemplate Schema

**Model:** `RoleTemplate`
**Collection:** `roletemplates`
**File:** `backend/src/models/roleTemplate.model.js`

### Purpose

Defines reusable role templates with permissions, features, and limits for partners.

### Fields

| Field                         | Type     | Required | Validation        | Default   | Description                               |
| ----------------------------- | -------- | -------- | ----------------- | --------- | ----------------------------------------- |
| name                          | String   | Yes      | Unique, lowercase | -         | Template name (unique identifier)         |
| displayName                   | String   | Yes      | -                 | -         | Human-readable template name              |
| description                   | String   | No       | -                 | ''        | Template description                      |
| color                         | String   | No       | -                 | '#3b82f6' | UI color code                             |
| permissions                   | [String] | Yes      | -                 | -         | Array of permission keys                  |
| features                      | Object   | No       | -                 | -         | Feature flags                             |
| features.bulkUpload           | Boolean  | No       | -                 | false     | Bulk upload feature                       |
| features.advancedAnalytics    | Boolean  | No       | -                 | false     | Advanced analytics                        |
| features.prioritySupport      | Boolean  | No       | -                 | false     | Priority support                          |
| features.customBranding       | Boolean  | No       | -                 | false     | Custom branding                           |
| features.apiAccess            | Boolean  | No       | -                 | false     | API access                                |
| limits                        | Object   | No       | -                 | -         | Business limits                           |
| limits.maxInventoryItems      | Number   | No       | -                 | -1        | Max inventory items (-1 = unlimited)      |
| limits.maxMonthlyTransactions | Number   | No       | -                 | -1        | Max monthly transactions (-1 = unlimited) |
| limits.maxPayoutAmount        | Number   | No       | -                 | -1        | Max payout amount (-1 = unlimited)        |
| isDefault                     | Boolean  | No       | -                 | false     | Is default template                       |
| isActive                      | Boolean  | No       | -                 | true      | Template active status                    |
| createdBy                     | ObjectId | Yes      | Ref: User         | -         | Created by user                           |
| updatedBy                     | ObjectId | No       | Ref: User         | -         | Last updated by user                      |
| createdAt                     | Date     | Auto     | -                 | Date.now  | Creation date                             |
| updatedAt                     | Date     | Auto     | -                 | Date.now  | Last update date                          |

### Indexes

- `name`: Index for template name lookups
- `isActive`: Index for active templates
- `isDefault`: Index for default templates

### Instance Methods

#### `canBeDeleted()`

Checks if the template can be deleted (not a default template).

- **Returns:** Boolean

### Static Methods

#### `createDefaultTemplates(adminUserId)`

Creates predefined default templates (basic, seller, premium, enterprise).

- **Parameters:** `adminUserId` (ObjectId)
- **Returns:** Promise<Array<RoleTemplate>>
- **Default Templates:**
  - **basic**: Dashboard only, 50 items, 20 tx/month, 10k payout
  - **seller**: Sell features, 200 items, 100 tx/month, 50k payout
  - **premium**: Buy/sell + analytics, 1000 items, 500 tx/month, 200k payout
  - **enterprise**: All features, unlimited limits

#### `getActiveTemplates()`

Gets all active role templates sorted by default status and name.

- **Returns:** Promise<Array<RoleTemplate>>

### Relationships

- **References:** User (createdBy, updatedBy)
- **Referenced by:** User (roleTemplate)

---

## Vendor Schema

**Model:** `Vendor`
**Collection:** `vendors`
**File:** `backend/src/models/vendor.model.js`

### Purpose

Manages vendor accounts (bulk device suppliers or service providers) with verification workflow.

### Fields

| Field                           | Type     | Required | Validation                                                         | Default    | Description                 |
| ------------------------------- | -------- | -------- | ------------------------------------------------------------------ | ---------- | --------------------------- |
| user                            | ObjectId | Yes      | Ref: User, Unique                                                  | -          | Associated user account     |
| companyName                     | String   | Yes      | -                                                                  | -          | Company/business name       |
| companyAddress                  | Object   | Yes      | -                                                                  | -          | Company address             |
| companyAddress.street           | String   | No       | -                                                                  | -          | Street address              |
| companyAddress.city             | String   | No       | -                                                                  | -          | City                        |
| companyAddress.state            | String   | No       | -                                                                  | -          | State                       |
| companyAddress.pincode          | String   | Yes      | -                                                                  | -          | Postal code                 |
| companyAddress.country          | String   | No       | -                                                                  | 'India'    | Country                     |
| contactPerson                   | Object   | Yes      | -                                                                  | -          | Primary contact person      |
| contactPerson.name              | String   | Yes      | -                                                                  | -          | Contact name                |
| contactPerson.designation       | String   | No       | -                                                                  | -          | Contact designation         |
| contactPerson.phone             | String   | Yes      | -                                                                  | -          | Contact phone               |
| contactPerson.email             | String   | Yes      | Lowercase                                                          | -          | Contact email               |
| businessDetails                 | Object   | No       | -                                                                  | -          | Business information        |
| businessDetails.gstNumber       | String   | No       | -                                                                  | -          | GST number                  |
| businessDetails.panNumber       | String   | No       | -                                                                  | -          | PAN number                  |
| businessDetails.businessType    | String   | No       | Enum: retailer, distributor, manufacturer, service_provider, other | 'retailer' | Type of business            |
| businessDetails.yearEstablished | Number   | No       | Min: 1900, Max: current year                                       | -          | Year established            |
| documents                       | Object   | No       | -                                                                  | -          | Business documents          |
| documents.gstCertificate        | String   | No       | -                                                                  | -          | GST certificate URL         |
| documents.panCard               | String   | No       | -                                                                  | -          | PAN card URL                |
| documents.businessLicense       | String   | No       | -                                                                  | -          | Business license URL        |
| documents.additionalDocuments   | [String] | No       | -                                                                  | -          | Additional documents        |
| isActive                        | Boolean  | No       | -                                                                  | true       | Vendor active status        |
| isVerified                      | Boolean  | No       | -                                                                  | false      | Verification status         |
| verificationStatus              | String   | No       | Enum: pending, approved, rejected, suspended                       | 'pending'  | Current verification status |
| verificationNotes               | String   | No       | -                                                                  | -          | Admin verification notes    |
| verifiedBy                      | ObjectId | No       | Ref: User                                                          | -          | Admin who verified          |
| verifiedAt                      | Date     | No       | -                                                                  | -          | Verification date           |
| lastLoginAt                     | Date     | No       | -                                                                  | -          | Last login timestamp        |
| metadata                        | Map      | No       | -                                                                  | -          | Additional metadata         |
| createdAt                       | Date     | Auto     | -                                                                  | Date.now   | Registration date           |
| updatedAt                       | Date     | Auto     | -                                                                  | Date.now   | Last update date            |

### Indexes

- `user`: Index for user lookups
- `isActive`: Index for active vendors
- `verificationStatus`: Index for status queries
- `contactPerson.email`: Index for email lookups
- `businessDetails.gstNumber`: Index for GST lookups
- `createdAt`: Descending index for recent vendors

### Virtual Fields

#### `ageInDays`

Calculates vendor account age in days.

- **Type:** Number
- **Computed from:** createdAt

### Instance Methods

#### `isFullyVerified()`

Checks if vendor is fully verified and approved.

- **Returns:** Boolean

### Static Methods

#### `getActiveVendors()`

Gets all active and approved vendors.

- **Returns:** Promise<Array<Vendor>>

#### `getByStatus(status)`

Gets vendors by verification status.

- **Parameters:** `status` (String)
- **Returns:** Promise<Array<Vendor>>

### Relationships

- **References:** User (user, verifiedBy)
- **Referenced by:** VendorPermission (vendor)

---

## VendorPermission Schema

**Model:** `VendorPermission`
**Collection:** `vendorpermissions`
**File:** `backend/src/models/vendorPermission.model.js`

### Purpose

Manages granular menu-level permissions for vendors with role templates and restrictions.

### Constants

#### MENU_ITEMS

Defines all available vendor menu items organized by sections:

- **Main:** dashboard
- **Sales & Orders:** sell, leads, sellOrders, buy, buyOrders, returns
- **Catalog & Products:** products, catalog, categories, brands, models, conditionQuestionnaire
- **Partners & Users:** partners, partnerApplications, partnerList, users, inventoryApproval
- **Pricing & Finance:** pricing, priceTable, conditionAdjustments, promotions, finance, commissionRules, walletPayouts
- **Analytics & Reports:** reports
- **System:** settings

### Fields

| Field                                                    | Type     | Required | Validation                                              | Default        | Description                       |
| -------------------------------------------------------- | -------- | -------- | ------------------------------------------------------- | -------------- | --------------------------------- |
| vendor                                                   | ObjectId | Yes      | Ref: Vendor                                             | -              | Associated vendor                 |
| permissions                                              | Map      | No       | -                                                       | Auto-generated | Permission map for all menu items |
| permissions.{key}.granted                                | Boolean  | No       | -                                                       | false          | Permission granted status         |
| permissions.{key}.grantedAt                              | Date     | No       | -                                                       | -              | When permission was granted       |
| permissions.{key}.grantedBy                              | ObjectId | No       | Ref: User                                               | -              | Who granted the permission        |
| permissions.{key}.restrictions                           | Object   | No       | -                                                       | -              | Permission restrictions           |
| permissions.{key}.restrictions.readOnly                  | Boolean  | No       | -                                                       | false          | Read-only access                  |
| permissions.{key}.restrictions.timeRestriction           | Object   | No       | -                                                       | -              | Time-based restrictions           |
| permissions.{key}.restrictions.timeRestriction.startTime | String   | No       | HH:MM format                                            | -              | Start time                        |
| permissions.{key}.restrictions.timeRestriction.endTime   | String   | No       | HH:MM format                                            | -              | End time                          |
| permissions.{key}.restrictions.dateRestriction           | Object   | No       | -                                                       | -              | Date-based restrictions           |
| permissions.{key}.restrictions.dateRestriction.startDate | Date     | No       | -                                                       | -              | Start date                        |
| permissions.{key}.restrictions.dateRestriction.endDate   | Date     | No       | -                                                       | -              | End date                          |
| permissions.{key}.restrictions.ipRestriction             | [String] | No       | -                                                       | -              | Allowed IP addresses              |
| permissions.{key}.metadata                               | Map      | No       | -                                                       | -              | Additional metadata               |
| roleTemplate                                             | String   | No       | Enum: basic, sales, inventory, finance, manager, custom | 'basic'        | Role template applied             |
| isActive                                                 | Boolean  | No       | -                                                       | true           | Permission active status          |
| lastUpdatedBy                                            | ObjectId | No       | Ref: User                                               | -              | Last updated by user              |
| notes                                                    | String   | No       | -                                                       | -              | Admin notes                       |
| createdAt                                                | Date     | Auto     | -                                                       | Date.now       | Creation date                     |
| updatedAt                                                | Date     | Auto     | -                                                       | Date.now       | Last update date                  |

### Indexes

- `vendor`: Index for vendor lookups
- `isActive`: Index for active permissions
- `roleTemplate`: Index for role template queries
- `lastUpdatedBy`: Index for audit queries

### Virtual Fields

#### `grantedPermissions`

Returns only the permissions that are granted with their menu details and restrictions.

- **Type:** Object
- **Computed from:** permissions Map

### Instance Methods

#### `hasPermission(menuItem)`

Checks if vendor has specific permission.

- **Parameters:** `menuItem` (String)
- **Returns:** Boolean

#### `grantPermission(menuItem, grantedBy, restrictions)`

Grants a specific permission to the vendor.

- **Parameters:**
  - `menuItem` (String)
  - `grantedBy` (ObjectId)
  - `restrictions` (Object, optional)
- **Returns:** void

#### `revokePermission(menuItem, revokedBy)`

Revokes a specific permission from the vendor.

- **Parameters:**
  - `menuItem` (String)
  - `revokedBy` (ObjectId)
- **Returns:** void

#### `applyRoleTemplate(template, appliedBy)`

Applies a predefined role template to the vendor.

- **Parameters:**
  - `template` (String) - basic, sales, inventory, finance, manager, custom
  - `appliedBy` (ObjectId)
- **Returns:** void
- **Templates:**
  - **basic**: dashboard only
  - **sales**: dashboard + sell, leads, sellOrders, buyOrders
  - **inventory**: dashboard + products, catalog, inventoryApproval
  - **finance**: dashboard + pricing, finance, walletPayouts, reports
  - **manager**: all permissions except settings
  - **custom**: no default permissions

### Static Methods

#### `getMenuItems()`

Returns the complete menu items structure.

- **Returns:** Object (MENU_ITEMS)

#### `getVendorPermissions(vendorId)`

Gets permissions for a specific vendor with populated references.

- **Parameters:** `vendorId` (ObjectId)
- **Returns:** Promise<VendorPermission>

### Relationships

- **References:** Vendor (vendor), User (grantedBy, revokedBy, lastUpdatedBy)

---

## Agent Schema

**Model:** `Agent`
**Collection:** `agents`
**File:** `backend/src/models/agent.model.js`

### Purpose

Manages field agents who perform device pickups and evaluations with location tracking and performance metrics.

### Fields

| Field                               | Type     | Required | Validation        | Default  | Description                          |
| ----------------------------------- | -------- | -------- | ----------------- | -------- | ------------------------------------ |
| user                                | ObjectId | Yes      | Ref: User, Unique | -        | Associated user account              |
| agentCode                           | String   | Yes      | Unique            | -        | Unique agent code (e.g., AGT2512001) |
| employeeId                          | String   | No       | -                 | -        | Company employee ID                  |
| assignedPartner                     | ObjectId | No       | Ref: Partner      | null     | Assigned partner                     |
| coverageAreas                       | [String] | No       | -                 | -        | Service coverage areas               |
| maxPickupsPerDay                    | Number   | No       | -                 | 10       | Max pickups per day                  |
| currentLocation                     | Object   | No       | -                 | -        | Current GPS location                 |
| currentLocation.type                | String   | No       | Enum: Point       | 'Point'  | GeoJSON type                         |
| currentLocation.coordinates         | [Number] | No       | -                 | [0, 0]   | [longitude, latitude]                |
| lastLocationUpdate                  | Date     | No       | -                 | -        | Last location update time            |
| isActive                            | Boolean  | No       | -                 | true     | Agent active status                  |
| joiningDate                         | Date     | No       | -                 | Date.now | Joining date                         |
| performanceMetrics                  | Object   | No       | -                 | -        | Performance metrics                  |
| performanceMetrics.totalPickups     | Number   | No       | -                 | 0        | Total pickups assigned               |
| performanceMetrics.completedPickups | Number   | No       | -                 | 0        | Successfully completed pickups       |
| performanceMetrics.cancelledPickups | Number   | No       | -                 | 0        | Cancelled pickups                    |
| performanceMetrics.rating           | Number   | No       | Min: 0, Max: 5    | 5.0      | Average rating                       |
| performanceMetrics.totalReviews     | Number   | No       | -                 | 0        | Total reviews received               |
| performanceMetrics.totalEarnings    | Number   | No       | -                 | 0        | Total earnings                       |
| documents                           | Object   | No       | -                 | -        | Agent documents                      |
| documents.aadharCard                | String   | No       | -                 | -        | Aadhar card URL                      |
| documents.panCard                   | String   | No       | -                 | -        | PAN card URL                         |
| documents.drivingLicense            | String   | No       | -                 | -        | Driving license URL                  |
| documents.photo                     | String   | No       | -                 | -        | Photo URL                            |
| bankDetails                         | Object   | No       | -                 | -        | Bank account details                 |
| bankDetails.accountNumber           | String   | No       | -                 | -        | Account number                       |
| bankDetails.ifscCode                | String   | No       | -                 | -        | IFSC code                            |
| bankDetails.accountHolderName       | String   | No       | -                 | -        | Account holder name                  |
| bankDetails.bankName                | String   | No       | -                 | -        | Bank name                            |
| emergencyContact                    | Object   | No       | -                 | -        | Emergency contact                    |
| emergencyContact.name               | String   | No       | -                 | -        | Contact name                         |
| emergencyContact.phone              | String   | No       | -                 | -        | Contact phone                        |
| emergencyContact.relation           | String   | No       | -                 | -        | Relationship                         |
| createdAt                           | Date     | Auto     | -                 | Date.now | Registration date                    |
| updatedAt                           | Date     | Auto     | -                 | Date.now | Last update date                     |

### Indexes

- `currentLocation`: 2dsphere index for geospatial queries
- `user`: Index for user lookups
- `agentCode`: Index for agent code lookups
- `assignedPartner`: Index for partner queries
- `isActive`: Index for active agents
- `coverageAreas`: Index for area-based queries

### Virtual Fields

#### `completionRate`

Calculates pickup completion rate as a percentage.

- **Type:** Number (fixed to 2 decimals)
- **Formula:** (completedPickups / totalPickups) \* 100
- **Computed from:** performanceMetrics

### Static Methods

#### `generateAgentCode()`

Generates unique agent code in format AGTYYMM0001.

- **Returns:** Promise<String>
- **Format:** AGT + Year(2) + Month(2) + Sequence(4)

#### `findNearby(latitude, longitude, maxDistance)`

Finds active agents near given coordinates.

- **Parameters:**
  - `latitude` (Number)
  - `longitude` (Number)
  - `maxDistance` (Number) - in meters, default 10000
- **Returns:** Promise<Array<Agent>>
- **Uses:** $near geospatial query

#### `findByCoverageArea(area)`

Finds active agents covering specific area.

- **Parameters:** `area` (String)
- **Returns:** Promise<Array<Agent>>

### Instance Methods

#### `updateLocation(latitude, longitude)`

Updates agent's current location.

- **Parameters:**
  - `latitude` (Number)
  - `longitude` (Number)
- **Returns:** Promise<Agent>

#### `distanceFrom(latitude, longitude)`

Calculates distance from agent's location to given point in kilometers.

- **Parameters:**
  - `latitude` (Number)
  - `longitude` (Number)
- **Returns:** Number (distance in km)
- **Uses:** Haversine formula

#### `updateMetrics(updateData)`

Updates agent's performance metrics.

- **Parameters:**
  - `updateData` (Object)
    - `completed` (Boolean)
    - `cancelled` (Boolean)
    - `earnings` (Number)
    - `rating` (Number)
- **Returns:** Promise<Agent>

### Relationships

- **References:** User (user), Partner (assignedPartner)
- **Referenced by:** Pickup (assignedTo)

---

## BuySuperCategory Schema

**Model:** `BuySuperCategory`
**Collection:** `buysupercategories`
**File:** `backend/src/models/buySuperCategory.model.js`

### Purpose

Top-level categories for the Buy platform (e-commerce) product hierarchy.

### Fields

| Field       | Type     | Required | Validation           | Default        | Description          |
| ----------- | -------- | -------- | -------------------- | -------------- | -------------------- |
| name        | String   | Yes      | Unique, Max 50 chars | -              | Super category name  |
| slug        | String   | No       | Unique, lowercase    | Auto-generated | URL-friendly slug    |
| image       | String   | Yes      | -                    | -              | Category image URL   |
| description | String   | No       | Max 200 chars        | -              | Category description |
| isActive    | Boolean  | No       | -                    | true           | Active status        |
| sortOrder   | Number   | No       | -                    | 0              | Display sort order   |
| createdBy   | ObjectId | Yes      | Ref: User            | -              | Created by user      |
| updatedBy   | ObjectId | No       | Ref: User            | -              | Last updated by user |
| createdAt   | Date     | Auto     | -                    | Date.now       | Creation date        |
| updatedAt   | Date     | Auto     | -                    | Date.now       | Last update date     |

### Indexes

- `name`: Index for name lookups
- `slug`: Index for slug lookups
- `isActive, sortOrder`: Compound index for sorted active categories

### Virtual Fields

#### `displayName`

Returns the category name for display.

- **Type:** String
- **Computed from:** name

#### `categories`

Virtual populate of child buy categories.

- **Type:** Array<BuyCategory>
- **Ref:** BuyCategory
- **Local Field:** \_id
- **Foreign Field:** superCategory

### Pre-save Hooks

- **Slug Generation**: Auto-generates slug from name if not provided (lowercase, hyphenated)

### Relationships

- **References:** User (createdBy, updatedBy)
- **Referenced by:** BuyCategory (superCategory)

---

## BuyCategory Schema

**Model:** `BuyCategory`
**Collection:** `buycategories`
**File:** `backend/src/models/buyCategory.model.js`

### Purpose

Second-level categories for the Buy platform, grouped under super categories.

### Fields

| Field         | Type     | Required | Validation            | Default        | Description           |
| ------------- | -------- | -------- | --------------------- | -------------- | --------------------- |
| name          | String   | Yes      | Unique, Max 50 chars  | -              | Category name         |
| slug          | String   | No       | Unique, lowercase     | Auto-generated | URL-friendly slug     |
| image         | String   | Yes      | -                     | -              | Category image URL    |
| superCategory | ObjectId | Yes      | Ref: BuySuperCategory | -              | Parent super category |
| isActive      | Boolean  | No       | -                     | true           | Active status         |
| sortOrder     | Number   | No       | -                     | 0              | Display sort order    |
| createdBy     | ObjectId | Yes      | Ref: User             | -              | Created by user       |
| updatedBy     | ObjectId | No       | Ref: User             | -              | Last updated by user  |
| createdAt     | Date     | Auto     | -                     | Date.now       | Creation date         |
| updatedAt     | Date     | Auto     | -                     | Date.now       | Last update date      |

### Indexes

- `name`: Index for name lookups
- `slug`: Index for slug lookups
- `isActive, sortOrder`: Compound index for sorted active categories

### Virtual Fields

#### `displayName`

Returns the category name for display.

- **Type:** String
- **Computed from:** name

### Pre-save Hooks

- **Slug Generation**: Auto-generates slug from name if not provided (lowercase, hyphenated)

### Relationships

- **References:** BuySuperCategory (superCategory), User (createdBy, updatedBy)
- **Referenced by:** BuyProduct (categoryId)

---

## BuyProduct Schema

**Model:** `BuyProduct`
**Collection:** `buyproducts`
**File:** `backend/src/models/buyProduct.model.js`

### Purpose

Products available for purchase on the Buy platform (e-commerce) with comprehensive specifications.

### Sub-schemas

#### CameraSpecSchema

Camera specification details.

- resolution (String)
- aperture (String)
- type (String)
- lens (String)

#### FrontCameraSchema

Front camera details.

- resolution (String)
- setup (String)
- aperture (String)
- flash (String)
- videoRecording ([String])
- type (String)
- features ([String])

#### RearCameraSchema

Rear camera details.

- setup (String)
- camera1 (CameraSpecSchema)
- camera2 (CameraSpecSchema)
- flash (String)
- sensor (String)
- ois (String)
- videoRecording ([String])
- features ([String])

### Fields

| Field                              | Type              | Required | Validation       | Default  | Description                        |
| ---------------------------------- | ----------------- | -------- | ---------------- | -------- | ---------------------------------- |
| categoryId                         | ObjectId          | Yes      | Ref: BuyCategory | -        | Product category                   |
| name                               | String            | Yes      | -                | -        | Product name                       |
| brand                              | String            | Yes      | -                | -        | Brand name                         |
| isRefurbished                      | Boolean           | No       | -                | false    | Refurbished product flag           |
| images                             | Mixed             | No       | -                | -        | Product images                     |
| badges                             | Object            | No       | -                | -        | Quality badges                     |
| badges.qualityChecks               | String            | No       | -                | -        | Quality check badge                |
| badges.warranty                    | String            | No       | -                | -        | Warranty badge                     |
| badges.refundPolicy                | String            | No       | -                | -        | Refund policy badge                |
| badges.assurance                   | String            | No       | -                | -        | Assurance badge                    |
| pricing                            | Object            | No       | -                | -        | Pricing details                    |
| pricing.mrp                        | Number            | No       | -                | -        | Maximum retail price               |
| pricing.discountedPrice            | Number            | No       | -                | -        | Discounted price                   |
| pricing.discountPercent            | Number            | No       | -                | -        | Discount percentage                |
| conditionOptions                   | [Object]          | No       | -                | -        | Condition-based pricing            |
| conditionOptions.label             | String            | No       | -                | -        | Condition label (Fair/Good/Superb) |
| conditionOptions.price             | Number            | No       | -                | -        | Price for this condition           |
| variants                           | [Object]          | No       | -                | -        | Product variants                   |
| variants.variantId                 | String            | No       | -                | -        | Variant ID                         |
| variants.storage                   | String            | No       | -                | -        | Storage capacity                   |
| variants.color                     | String            | No       | -                | -        | Color                              |
| variants.price                     | Number            | No       | -                | -        | Variant price                      |
| variants.stock                     | Boolean           | No       | -                | -        | In stock flag                      |
| addOns                             | [Object]          | No       | -                | -        | Available add-ons                  |
| addOns.name                        | String            | No       | -                | -        | Add-on name                        |
| addOns.cost                        | Number            | No       | -                | -        | Add-on cost                        |
| addOns.description                 | String            | No       | -                | -        | Add-on description                 |
| offers                             | Mixed             | No       | -                | -        | Special offers                     |
| rating                             | Object            | No       | -                | -        | Product ratings                    |
| rating.average                     | Number            | No       | -                | 0        | Average rating                     |
| rating.totalReviews                | Number            | No       | -                | 0        | Total reviews                      |
| rating.breakdown                   | Object            | No       | -                | -        | Rating breakdown                   |
| rating.breakdown.5star             | Number            | No       | -                | 0        | 5-star count                       |
| rating.breakdown.4star             | Number            | No       | -                | 0        | 4-star count                       |
| rating.breakdown.3star             | Number            | No       | -                | 0        | 3-star count                       |
| rating.breakdown.2star             | Number            | No       | -                | 0        | 2-star count                       |
| rating.breakdown.1star             | Number            | No       | -                | 0        | 1-star count                       |
| reviews                            | [Object]          | No       | -                | -        | Customer reviews                   |
| reviews.reviewer                   | String            | No       | -                | -        | Reviewer name                      |
| reviews.rating                     | Number            | No       | -                | -        | Review rating                      |
| reviews.date                       | String            | No       | -                | -        | Review date                        |
| reviews.comment                    | String            | No       | -                | -        | Review comment                     |
| paymentOptions                     | Object            | No       | -                | -        | Payment options                    |
| paymentOptions.emiAvailable        | Boolean           | No       | -                | -        | EMI available                      |
| paymentOptions.emiPlans            | [Object]          | No       | -                | -        | EMI plans                          |
| paymentOptions.methods             | [String]          | No       | -                | -        | Payment methods                    |
| availability                       | Object            | No       | -                | -        | Availability info                  |
| availability.inStock               | Boolean           | No       | -                | true     | In stock flag                      |
| availability.deliveryPincode       | String            | No       | -                | -        | Delivery pincode                   |
| availability.estimatedDelivery     | String            | No       | -                | -        | Delivery estimate                  |
| topSpecs                           | Object            | No       | -                | -        | Top specifications                 |
| topSpecs.screenSize                | String            | No       | -                | -        | Screen size                        |
| topSpecs.chipset                   | String            | No       | -                | -        | Chipset                            |
| topSpecs.pixelDensity              | String            | No       | -                | -        | Pixel density                      |
| topSpecs.networkSupport            | String            | No       | -                | -        | Network support                    |
| topSpecs.simSlots                  | String            | No       | -                | -        | SIM slots                          |
| productDetails                     | Object            | No       | -                | -        | Detailed specifications            |
| productDetails.frontCamera         | FrontCameraSchema | No       | -                | -        | Front camera details               |
| productDetails.rearCamera          | RearCameraSchema  | No       | -                | -        | Rear camera details                |
| productDetails.networkConnectivity | Object            | No       | -                | -        | Network connectivity               |
| productDetails.display             | Mixed             | No       | -                | -        | Display details                    |
| productDetails.general             | Object            | No       | -                | -        | General information                |
| productDetails.memoryStorage       | Object            | No       | -                | -        | Memory and storage                 |
| productDetails.performance         | Object            | No       | -                | -        | Performance specs                  |
| productDetails.battery             | Mixed             | No       | -                | -        | Battery details                    |
| productDetails.design              | Object            | No       | -                | -        | Design details                     |
| productDetails.sensorsMisc         | Object            | No       | -                | -        | Sensors and misc                   |
| description                        | String            | No       | -                | -        | Product description                |
| trustMetrics                       | Object            | No       | -                | -        | Trust metrics                      |
| trustMetrics.devicesSold           | Number            | No       | -                | 0        | Devices sold                       |
| trustMetrics.qualityChecks         | Number            | No       | -                | 0        | Quality checks passed              |
| relatedProducts                    | [Object]          | No       | -                | -        | Related products                   |
| legal                              | Object            | No       | -                | -        | Legal information                  |
| legal.terms                        | String            | No       | -                | -        | Terms                              |
| legal.privacy                      | String            | No       | -                | -        | Privacy policy                     |
| legal.copyright                    | String            | No       | -                | -        | Copyright                          |
| isActive                           | Boolean           | No       | -                | true     | Active status                      |
| sortOrder                          | Number            | No       | -                | 0        | Display order                      |
| partnerId                          | ObjectId          | No       | Ref: Partner     | -        | Partner who listed                 |
| createdBy                          | ObjectId          | No       | Ref: User        | -        | Created by user                    |
| updatedBy                          | ObjectId          | No       | Ref: User        | -        | Last updated by user               |
| createdAt                          | Date              | Auto     | -                | Date.now | Creation date                      |
| updatedAt                          | Date              | Auto     | -                | Date.now | Last update date                   |

### Indexes

- `name, brand`: Compound index for product search
- `categoryId`: Index for category queries
- `isActive`: Index for active products
- `rating.average`: Descending index for sorting by rating
- `pricing.discountedPrice`: Index for price sorting

### Virtual Fields

#### `displayName`

Returns formatted product name with brand.

- **Type:** String
- **Formula:** `${brand} ${name}`

### Relationships

- **References:** BuyCategory (categoryId), Partner (partnerId), User (createdBy, updatedBy)
- **Referenced by:** Cart (productId), Order (items.product)

---

## SellSuperCategory Schema

**Model:** `SellSuperCategory`
**Collection:** `sellsupercategories`
**File:** `backend/src/models/sellSuperCategory.model.js`

### Purpose

Top-level categories for the Sell platform (device trade-in) product hierarchy.

### Fields

| Field       | Type     | Required | Validation           | Default        | Description          |
| ----------- | -------- | -------- | -------------------- | -------------- | -------------------- |
| name        | String   | Yes      | Unique, Max 50 chars | -              | Super category name  |
| slug        | String   | No       | Unique, lowercase    | Auto-generated | URL-friendly slug    |
| image       | String   | Yes      | -                    | -              | Category image URL   |
| description | String   | No       | Max 200 chars        | -              | Category description |
| isActive    | Boolean  | No       | -                    | true           | Active status        |
| sortOrder   | Number   | No       | -                    | 0              | Display sort order   |
| createdBy   | ObjectId | Yes      | Ref: User            | -              | Created by user      |
| updatedBy   | ObjectId | No       | Ref: User            | -              | Last updated by user |
| createdAt   | Date     | Auto     | -                    | Date.now       | Creation date        |
| updatedAt   | Date     | Auto     | -                    | Date.now       | Last update date     |

### Indexes

- `name`: Index for name lookups
- `slug`: Index for slug lookups
- `isActive, sortOrder`: Compound index for sorted active categories

### Virtual Fields

#### `displayName`

Returns the category name for display.

- **Type:** String
- **Computed from:** name

#### `categories`

Virtual populate of child categories.

- **Type:** Array<Category>
- **Ref:** Category
- **Local Field:** \_id
- **Foreign Field:** superCategory

### Pre-save Hooks

- **Slug Generation**: Auto-generates slug from name if not provided (lowercase, hyphenated)

### Relationships

- **References:** User (createdBy, updatedBy)
- **Referenced by:** Category (superCategory)

---

## Category Schema

**Model:** `Category`
**Collection:** `categories`
**File:** `backend/src/models/category.model.js`

### Purpose

Categories for the Sell platform with hierarchical structure and metadata.

### Fields

| Field                   | Type       | Required | Validation             | Default        | Description                       |
| ----------------------- | ---------- | -------- | ---------------------- | -------------- | --------------------------------- |
| name                    | String     | Yes      | Unique, Max 50 chars   | -              | Category name                     |
| slug                    | String     | No       | Unique, lowercase      | Auto-generated | URL-friendly slug                 |
| description             | String     | No       | Max 500 chars          | -              | Category description              |
| image                   | String     | No       | -                      | null           | Category image URL                |
| icon                    | String     | No       | -                      | null           | Category icon                     |
| superCategory           | ObjectId   | No       | Ref: SellSuperCategory | null           | Parent super category             |
| parentCategory          | ObjectId   | No       | Ref: Category          | null           | Parent category (for hierarchies) |
| subcategories           | [ObjectId] | No       | Ref: Category          | -              | Child categories                  |
| isActive                | Boolean    | No       | -                      | true           | Active status                     |
| sortOrder               | Number     | No       | -                      | 0              | Display sort order                |
| metadata                | Object     | No       | -                      | -              | SEO metadata                      |
| metadata.seoTitle       | String     | No       | -                      | -              | SEO title                         |
| metadata.seoDescription | String     | No       | -                      | -              | SEO description                   |
| metadata.keywords       | [String]   | No       | -                      | -              | SEO keywords                      |
| specifications          | Map        | No       | -                      | -              | Category specifications           |
| createdBy               | ObjectId   | Yes      | Ref: User              | -              | Created by user                   |
| updatedBy               | ObjectId   | No       | Ref: User              | -              | Last updated by user              |
| createdAt               | Date       | Auto     | -                      | Date.now       | Creation date                     |
| updatedAt               | Date       | Auto     | -                      | Date.now       | Last update date                  |

### Indexes

- `name`: Index for name lookups
- `slug`: Index for slug lookups
- `isActive, sortOrder`: Compound index for sorted active categories

### Virtual Fields

#### `displayName`

Returns the category name for display.

- **Type:** String
- **Computed from:** name

### Pre-save Hooks

- **Slug Generation**: Auto-generates slug from name if not provided or modified (lowercase, hyphenated)

### Relationships

- **References:** SellSuperCategory (superCategory), Category (parentCategory, subcategories), User (createdBy, updatedBy)
- **Referenced by:** SellProduct (categoryId), SellQuestion (categoryId), SellDefect (categoryId), SellAccessory (categoryId)

---

## SellProduct Schema

**Model:** `SellProduct`
**Collection:** `sellproducts`
**File:** `backend/src/models/sellProduct.model.js`

### Purpose

Products that can be sold/traded-in by users on the Sell platform.

### Fields

| Field              | Type     | Required | Validation             | Default        | Description                           |
| ------------------ | -------- | -------- | ---------------------- | -------------- | ------------------------------------- |
| categoryId         | ObjectId | Yes      | Ref: Category          | -              | Product category                      |
| name               | String   | Yes      | -                      | -              | Product name                          |
| slug               | String   | No       | Unique, lowercase      | Auto-generated | URL-friendly slug                     |
| images             | [String] | No       | -                      | -              | Product images URLs                   |
| status             | String   | No       | Enum: active, inactive | 'active'       | Product status                        |
| variants           | [Object] | No       | -                      | -              | Product variants                      |
| variants.\_id      | ObjectId | Auto     | -                      | Auto-generated | Variant ID                            |
| variants.label     | String   | Yes      | -                      | -              | Variant label (e.g., "128GB / Black") |
| variants.basePrice | Number   | Yes      | Min: 0                 | -              | Base price for variant                |
| variants.isActive  | Boolean  | No       | -                      | true           | Variant active status                 |
| tags               | [String] | No       | -                      | -              | Search tags                           |
| partnerId          | ObjectId | No       | Ref: Partner           | -              | Partner who listed                    |
| createdBy          | ObjectId | Yes      | Ref: User              | -              | Created by user                       |
| createdAt          | Date     | Auto     | -                      | Date.now       | Creation date                         |
| updatedAt          | Date     | Auto     | -                      | Date.now       | Last update date                      |

### Indexes

- `categoryId, status`: Compound index for category queries
- `slug`: Unique index for slug lookups
- `name, tags`: Text index for search

### Virtual Fields

#### `activeVariants`

Returns only active variants.

- **Type:** Array<Object>
- **Computed from:** variants filtered by isActive

### Pre-save Hooks

- **Slug Generation**: Auto-generates slug from name if not provided (lowercase, alphanumeric with hyphens)

### Relationships

- **References:** Category (categoryId), Partner (partnerId), User (createdBy)
- **Referenced by:** SellOfferSession (productId), SellConfig (productId)

---

## SellQuestion Schema

**Model:** `SellQuestion`
**Collection:** `sellquestions`
**File:** `backend/src/models/sellQuestion.model.js`

### Purpose

Dynamic questionnaire for device condition assessment on the Sell platform.

### Fields

| Field               | Type     | Required | Validation                                                 | Default   | Description                      |
| ------------------- | -------- | -------- | ---------------------------------------------------------- | --------- | -------------------------------- |
| categoryId          | ObjectId | Yes      | Ref: Category                                              | -         | Associated category              |
| section             | String   | Yes      | Min: 1, Max: 100 chars                                     | -         | Question section                 |
| order               | Number   | Yes      | Min: 0                                                     | -         | Display order                    |
| key                 | String   | Yes      | Max: 100 chars, lowercase/numbers/underscores              | -         | Unique question key              |
| title               | String   | Yes      | Min: 1, Max: 200 chars                                     | -         | Question text                    |
| description         | String   | No       | Max: 500 chars                                             | -         | Question description             |
| uiType              | String   | Yes      | Enum: radio, checkbox, select, multiselect, slider, toggle | -         | UI component type                |
| multiSelect         | Boolean  | No       | -                                                          | false     | Allow multiple selections        |
| required            | Boolean  | No       | -                                                          | false     | Is answer required               |
| showIf              | Object   | No       | -                                                          | -         | Conditional display rules        |
| showIf.questionKey  | String   | No       | Min: 1                                                     | -         | Dependent question key           |
| showIf.value        | Mixed    | No       | -                                                          | -         | Trigger value                    |
| options             | [Object] | No       | -                                                          | -         | Answer options                   |
| options.key         | String   | Yes      | Min: 1, Max: 100 chars                                     | -         | Option key                       |
| options.label       | String   | Yes      | Min: 1, Max: 200 chars                                     | -         | Option label                     |
| options.value       | Mixed    | Yes      | -                                                          | -         | Option value                     |
| options.delta       | Object   | No       | -                                                          | -         | Price impact                     |
| options.delta.type  | String   | No       | Enum: abs, percent                                         | -         | Delta type (absolute/percentage) |
| options.delta.sign  | String   | No       | Enum: +, -                                                 | -         | Delta sign                       |
| options.delta.value | Number   | No       | Min: 0                                                     | -         | Delta value                      |
| options.showIf      | Mixed    | No       | -                                                          | undefined | Conditional display for option   |
| isActive            | Boolean  | No       | -                                                          | true      | Question active status           |
| createdBy           | ObjectId | Yes      | Ref: User                                                  | -         | Created by user                  |
| createdAt           | Date     | Auto     | -                                                          | Date.now  | Creation date                    |
| updatedAt           | Date     | Auto     | -                                                          | Date.now  | Last update date                 |

### Indexes

- `categoryId, key`: Compound unique index
- `categoryId, section, order`: Compound index for ordered queries
- `categoryId, isActive`: Compound index for active questions

### Virtual Fields

#### `activeOptions`

Returns only active options.

- **Type:** Array<Object>
- **Computed from:** options filtered by isActive

### Pre-save Hooks

- **showIf Normalization**: Transforms null showIf values to undefined

### Static Methods

#### `getForCategory(categoryId)`

Gets all active questions for a category.

- **Parameters:** `categoryId` (ObjectId)
- **Returns:** Promise<Array<SellQuestion>>

#### `getForVariants(productId, variantIds)`

Gets questions for product variants.

- **Parameters:**
  - `productId` (ObjectId)
  - `variantIds` (Array, optional)
- **Returns:** Promise<Array<SellQuestion>>

### Relationships

- **References:** Category (categoryId), User (createdBy)

---

## SellDefect Schema

**Model:** `SellDefect`
**Collection:** `selldefects`
**File:** `backend/src/models/sellDefect.model.js`

### Purpose

Manages defect options for device condition assessment with price adjustments.

### Fields

| Field       | Type     | Required | Validation                                                               | Default  | Description          |
| ----------- | -------- | -------- | ------------------------------------------------------------------------ | -------- | -------------------- |
| categoryId  | ObjectId | Yes      | Ref: Category                                                            | -        | Associated category  |
| section     | String   | Yes      | Enum: screen, body, functional, battery, camera, sensor, buttons, others | -        | Defect section       |
| key         | String   | Yes      | -                                                                        | -        | Unique defect key    |
| title       | String   | Yes      | -                                                                        | -        | Defect title         |
| icon        | String   | No       | -                                                                        | -        | Defect icon          |
| delta       | Object   | Yes      | -                                                                        | -        | Price impact         |
| delta.type  | String   | Yes      | Enum: abs, percent                                                       | -        | Delta type           |
| delta.sign  | String   | Yes      | Enum: +, -                                                               | -        | Delta sign           |
| delta.value | Number   | Yes      | Min: 0                                                                   | -        | Delta value          |
| order       | Number   | Yes      | Min: 0                                                                   | -        | Display order        |
| isActive    | Boolean  | No       | -                                                                        | true     | Defect active status |
| createdBy   | ObjectId | Yes      | Ref: User                                                                | -        | Created by user      |
| createdAt   | Date     | Auto     | -                                                                        | Date.now | Creation date        |
| updatedAt   | Date     | Auto     | -                                                                        | Date.now | Last update date     |

### Indexes

- `categoryId, key`: Compound unique index
- `categoryId, section, order`: Compound index for ordered queries
- `categoryId, isActive`: Compound index for active defects

### Static Methods

#### `getForCategory(categoryId)`

Gets all active defects for a category.

- **Parameters:** `categoryId` (ObjectId)
- **Returns:** Promise<Array<SellDefect>>

#### `getGroupedBySection(categoryId)`

Gets defects grouped by section using aggregation.

- **Parameters:** `categoryId` (ObjectId)
- **Returns:** Promise<Array<Object>>

#### `getForVariants(productId, variantIds)`

Gets defects for product variants.

- **Parameters:**
  - `productId` (ObjectId)
  - `variantIds` (Array, optional)
- **Returns:** Promise<Array<SellDefect>>

#### `getGroupedByCategory(productId, variantIds)`

Gets defects grouped by section for product.

- **Parameters:**
  - `productId` (ObjectId)
  - `variantIds` (Array, optional)
- **Returns:** Promise<Array<Object>>

### Relationships

- **References:** Category (categoryId), User (createdBy)

---

## SellAccessory Schema

**Model:** `SellAccessory`
**Collection:** `sellaccessories`
**File:** `backend/src/models/sellAccessory.model.js`

### Purpose

Manages accessory options for devices with price adjustments.

### Fields

| Field       | Type     | Required | Validation         | Default  | Description             |
| ----------- | -------- | -------- | ------------------ | -------- | ----------------------- |
| categoryId  | ObjectId | Yes      | Ref: Category      | -        | Associated category     |
| key         | String   | Yes      | -                  | -        | Unique accessory key    |
| title       | String   | Yes      | -                  | -        | Accessory title         |
| delta       | Object   | Yes      | -                  | -        | Price impact            |
| delta.type  | String   | Yes      | Enum: abs, percent | -        | Delta type              |
| delta.sign  | String   | Yes      | Enum: +, -         | -        | Delta sign              |
| delta.value | Number   | Yes      | Min: 0             | -        | Delta value             |
| order       | Number   | Yes      | Min: 0             | -        | Display order           |
| isActive    | Boolean  | No       | -                  | true     | Accessory active status |
| createdBy   | ObjectId | Yes      | Ref: User          | -        | Created by user         |
| createdAt   | Date     | Auto     | -                  | Date.now | Creation date           |
| updatedAt   | Date     | Auto     | -                  | Date.now | Last update date        |

### Indexes

- `categoryId, key`: Compound unique index
- `categoryId, order`: Compound index for ordered queries
- `categoryId, isActive`: Compound index for active accessories

### Static Methods

#### `getActiveForCategory(categoryId)`

Gets all active accessories for a category sorted by order.

- **Parameters:** `categoryId` (ObjectId)
- **Returns:** Promise<Array<SellAccessory>>

### Relationships

- **References:** Category (categoryId), User (createdBy)

---

## SellConfig Schema

**Model:** `SellConfig`
**Collection:** `sellconfigs`
**File:** `backend/src/models/sellConfig.model.js`

### Purpose

Configures the sell workflow steps and pricing rules for products.

### Fields

| Field                | Type     | Required | Validation                                              | Default  | Description            |
| -------------------- | -------- | -------- | ------------------------------------------------------- | -------- | ---------------------- |
| productId            | ObjectId | Yes      | Ref: SellProduct, Unique                                | -        | Associated product     |
| steps                | [Object] | Yes      | -                                                       | -        | Workflow steps         |
| steps.key            | String   | Yes      | Enum: variant, questions, defects, accessories, summary | -        | Step key               |
| steps.title          | String   | Yes      | -                                                       | -        | Step title             |
| steps.order          | Number   | Yes      | Min: 0                                                  | -        | Step order             |
| rules                | Object   | No       | -                                                       | -        | Pricing rules          |
| rules.roundToNearest | Number   | No       | Min: 1                                                  | 10       | Round final price      |
| rules.floorPrice     | Number   | No       | Min: 0                                                  | 0        | Minimum price floor    |
| rules.capPrice       | Number   | No       | Min: 0                                                  | -        | Maximum price cap      |
| rules.minPercent     | Number   | No       | Min: -100, Max: 100                                     | -90      | Min price adjustment % |
| rules.maxPercent     | Number   | No       | Min: -100, Max: 100                                     | 50       | Max price adjustment % |
| createdBy            | ObjectId | Yes      | Ref: User                                               | -        | Created by user        |
| createdAt            | Date     | Auto     | -                                                       | Date.now | Creation date          |
| updatedAt            | Date     | Auto     | -                                                       | Date.now | Last update date       |

### Indexes

- `productId`: Unique index for product config lookups

### Virtual Fields

#### `orderedSteps`

Returns steps sorted by order.

- **Type:** Array<Object>
- **Computed from:** steps sorted by order field

### Instance Methods

#### `applyPricingRules(basePrice, calculatedPrice)`

Applies pricing rules to calculate final price.

- **Parameters:**
  - `basePrice` (Number)
  - `calculatedPrice` (Number)
- **Returns:** Number (final price)
- **Rules Applied:**
  1. Min/Max percentage bounds
  2. Floor price
  3. Cap price
  4. Rounding

### Static Methods

#### `getDefaultConfig()`

Returns default configuration for new products.

- **Returns:** Object
- **Default Steps:** variant, questions, defects, accessories, summary
- **Default Rules:** roundToNearest: 10, floorPrice: 0, minPercent: -90, maxPercent: 50

#### `createDefaultForProduct(productId, createdBy)`

Creates default config for a product.

- **Parameters:**
  - `productId` (ObjectId)
  - `createdBy` (ObjectId)
- **Returns:** Promise<SellConfig>

### Relationships

- **References:** SellProduct (productId), User (createdBy)

---

## SellOfferSession Schema

**Model:** `SellOfferSession`
**Collection:** `selloffersessions`
**File:** `backend/src/models/sellOfferSession.model.js`

### Purpose

Stores temporary offer sessions during the device evaluation process.

### Fields

| Field           | Type     | Required | Validation                                    | Default    | Description                  |
| --------------- | -------- | -------- | --------------------------------------------- | ---------- | ---------------------------- |
| userId          | ObjectId | No       | Ref: User                                     | -          | User (optional for guests)   |
| productId       | ObjectId | Yes      | Ref: SellProduct                              | -          | Product being evaluated      |
| variantId       | ObjectId | Yes      | -                                             | -          | Selected variant             |
| partnerId       | ObjectId | No       | Ref: Partner                                  | -          | Associated partner           |
| answers         | Map      | No       | -                                             | new Map()  | Question answers with deltas |
| defects         | [String] | No       | -                                             | -          | Selected defect keys         |
| accessories     | [String] | No       | -                                             | -          | Selected accessory keys      |
| basePrice       | Number   | Yes      | Min: 0                                        | -          | Variant base price           |
| breakdown       | [Object] | No       | -                                             | -          | Price breakdown              |
| breakdown.label | String   | Yes      | -                                             | -          | Breakdown label              |
| breakdown.delta | Number   | Yes      | -                                             | -          | Price adjustment             |
| breakdown.type  | String   | No       | Enum: base, question, defect, accessory, rule | 'question' | Adjustment type              |
| finalPrice      | Number   | Yes      | Min: 0                                        | -          | Final calculated price       |
| currency        | String   | No       | Enum: INR                                     | 'INR'      | Currency                     |
| computedAt      | Date     | No       | -                                             | Date.now   | Last computation time        |
| sessionToken    | String   | No       | Unique, sparse                                | -          | Session token                |
| expiresAt       | Date     | No       | TTL index                                     | +24 hours  | Session expiry               |
| isActive        | Boolean  | No       | -                                             | true       | Session active status        |
| createdAt       | Date     | Auto     | -                                             | Date.now   | Creation date                |
| updatedAt       | Date     | Auto     | -                                             | Date.now   | Last update date             |

### Indexes

- `userId, createdAt`: Compound index for user sessions
- `productId, variantId`: Compound index for product queries
- `sessionToken`: Unique sparse index for token lookups
- `expiresAt`: TTL index for automatic cleanup

### Virtual Fields

#### `totalAdjustments`

Calculates total price adjustments excluding base price.

- **Type:** Number
- **Computed from:** Sum of breakdown deltas (excluding type: 'base')

### Instance Methods

#### `generateSessionToken()`

Generates unique session token.

- **Returns:** String (32-byte hex)

#### `isExpired()`

Checks if session has expired.

- **Returns:** Boolean

#### `extendExpiry(hours)`

Extends session expiry time.

- **Parameters:** `hours` (Number, default: 24)
- **Returns:** Promise<SellOfferSession>

### Static Methods

#### `findActiveSession(sessionToken)`

Finds active session by token.

- **Parameters:** `sessionToken` (String)
- **Returns:** Promise<SellOfferSession>

#### `findActiveSessions(userId)`

Finds all active sessions for a user.

- **Parameters:** `userId` (ObjectId)
- **Returns:** Promise<Array<SellOfferSession>>

#### `cleanupExpired()`

Deletes all expired sessions.

- **Returns:** Promise<DeleteResult>

### Pre-save Hooks

- **Computation Time Update**: Updates computedAt when answers/defects/accessories are modified

### Relationships

- **References:** User (userId), SellProduct (productId), Partner (partnerId)
- **Referenced by:** SellOrder (sessionId)

---

## SellOrder Schema

**Model:** `SellOrder`
**Collection:** `sellorders`
**File:** `backend/src/models/sellOrder.model.js`

### Purpose

Manages sell orders from offer sessions through pickup and payment.

### Fields

| Field                   | Type     | Required | Validation                                      | Default        | Description                      |
| ----------------------- | -------- | -------- | ----------------------------------------------- | -------------- | -------------------------------- |
| userId                  | ObjectId | No       | Ref: User                                       | -              | User (optional for guests)       |
| sessionId               | ObjectId | Yes      | Ref: SellOfferSession                           | -              | Offer session reference          |
| partnerId               | ObjectId | No       | Ref: Partner                                    | -              | Associated partner               |
| orderNumber             | String   | Yes      | Unique                                          | Auto-generated | Order number (e.g., SO250101001) |
| status                  | String   | No       | Enum: draft, confirmed, cancelled, picked, paid | 'draft'        | Order status                     |
| pickup                  | Object   | Yes      | -                                               | -              | Pickup details                   |
| pickup.address          | Object   | Yes      | -                                               | -              | Pickup address                   |
| pickup.address.fullName | String   | Yes      | -                                               | -              | Full name                        |
| pickup.address.phone    | String   | Yes      | -                                               | -              | Phone number                     |
| pickup.address.street   | String   | Yes      | -                                               | -              | Street address                   |
| pickup.address.city     | String   | Yes      | -                                               | -              | City                             |
| pickup.address.state    | String   | Yes      | -                                               | -              | State                            |
| pickup.address.pincode  | String   | Yes      | -                                               | -              | Pincode                          |
| pickup.slot             | Object   | Yes      | -                                               | -              | Pickup slot                      |
| pickup.slot.date        | Date     | Yes      | -                                               | -              | Pickup date                      |
| pickup.slot.window      | String   | Yes      | -                                               | -              | Time window                      |
| payment                 | Object   | Yes      | -                                               | -              | Payment details                  |
| payment.method          | String   | Yes      | Enum: upi, bank_transfer, wallet, cash          | -              | Payment method                   |
| payment.status          | String   | No       | Enum: pending, success, failed                  | 'pending'      | Payment status                   |
| payment.transactionId   | String   | No       | -                                               | -              | Transaction ID                   |
| payment.paidAt          | Date     | No       | -                                               | -              | Payment timestamp                |
| quoteAmount             | Number   | Yes      | Min: 0                                          | -              | Quoted price                     |
| actualAmount            | Number   | No       | Min: 0                                          | -              | Actual paid amount               |
| notes                   | String   | No       | -                                               | -              | Order notes                      |
| assignedTo              | ObjectId | No       | Ref: User                                       | -              | Assigned agent                   |
| pickedAt                | Date     | No       | -                                               | -              | Pickup timestamp                 |
| cancelledAt             | Date     | No       | -                                               | -              | Cancellation timestamp           |
| cancellationReason      | String   | No       | -                                               | -              | Cancellation reason              |
| createdAt               | Date     | Auto     | -                                               | Date.now       | Creation date                    |
| updatedAt               | Date     | Auto     | -                                               | Date.now       | Last update date                 |

### Indexes

- `userId, createdAt`: Compound descending index
- `orderNumber`: Unique index for order lookups
- `status, createdAt`: Compound descending index
- `pickup.slot.date, status`: Compound index for pickup scheduling
- `assignedTo, status`: Compound index for agent assignments

### Virtual Fields

#### `formattedAddress`

Returns formatted pickup address string.

- **Type:** String
- **Format:** "street, city, state - pincode"

#### `pickupSlotDisplay`

Returns formatted pickup slot display.

- **Type:** String
- **Format:** "DD/MM/YYYY (time window)"

### Pre-save Hooks

- **Order Number Generation**: Auto-generates order number (SOYYMMDD0001 format) for new orders

### Instance Methods

#### `confirm()`

Confirms the order.

- **Returns:** Promise<SellOrder>

#### `cancel(reason)`

Cancels the order with reason.

- **Parameters:** `reason` (String)
- **Returns:** Promise<SellOrder>

#### `markPicked(actualAmount, assignedTo)`

Marks order as picked.

- **Parameters:**
  - `actualAmount` (Number, optional)
  - `assignedTo` (ObjectId, optional)
- **Returns:** Promise<SellOrder>

#### `markPaid(transactionId)`

Marks payment as successful.

- **Parameters:** `transactionId` (String)
- **Returns:** Promise<SellOrder>

### Static Methods

#### `getByStatus(status, limit, skip)`

Gets orders by status with pagination.

- **Parameters:**
  - `status` (String)
  - `limit` (Number, default: 50)
  - `skip` (Number, default: 0)
- **Returns:** Promise<Array<SellOrder>>

### Relationships

- **References:** User (userId, assignedTo), SellOfferSession (sessionId), Partner (partnerId)

---

## Product Schema

**Model:** `Product`
**Collection:** `products`
**File:** `backend/src/models/product.model.js`

### Purpose

Generic product model for device pricing and depreciation calculations.

### Fields

| Field                                           | Type     | Required | Validation                   | Default  | Description               |
| ----------------------------------------------- | -------- | -------- | ---------------------------- | -------- | ------------------------- |
| category                                        | String   | Yes      | Enum: mobile, tablet, laptop | -        | Device category           |
| brand                                           | String   | Yes      | -                            | -        | Brand name                |
| series                                          | String   | No       | -                            | -        | Product series            |
| model                                           | String   | Yes      | -                            | -        | Model name                |
| variant                                         | Object   | Yes      | -                            | -        | Device variant specs      |
| variant.ram                                     | String   | Yes      | -                            | -        | RAM specification         |
| variant.storage                                 | String   | Yes      | -                            | -        | Storage specification     |
| variant.processor                               | String   | No       | -                            | -        | Processor                 |
| variant.screenSize                              | String   | No       | -                            | -        | Screen size               |
| variant.color                                   | String   | No       | -                            | -        | Color                     |
| basePrice                                       | Number   | Yes      | -                            | -        | Base market price         |
| depreciation                                    | Object   | No       | -                            | -        | Depreciation settings     |
| depreciation.ratePerMonth                       | Number   | No       | -                            | 2        | Depreciation % per month  |
| depreciation.maxDepreciation                    | Number   | No       | -                            | 70       | Max depreciation %        |
| conditionFactors                                | Object   | No       | -                            | -        | Condition-based pricing   |
| conditionFactors.screenCondition                | Object   | No       | -                            | -        | Screen condition factors  |
| conditionFactors.screenCondition.perfect        | Number   | No       | -                            | 100      | Perfect condition %       |
| conditionFactors.screenCondition.minorScratches | Number   | No       | -                            | 90       | Minor scratches %         |
| conditionFactors.screenCondition.majorScratches | Number   | No       | -                            | 75       | Major scratches %         |
| conditionFactors.screenCondition.cracked        | Number   | No       | -                            | 50       | Cracked screen %          |
| conditionFactors.bodyCondition                  | Object   | No       | -                            | -        | Body condition factors    |
| conditionFactors.bodyCondition.perfect          | Number   | No       | -                            | 100      | Perfect condition %       |
| conditionFactors.bodyCondition.minorScratches   | Number   | No       | -                            | 95       | Minor scratches %         |
| conditionFactors.bodyCondition.majorScratches   | Number   | No       | -                            | 85       | Major scratches %         |
| conditionFactors.bodyCondition.dented           | Number   | No       | -                            | 70       | Dented body %             |
| conditionFactors.batteryHealth                  | Object   | No       | -                            | -        | Battery health factors    |
| conditionFactors.batteryHealth.above90          | Number   | No       | -                            | 100      | >90% health               |
| conditionFactors.batteryHealth.between70And90   | Number   | No       | -                            | 90       | 70-90% health             |
| conditionFactors.batteryHealth.between50And70   | Number   | No       | -                            | 80       | 50-70% health             |
| conditionFactors.batteryHealth.below50          | Number   | No       | -                            | 60       | <50% health               |
| conditionFactors.functionalIssues               | Object   | No       | -                            | -        | Functional issue factors  |
| conditionFactors.functionalIssues.none          | Number   | No       | -                            | 100      | No issues                 |
| conditionFactors.functionalIssues.minor         | Number   | No       | -                            | 85       | Minor issues              |
| conditionFactors.functionalIssues.major         | Number   | No       | -                            | 60       | Major issues              |
| conditionFactors.functionalIssues.notWorking    | Number   | No       | -                            | 30       | Not working               |
| images                                          | [String] | No       | -                            | -        | Product images            |
| specifications                                  | Map      | No       | -                            | -        | Additional specifications |
| isActive                                        | Boolean  | No       | -                            | true     | Product active status     |
| createdBy                                       | ObjectId | Yes      | Ref: User                    | -        | Created by user           |
| createdAt                                       | Date     | Auto     | -                            | Date.now | Creation date             |
| updatedAt                                       | Date     | Auto     | -                            | Date.now | Last update date          |

### Indexes

- `category, brand, series, model`: Compound index named 'product_search_index'

### Relationships

- **References:** User (createdBy)
- **Referenced by:** Inventory (product), Pricing (product), Order (items.inventory)

---

## Pricing Schema

**Model:** `Pricing`
**Collection:** `pricings`
**File:** `backend/src/models/pricing.model.js`

### Purpose

Manages dynamic pricing for products based on condition with history tracking.

### Fields

| Field                                | Type     | Required | Validation         | Default         | Description                 |
| ------------------------------------ | -------- | -------- | ------------------ | --------------- | --------------------------- |
| product                              | ObjectId | Yes      | Ref: Product       | -               | Associated product          |
| basePrice                            | Number   | Yes      | Min: 0             | -               | Base price                  |
| conditions                           | Object   | No       | -                  | -               | Condition-based pricing     |
| conditions.excellent                 | Object   | No       | -                  | -               | Excellent condition pricing |
| conditions.excellent.percentage      | Number   | No       | Min: 0, Max: 100   | 100             | Price percentage            |
| conditions.excellent.price           | Number   | No       | -                  | Auto-calculated | Calculated price            |
| conditions.good                      | Object   | No       | -                  | -               | Good condition pricing      |
| conditions.good.percentage           | Number   | No       | Min: 0, Max: 100   | 85              | Price percentage            |
| conditions.good.price                | Number   | No       | -                  | Auto-calculated | Calculated price            |
| conditions.fair                      | Object   | No       | -                  | -               | Fair condition pricing      |
| conditions.fair.percentage           | Number   | No       | Min: 0, Max: 100   | 70              | Price percentage            |
| conditions.fair.price                | Number   | No       | -                  | Auto-calculated | Calculated price            |
| conditions.poor                      | Object   | No       | -                  | -               | Poor condition pricing      |
| conditions.poor.percentage           | Number   | No       | Min: 0, Max: 100   | 50              | Price percentage            |
| conditions.poor.price                | Number   | No       | -                  | Auto-calculated | Calculated price            |
| marketAdjustments                    | Object   | No       | -                  | -               | Market-based adjustments    |
| marketAdjustments.demandMultiplier   | Number   | No       | Min: 0.1, Max: 3.0 | 1.0             | Demand multiplier           |
| marketAdjustments.seasonalAdjustment | Number   | No       | Min: -50, Max: 50  | 0               | Seasonal adjustment %       |
| marketAdjustments.competitorPricing  | Number   | No       | Min: 0             | -               | Competitor pricing          |
| priceHistory                         | [Object] | No       | -                  | -               | Price change history        |
| priceHistory.date                    | Date     | No       | -                  | Date.now        | Change date                 |
| priceHistory.basePrice               | Number   | No       | -                  | -               | Previous base price         |
| priceHistory.conditions              | Object   | No       | -                  | -               | Previous conditions         |
| priceHistory.reason                  | String   | No       | -                  | -               | Change reason               |
| priceHistory.updatedBy               | ObjectId | No       | Ref: User          | -               | Updated by user             |
| isActive                             | Boolean  | No       | -                  | true            | Pricing active status       |
| effectiveFrom                        | Date     | No       | -                  | Date.now        | Effective from date         |
| effectiveTo                          | Date     | No       | -                  | -               | Effective until date        |
| updatedBy                            | ObjectId | Yes      | Ref: User          | -               | Last updated by user        |
| createdAt                            | Date     | Auto     | -                  | Date.now        | Creation date               |
| updatedAt                            | Date     | Auto     | -                  | Date.now        | Last update date            |

### Indexes

- `product`: Index for product lookups
- `isActive`: Index for active pricing
- `effectiveFrom, effectiveTo`: Compound index for date range queries
- `updatedBy`: Index for audit queries

### Pre-save Hooks

- **Condition Price Calculation**: Auto-calculates prices for all conditions based on basePrice and percentages when modified

### Instance Methods

#### `getPriceForCondition(condition)`

Gets price for specific condition.

- **Parameters:** `condition` (String) - excellent/good/fair/poor
- **Returns:** Number

#### `calculateFinalPrice(condition)`

Calculates final price with market adjustments.

- **Parameters:** `condition` (String)
- **Returns:** Number
- **Adjustments Applied:**
  1. Base price for condition
  2. Demand multiplier
  3. Seasonal adjustment

### Static Methods

#### `getActivePricing(productId)`

Gets currently active pricing for a product.

- **Parameters:** `productId` (ObjectId)
- **Returns:** Promise<Pricing>
- **Criteria:** isActive=true, effectiveFrom<=now, (effectiveTo>=now OR null)

### Relationships

- **References:** Product (product), User (updatedBy, priceHistory.updatedBy)

---

## ConditionQuestionnaire Schema

**Model:** `ConditionQuestionnaire`
**Collection:** `conditionquestionnaires`
**File:** `backend/src/models/conditionQuestionnaire.model.js`

### Purpose

Manages comprehensive condition assessment questionnaires for device evaluation.

### Sub-schemas

#### questionOptionSchema

- id (String, required)
- title (String, required)
- description (String)
- icon (String)
- type (String, enum: good/fair/poor/excellent, required)
- priceImpact (Number, min: -100, max: 100, default: 0)
- sortOrder (Number, default: 0)

#### questionSchema

- id (String)
- title (String)
- description (String)
- type (String, enum: single_choice/multiple_choice/boolean/text/number, default: single_choice)
- required (Boolean, default: true)
- options ([questionOptionSchema])
- helpText (String)
- sortOrder (Number, default: 0)
- isActive (Boolean, default: true)

### Fields

| Field                           | Type             | Required | Validation                                                                        | Default  | Description                         |
| ------------------------------- | ---------------- | -------- | --------------------------------------------------------------------------------- | -------- | ----------------------------------- |
| title                           | String           | Yes      | Max 200 chars                                                                     | -        | Questionnaire title                 |
| description                     | String           | No       | Max 1000 chars                                                                    | -        | Description                         |
| category                        | String           | Yes      | Enum: smartphone, laptop, tablet, smartwatch, headphones, camera, gaming, general | -        | Device category                     |
| subcategory                     | String           | No       | Lowercase                                                                         | -        | Subcategory                         |
| brand                           | String           | No       | -                                                                                 | -        | Brand (optional)                    |
| model                           | String           | No       | -                                                                                 | -        | Model (optional)                    |
| questions                       | [questionSchema] | Yes      | Min 1 question                                                                    | -        | Question list                       |
| version                         | String           | No       | -                                                                                 | '1.0.0'  | Version number                      |
| isActive                        | Boolean          | No       | -                                                                                 | true     | Active status                       |
| isDefault                       | Boolean          | No       | -                                                                                 | false    | Default questionnaire               |
| metadata                        | Object           | No       | -                                                                                 | -        | Additional metadata                 |
| metadata.estimatedTime          | Number           | No       | Min: 1, Max: 60                                                                   | 5        | Estimated completion time (minutes) |
| metadata.difficulty             | String           | No       | Enum: easy, medium, hard                                                          | 'easy'   | Difficulty level                    |
| metadata.tags                   | [String]         | No       | Lowercase                                                                         | -        | Tags                                |
| metadata.instructions           | String           | No       | -                                                                                 | -        | Instructions                        |
| analytics                       | Object           | No       | -                                                                                 | -        | Usage analytics                     |
| analytics.totalResponses        | Number           | No       | -                                                                                 | 0        | Total responses                     |
| analytics.averageCompletionTime | Number           | No       | -                                                                                 | 0        | Average completion time             |
| analytics.lastUsed              | Date             | No       | -                                                                                 | -        | Last used date                      |
| createdBy                       | ObjectId         | Yes      | Ref: User                                                                         | -        | Created by user                     |
| updatedBy                       | ObjectId         | No       | Ref: User                                                                         | -        | Last updated by user                |
| createdAt                       | Date             | Auto     | -                                                                                 | Date.now | Creation date                       |
| updatedAt                       | Date             | Auto     | -                                                                                 | Date.now | Last update date                    |

### Indexes

- `category, isActive`: Compound index for active questionnaires
- `brand, model`: Compound index for brand/model queries
- `isDefault, category`: Compound index for default lookups
- `createdAt`: Descending index for recent questionnaires
- `metadata.tags`: Index for tag queries

### Virtual Fields

#### `questionCount`

Total number of questions.

- **Type:** Number
- **Computed from:** questions.length

#### `activeQuestionCount`

Number of active questions.

- **Type:** Number
- **Computed from:** questions filtered by isActive

### Pre-save Hooks

- **Default Questionnaire Management**: Ensures only one default questionnaire per category
- **Question Sorting**: Sorts questions and options by sortOrder

### Instance Methods

#### `incrementUsage()`

Increments usage count and updates last used date.

- **Returns:** Promise<ConditionQuestionnaire>

#### `updateCompletionTime(timeInMinutes)`

Updates average completion time.

- **Parameters:** `timeInMinutes` (Number)
- **Returns:** this (for chaining)

#### `getActiveQuestions()`

Gets only active questions.

- **Returns:** Array<Question>

#### `duplicate(newTitle, createdBy)`

Creates a duplicate questionnaire.

- **Parameters:**
  - `newTitle` (String, optional)
  - `createdBy` (ObjectId)
- **Returns:** ConditionQuestionnaire (not saved)

### Static Methods

#### `findByCategory(category, includeInactive)`

Finds questionnaires by category.

- **Parameters:**
  - `category` (String)
  - `includeInactive` (Boolean, default: false)
- **Returns:** Promise<Array<ConditionQuestionnaire>>

#### `findDefault(category)`

Finds default questionnaire for category.

- **Parameters:** `category` (String)
- **Returns:** Promise<ConditionQuestionnaire>

#### `findByBrandModel(brand, model, category)`

Finds questionnaires by brand/model/category with fallback.

- **Parameters:**
  - `brand` (String)
  - `model` (String)
  - `category` (String)
- **Returns:** Promise<Array<ConditionQuestionnaire>>

### Relationships

- **References:** User (createdBy, updatedBy)

---

## Order Schema

**Model:** `Order`
**Collection:** `orders`
**File:** `backend/src/models/order.model.js`

### Purpose

Manages both buy and sell orders with flexible structure for different order types.

### Fields

| Field                             | Type     | Required | Validation                                                                                         | Default   | Description                     |
| --------------------------------- | -------- | -------- | -------------------------------------------------------------------------------------------------- | --------- | ------------------------------- |
| assessmentId                      | String   | No       | Unique, sparse                                                                                     | -         | Assessment ID                   |
| orderType                         | String   | Yes      | Enum: sell, buy                                                                                    | -         | Order type                      |
| user                              | ObjectId | No       | Ref: User                                                                                          | -         | User (optional for assessments) |
| partner                           | ObjectId | No       | Ref: Partner                                                                                       | -         | Partner (optional)              |
| items                             | [Object] | No       | -                                                                                                  | -         | Order items                     |
| items.inventory                   | ObjectId | No       | Ref: Inventory                                                                                     | -         | Inventory item                  |
| items.product                     | ObjectId | No       | Ref: BuyProduct                                                                                    | -         | Buy product                     |
| items.condition                   | Object   | No       | -                                                                                                  | -         | Item condition                  |
| items.condition.screenCondition   | String   | No       | -                                                                                                  | -         | Screen condition                |
| items.condition.bodyCondition     | String   | No       | -                                                                                                  | -         | Body condition                  |
| items.condition.batteryHealth     | String   | No       | -                                                                                                  | -         | Battery health                  |
| items.condition.functionalIssues  | String   | No       | -                                                                                                  | -         | Functional issues               |
| items.price                       | Number   | No       | -                                                                                                  | -         | Item price                      |
| items.quantity                    | Number   | No       | -                                                                                                  | 1         | Quantity                        |
| totalAmount                       | Number   | Yes      | -                                                                                                  | -         | Total order amount              |
| commission                        | Object   | Yes      | -                                                                                                  | -         | Commission details              |
| commission.rate                   | Number   | Yes      | -                                                                                                  | -         | Commission rate                 |
| commission.amount                 | Number   | Yes      | -                                                                                                  | -         | Commission amount               |
| paymentDetails                    | Object   | Yes      | -                                                                                                  | -         | Payment details                 |
| paymentDetails.method             | String   | Yes      | Enum: UPI, netbanking, Wallet, Cash, card                                                          | -         | Payment method                  |
| paymentDetails.transactionId      | String   | No       | -                                                                                                  | -         | Transaction ID                  |
| paymentDetails.status             | String   | No       | Enum: pending, completed, failed, refunded, confirmed                                              | 'pending' | Payment status                  |
| paymentDetails.paidAt             | Date     | No       | -                                                                                                  | -         | Payment timestamp               |
| shippingDetails                   | Object   | No       | -                                                                                                  | -         | Shipping details                |
| shippingDetails.address           | Object   | No       | -                                                                                                  | -         | Shipping address                |
| shippingDetails.address.street    | String   | No       | -                                                                                                  | -         | Street                          |
| shippingDetails.address.city      | String   | No       | -                                                                                                  | -         | City                            |
| shippingDetails.address.state     | String   | No       | -                                                                                                  | -         | State                           |
| shippingDetails.address.pincode   | String   | No       | -                                                                                                  | -         | Pincode                         |
| shippingDetails.address.country   | String   | No       | -                                                                                                  | 'India'   | Country                         |
| shippingDetails.contactPhone      | String   | No       | -                                                                                                  | -         | Contact phone                   |
| shippingDetails.trackingId        | String   | No       | -                                                                                                  | -         | Tracking ID                     |
| shippingDetails.deliveryMethod    | String   | No       | Enum: Cashmitra Logistics, Shop Delivery, Pickup                                                   | -         | Delivery method                 |
| shippingDetails.estimatedDelivery | Date     | No       | -                                                                                                  | -         | Estimated delivery              |
| shippingDetails.deliveredAt       | Date     | No       | -                                                                                                  | -         | Delivered timestamp             |
| status                            | String   | No       | Enum: pending, confirmed, processing, verified, shipped, delivered, completed, cancelled, refunded | 'pending' | Order status                    |
| statusHistory                     | [Object] | No       | -                                                                                                  | -         | Status change history           |
| statusHistory.status              | String   | No       | -                                                                                                  | -         | Status                          |
| statusHistory.timestamp           | Date     | No       | -                                                                                                  | Date.now  | Timestamp                       |
| statusHistory.note                | String   | No       | -                                                                                                  | -         | Note                            |
| notes                             | String   | No       | -                                                                                                  | -         | Order notes                     |
| createdAt                         | Date     | Auto     | -                                                                                                  | Date.now  | Creation date                   |
| updatedAt                         | Date     | Auto     | -                                                                                                  | Date.now  | Last update date                |

### Indexes

- `user`: Index for user orders
- `partner`: Index for partner orders
- `orderType`: Index for order type queries
- `status`: Index for status queries
- `createdAt`: Descending index for recent orders
- `assessmentId`: Index for assessment lookups

### Relationships

- **References:** User (user), Partner (partner), Inventory (items.inventory), BuyProduct (items.product)

---

## Pickup Schema

**Model:** `Pickup`
**Collection:** `pickups`
**File:** `backend/src/models/pickup.model.js`

### Purpose

Manages pickup scheduling and tracking for device collection from customers.

### Fields

| Field                    | Type     | Required | Validation                                                                | Default     | Description            |
| ------------------------ | -------- | -------- | ------------------------------------------------------------------------- | ----------- | ---------------------- |
| orderId                  | ObjectId | Yes      | RefPath: orderType                                                        | -           | Associated order       |
| orderType                | String   | Yes      | Enum: Order, SellOrder                                                    | -           | Order model type       |
| orderNumber              | String   | Yes      | -                                                                         | -           | Order number           |
| assignedTo               | ObjectId | Yes      | Ref: User                                                                 | -           | Assigned agent         |
| assignedBy               | ObjectId | Yes      | Ref: User                                                                 | -           | Assigned by user       |
| status                   | String   | No       | Enum: scheduled, confirmed, in_transit, completed, cancelled, rescheduled | 'scheduled' | Pickup status          |
| scheduledDate            | Date     | Yes      | -                                                                         | -           | Scheduled date         |
| scheduledTimeSlot        | String   | Yes      | Enum: 09:00-12:00, 12:00-15:00, 15:00-18:00, 18:00-21:00                  | -           | Time slot              |
| customer                 | Object   | Yes      | -                                                                         | -           | Customer details       |
| customer.name            | String   | Yes      | -                                                                         | -           | Customer name          |
| customer.phone           | String   | Yes      | -                                                                         | -           | Customer phone         |
| customer.email           | String   | No       | Lowercase                                                                 | -           | Customer email         |
| address                  | Object   | No       | -                                                                         | -           | Pickup address         |
| address.street           | String   | No       | -                                                                         | -           | Street address         |
| address.city             | String   | No       | -                                                                         | -           | City                   |
| address.state            | String   | No       | -                                                                         | -           | State                  |
| address.zipCode          | String   | No       | -                                                                         | -           | ZIP code               |
| address.landmark         | String   | No       | -                                                                         | -           | Landmark               |
| items                    | [Object] | No       | -                                                                         | -           | Items to pickup        |
| items.name               | String   | Yes      | -                                                                         | -           | Item name              |
| items.description        | String   | No       | -                                                                         | -           | Item description       |
| items.quantity           | Number   | Yes      | Min: 1                                                                    | -           | Quantity               |
| items.estimatedValue     | Number   | No       | Min: 0                                                                    | -           | Estimated value        |
| priority                 | String   | No       | Enum: low, medium, high, urgent                                           | 'medium'    | Pickup priority        |
| specialInstructions      | String   | No       | -                                                                         | -           | Special instructions   |
| pickupImages             | [String] | No       | -                                                                         | -           | Pickup image URLs      |
| communication            | [Object] | No       | -                                                                         | -           | Communication log      |
| communication.type       | String   | Yes      | Enum: sms, email, call, whatsapp                                          | -           | Communication type     |
| communication.message    | String   | Yes      | -                                                                         | -           | Message content        |
| communication.sentAt     | Date     | No       | -                                                                         | Date.now    | Sent timestamp         |
| communication.sentBy     | ObjectId | Yes      | Ref: User                                                                 | -           | Sent by user           |
| actualPickupTime         | Date     | No       | -                                                                         | -           | Actual pickup time     |
| completedAt              | Date     | No       | -                                                                         | -           | Completion timestamp   |
| cancelledAt              | Date     | No       | -                                                                         | -           | Cancellation timestamp |
| cancellationReason       | String   | No       | -                                                                         | -           | Cancellation reason    |
| rescheduledFrom          | Object   | No       | -                                                                         | -           | Reschedule history     |
| rescheduledFrom.date     | Date     | No       | -                                                                         | -           | Previous date          |
| rescheduledFrom.timeSlot | String   | No       | -                                                                         | -           | Previous time slot     |
| rescheduledFrom.reason   | String   | No       | -                                                                         | -           | Reschedule reason      |
| notes                    | [Object] | No       | -                                                                         | -           | Internal notes         |
| notes.content            | String   | Yes      | -                                                                         | -           | Note content           |
| notes.addedBy            | ObjectId | Yes      | Ref: User                                                                 | -           | Added by user          |
| notes.addedAt            | Date     | No       | -                                                                         | Date.now    | Added timestamp        |
| createdAt                | Date     | Auto     | -                                                                         | Date.now    | Creation date          |
| updatedAt                | Date     | Auto     | -                                                                         | Date.now    | Last update date       |

### Indexes

- `orderId`: Index for order lookups
- `assignedTo`: Index for agent assignments
- `status`: Index for status queries
- `scheduledDate`: Index for date-based queries
- `customer.phone`: Index for customer lookups
- `orderNumber`: Index for order number searches

### Virtual Fields

#### `formattedScheduledTime`

Returns formatted scheduled date and time slot.

- **Type:** String
- **Format:** "MM/DD/YYYY 09:00-12:00"

#### `pickupDuration`

Calculates pickup duration in minutes.

- **Type:** Number
- **Computed from:** completedAt - actualPickupTime

### Pre-save Hooks

- **Status Timestamp Management**: Auto-updates completion, cancellation, and pickup time based on status changes

### Instance Methods

#### `addCommunication(type, message, sentBy)`

Adds a communication log entry.

- **Parameters:**
  - `type` (String)
  - `message` (String)
  - `sentBy` (ObjectId)
- **Returns:** Promise<Pickup>

#### `addNote(content, addedBy)`

Adds an internal note.

- **Parameters:**
  - `content` (String)
  - `addedBy` (ObjectId)
- **Returns:** Promise<Pickup>

### Static Methods

#### `getPickupStats(filters)`

Gets pickup statistics grouped by status.

- **Parameters:** `filters` (Object, optional)
- **Returns:** Promise<Object>
- **Returns:** { total, scheduled, confirmed, in_transit, completed, cancelled, rescheduled }

### Relationships

- **References:** Order/SellOrder (orderId via refPath), User (assignedTo, assignedBy, communication.sentBy, notes.addedBy)

---

## Inventory Schema

**Model:** `Inventory`
**Collection:** `inventories`
**File:** `backend/src/models/inventory.model.js`

### Purpose

Manages partner inventory of devices available for sale.

### Fields

| Field                    | Type     | Required | Validation                                   | Default  | Description           |
| ------------------------ | -------- | -------- | -------------------------------------------- | -------- | --------------------- |
| partner                  | ObjectId | Yes      | Ref: Partner                                 | -        | Inventory owner       |
| product                  | ObjectId | Yes      | Ref: Product                                 | -        | Product               |
| condition                | String   | Yes      | Enum: New, Like New, Good, Fair, Refurbished | -        | Device condition      |
| price                    | Number   | Yes      | -                                            | -        | Selling price         |
| originalPrice            | Number   | Yes      | -                                            | -        | Original/market price |
| quantity                 | Number   | Yes      | Min: 0                                       | 1        | Available quantity    |
| images                   | [String] | No       | -                                            | -        | Product images        |
| description              | String   | No       | -                                            | -        | Description           |
| warranty                 | Object   | No       | -                                            | -        | Warranty details      |
| warranty.available       | Boolean  | No       | -                                            | false    | Warranty available    |
| warranty.durationMonths  | Number   | No       | -                                            | 0        | Warranty duration     |
| warranty.description     | String   | No       | -                                            | -        | Warranty description  |
| additionalSpecifications | Map      | No       | -                                            | -        | Additional specs      |
| isAvailable              | Boolean  | No       | -                                            | true     | Available for sale    |
| purchaseDate             | Date     | No       | -                                            | -        | Purchase date         |
| listedDate               | Date     | No       | -                                            | Date.now | Listed date           |
| createdAt                | Date     | Auto     | -                                            | Date.now | Creation date         |
| updatedAt                | Date     | Auto     | -                                            | Date.now | Last update date      |

### Indexes

- `partner`: Index for partner inventory
- `product`: Index for product queries
- `condition, price`: Compound index for filtering
- `isAvailable`: Index for availability queries

### Relationships

- **References:** Partner (partner), Product (product)
- **Referenced by:** Order (items.inventory)

---

## Cart Schema

**Model:** `Cart`
**Collection:** `carts`
**File:** `backend/src/models/cart.model.js`

### Purpose

Manages user shopping carts for the Buy platform.

### Sub-schemas

#### cartItemSchema

- productId (ObjectId, required, Ref: BuyProduct)
- quantity (Number, required, min: 1)
- addedAt (Date, default: Date.now)

### Fields

| Field     | Type             | Required | Validation        | Default  | Description      |
| --------- | ---------------- | -------- | ----------------- | -------- | ---------------- |
| user      | ObjectId         | Yes      | Ref: User, Unique | -        | Cart owner       |
| items     | [cartItemSchema] | No       | -                 | -        | Cart items       |
| updatedAt | Date             | No       | -                 | Date.now | Last update time |
| createdAt | Date             | Auto     | -                 | Date.now | Creation date    |

### Indexes

- `user`: Index for user cart lookups
- `items.productId`: Index for product queries

### Pre-save Hooks

- **Update Timestamp**: Updates updatedAt field before save

### Relationships

- **References:** User (user), BuyProduct (items.productId)

---

## Finance Schema

**Model:** `Finance`
**Collection:** `finances`
**File:** `backend/src/models/finance.model.js`

### Purpose

Tracks all financial transactions including commissions, refunds, and payouts.

### Fields

| Field                          | Type     | Required | Validation                                                                      | Default            | Description          |
| ------------------------------ | -------- | -------- | ------------------------------------------------------------------------------- | ------------------ | -------------------- |
| transactionType                | String   | Yes      | Enum: commission, refund, adjustment, withdrawal, deposit                       | -                  | Transaction type     |
| order                          | ObjectId | No       | Ref: Order                                                                      | -                  | Associated order     |
| user                           | ObjectId | No       | Ref: User                                                                       | -                  | Associated user      |
| partner                        | ObjectId | No       | Ref: Partner                                                                    | -                  | Associated partner   |
| amount                         | Number   | Yes      | -                                                                               | -                  | Transaction amount   |
| currency                       | String   | No       | -                                                                               | 'INR'              | Currency             |
| commission                     | Object   | No       | -                                                                               | -                  | Commission details   |
| commission.rate                | Number   | No       | Min: 0, Max: 100                                                                | -                  | Commission rate      |
| commission.amount              | Number   | No       | Min: 0                                                                          | Auto-calculated    | Commission amount    |
| commission.type                | String   | No       | Enum: percentage, fixed                                                         | 'percentage'       | Commission type      |
| status                         | String   | No       | Enum: pending, processed, failed, cancelled                                     | 'pending'          | Transaction status   |
| paymentMethod                  | String   | No       | Enum: bank_transfer, upi, wallet, cash, cheque                                  | -                  | Payment method       |
| paymentDetails                 | Object   | No       | -                                                                               | -                  | Payment details      |
| paymentDetails.accountNumber   | String   | No       | -                                                                               | -                  | Account number       |
| paymentDetails.ifscCode        | String   | No       | -                                                                               | -                  | IFSC code            |
| paymentDetails.upiId           | String   | No       | -                                                                               | -                  | UPI ID               |
| paymentDetails.transactionId   | String   | No       | -                                                                               | -                  | Transaction ID       |
| paymentDetails.referenceNumber | String   | No       | -                                                                               | -                  | Reference number     |
| description                    | String   | No       | -                                                                               | -                  | Description          |
| category                       | String   | No       | Enum: sales_commission, partner_commission, platform_fee, processing_fee, other | 'sales_commission' | Transaction category |
| processedBy                    | ObjectId | No       | Ref: User                                                                       | -                  | Processed by user    |
| processedAt                    | Date     | No       | -                                                                               | -                  | Processing timestamp |
| metadata                       | Object   | No       | -                                                                               | -                  | Additional metadata  |
| metadata.originalAmount        | Number   | No       | -                                                                               | -                  | Original amount      |
| metadata.taxAmount             | Number   | No       | -                                                                               | -                  | Tax amount           |
| metadata.netAmount             | Number   | No       | -                                                                               | -                  | Net amount           |
| metadata.exchangeRate          | Number   | No       | -                                                                               | -                  | Exchange rate        |
| metadata.fees                  | [Object] | No       | -                                                                               | -                  | Fee breakdown        |
| metadata.fees.type             | String   | No       | -                                                                               | -                  | Fee type             |
| metadata.fees.amount           | Number   | No       | -                                                                               | -                  | Fee amount           |
| metadata.fees.description      | String   | No       | -                                                                               | -                  | Fee description      |
| createdAt                      | Date     | Auto     | -                                                                               | Date.now           | Creation date        |
| updatedAt                      | Date     | Auto     | -                                                                               | Date.now           | Last update date     |

### Indexes

- `transactionType`: Index for transaction type queries
- `order`: Index for order lookups
- `user`: Index for user transactions
- `partner`: Index for partner transactions
- `status`: Index for status queries
- `category`: Index for category queries
- `createdAt`: Descending index for recent transactions
- `processedAt`: Descending index for processed date queries

### Virtual Fields

#### `netAmount`

Calculates net amount after commission.

- **Type:** Number
- **Formula:** amount - commission.amount (or amount if no commission)

### Pre-save Hooks

- **Commission Calculation**: Auto-calculates commission amount based on rate and type (percentage/fixed)

### Instance Methods

#### `processTransaction(processedBy)`

Marks transaction as processed.

- **Parameters:** `processedBy` (ObjectId)
- **Returns:** Promise<Finance>

### Static Methods

#### `getCommissionSummary(startDate, endDate)`

Gets commission summary aggregated by category.

- **Parameters:**
  - `startDate` (Date, optional)
  - `endDate` (Date, optional)
- **Returns:** Promise<Array<Object>>
- **Returns:** Array of { \_id: category, totalAmount, totalCommission, count, avgAmount }

#### `getPartnerEarnings(partnerId, startDate, endDate)`

Gets earnings summary for a partner.

- **Parameters:**
  - `partnerId` (ObjectId)
  - `startDate` (Date, optional)
  - `endDate` (Date, optional)
- **Returns:** Promise<Object>
- **Returns:** { totalEarnings, totalCommission, netEarnings, transactionCount }

### Relationships

- **References:** Order (order), User (user, processedBy), Partner (partner)

---

## Transaction Schema

**Model:** `Transaction`
**Collection:** `transactions`
**File:** `backend/src/models/transaction.model.js`

### Purpose

Records all payment transactions across the platform.

### Fields

| Field                                        | Type     | Required | Validation                                                                   | Default   | Description         |
| -------------------------------------------- | -------- | -------- | ---------------------------------------------------------------------------- | --------- | ------------------- |
| transactionType                              | String   | Yes      | Enum: order_payment, commission, payout, refund, wallet_credit, wallet_debit | -         | Transaction type    |
| amount                                       | Number   | Yes      | -                                                                            | -         | Transaction amount  |
| currency                                     | String   | No       | -                                                                            | 'INR'     | Currency            |
| user                                         | ObjectId | No       | Ref: User                                                                    | -         | Associated user     |
| partner                                      | ObjectId | No       | Ref: Partner                                                                 | -         | Associated partner  |
| order                                        | ObjectId | No       | Ref: Order                                                                   | -         | Associated order    |
| paymentMethod                                | String   | No       | Enum: UPI, Bank Transfer, Wallet, Cash, System                               | -         | Payment method      |
| paymentDetails                               | Object   | No       | -                                                                            | -         | Payment details     |
| paymentDetails.transactionId                 | String   | No       | -                                                                            | -         | Transaction ID      |
| paymentDetails.gatewayResponse               | Object   | No       | -                                                                            | -         | Gateway response    |
| paymentDetails.bankDetails                   | Object   | No       | -                                                                            | -         | Bank details        |
| paymentDetails.bankDetails.accountNumber     | String   | No       | -                                                                            | -         | Account number      |
| paymentDetails.bankDetails.ifscCode          | String   | No       | -                                                                            | -         | IFSC code           |
| paymentDetails.bankDetails.accountHolderName | String   | No       | -                                                                            | -         | Account holder      |
| paymentDetails.upiDetails                    | Object   | No       | -                                                                            | -         | UPI details         |
| paymentDetails.upiDetails.upiId              | String   | No       | -                                                                            | -         | UPI ID              |
| paymentDetails.upiDetails.reference          | String   | No       | -                                                                            | -         | Reference           |
| status                                       | String   | No       | Enum: pending, completed, failed, cancelled                                  | 'pending' | Transaction status  |
| description                                  | String   | No       | -                                                                            | -         | Description         |
| metadata                                     | Map      | No       | -                                                                            | -         | Additional metadata |
| createdAt                                    | Date     | Auto     | -                                                                            | Date.now  | Creation date       |
| updatedAt                                    | Date     | Auto     | -                                                                            | Date.now  | Last update date    |

### Indexes

- `transactionType`: Index for type queries
- `user`: Index for user transactions
- `partner`: Index for partner transactions
- `order`: Index for order transactions
- `status`: Index for status queries
- `createdAt`: Descending index for recent transactions

### Relationships

- **References:** User (user), Partner (partner), Order (order)
- **Referenced by:** Wallet (transactions)

---

## Wallet Schema

**Model:** `Wallet`
**Collection:** `wallets`
**File:** `backend/src/models/wallet.model.js`

### Purpose

Manages partner wallet balances and payout settings.

### Fields

| Field                                        | Type       | Required | Validation                      | Default  | Description            |
| -------------------------------------------- | ---------- | -------- | ------------------------------- | -------- | ---------------------- |
| partner                                      | ObjectId   | Yes      | Ref: Partner                    | -        | Wallet owner           |
| balance                                      | Number     | No       | Min: 0                          | 0        | Current balance        |
| currency                                     | String     | No       | -                               | 'INR'    | Currency               |
| isActive                                     | Boolean    | No       | -                               | true     | Wallet active status   |
| transactions                                 | [ObjectId] | No       | Ref: Transaction                | -        | Transaction references |
| lastUpdated                                  | Date       | No       | -                               | Date.now | Last update time       |
| payoutSettings                               | Object     | No       | -                               | -        | Payout settings        |
| payoutSettings.minimumPayoutAmount           | Number     | No       | -                               | 1000     | Minimum payout amount  |
| payoutSettings.autoPayoutEnabled             | Boolean    | No       | -                               | false    | Auto payout enabled    |
| payoutSettings.payoutSchedule                | String     | No       | Enum: weekly, biweekly, monthly | 'weekly' | Payout schedule        |
| payoutSettings.bankDetails                   | Object     | No       | -                               | -        | Bank details           |
| payoutSettings.bankDetails.accountNumber     | String     | No       | -                               | -        | Account number         |
| payoutSettings.bankDetails.ifscCode          | String     | No       | -                               | -        | IFSC code              |
| payoutSettings.bankDetails.accountHolderName | String     | No       | -                               | -        | Account holder         |
| payoutSettings.bankDetails.bankName          | String     | No       | -                               | -        | Bank name              |
| payoutSettings.bankDetails.branch            | String     | No       | -                               | -        | Branch                 |
| payoutSettings.upiId                         | String     | No       | -                               | -        | UPI ID                 |
| createdAt                                    | Date       | Auto     | -                               | Date.now | Creation date          |
| updatedAt                                    | Date       | Auto     | -                               | Date.now | Last update date       |

### Indexes

- `partner`: Unique index for partner wallets

### Relationships

- **References:** Partner (partner), Transaction (transactions)

---

## Lead Schema

**Model:** `Lead`
**Collection:** `leads`
**File:** `backend/src/models/lead.model.js`

### Purpose

Manages sales leads and customer inquiries with CRM functionality.

### Fields

| Field              | Type     | Required | Validation                                                          | Default   | Description       |
| ------------------ | -------- | -------- | ------------------------------------------------------------------- | --------- | ----------------- |
| name               | String   | Yes      | -                                                                   | -         | Lead name         |
| email              | String   | Yes      | Lowercase                                                           | -         | Lead email        |
| phone              | String   | Yes      | -                                                                   | -         | Lead phone        |
| source             | String   | No       | Enum: website, social_media, referral, advertisement, direct, other | 'website' | Lead source       |
| status             | String   | No       | Enum: new, contacted, qualified, converted, lost                    | 'new'     | Lead status       |
| priority           | String   | No       | Enum: low, medium, high, urgent                                     | 'medium'  | Lead priority     |
| interestedIn       | String   | Yes      | Enum: selling, buying, both                                         | -         | Interest type     |
| deviceType         | String   | No       | -                                                                   | -         | Device type       |
| estimatedValue     | Number   | No       | Min: 0                                                              | -         | Estimated value   |
| notes              | String   | No       | -                                                                   | -         | Notes             |
| assignedTo         | ObjectId | No       | Ref: User                                                           | -         | Assigned to user  |
| followUpDate       | Date     | No       | -                                                                   | -         | Follow-up date    |
| lastContactDate    | Date     | No       | -                                                                   | -         | Last contact date |
| conversionDate     | Date     | No       | -                                                                   | -         | Conversion date   |
| tags               | [String] | No       | -                                                                   | -         | Tags              |
| metadata           | Object   | No       | -                                                                   | -         | Metadata          |
| metadata.ipAddress | String   | No       | -                                                                   | -         | IP address        |
| metadata.userAgent | String   | No       | -                                                                   | -         | User agent        |
| metadata.referrer  | String   | No       | -                                                                   | -         | Referrer          |
| createdAt          | Date     | Auto     | -                                                                   | Date.now  | Creation date     |
| updatedAt          | Date     | Auto     | -                                                                   | Date.now  | Last update date  |

### Indexes

- `email`: Index for email lookups
- `phone`: Index for phone lookups
- `status`: Index for status queries
- `priority`: Index for priority queries
- `assignedTo`: Index for assignment queries
- `createdAt`: Descending index for recent leads
- `followUpDate`: Index for follow-up scheduling

### Virtual Fields

#### `ageInDays`

Calculates lead age in days.

- **Type:** Number
- **Computed from:** (Date.now - createdAt) / (1000 _ 60 _ 60 \* 24)

### Instance Methods

#### `isOverdue()`

Checks if lead is overdue for follow-up.

- **Returns:** Boolean

### Static Methods

#### `getByStatus(status)`

Gets leads by status with populated assignee.

- **Parameters:** `status` (String)
- **Returns:** Promise<Array<Lead>>

#### `getOverdue()`

Gets overdue leads (followUpDate < now, status not converted/lost).

- **Returns:** Promise<Array<Lead>>

### Relationships

- **References:** User (assignedTo)

---

## Summary

This documentation covers 31 database schemas used in the Chashmitra platform, organized into the following categories:

- **8 User Management Schemas** (User, Address, Partner, Agent, Vendor with permissions)
- **6 Buy Platform Schemas** (Categories, products for e-commerce)
- **11 Sell Platform Schemas** (Trade-in workflow, pricing, configuration)
- **3 Order & Logistics Schemas** (Orders, pickups)
- **2 Inventory Schemas** (Inventory, Cart)
- **3 Finance Schemas** (Finance, Transaction, Wallet)
- **1 CRM Schema** (Lead)

### Key Features Across Schemas

**Common Patterns:**

- Timestamps (createdAt, updatedAt) on all schemas
- Audit trails (createdBy, updatedBy) on most schemas
- Soft delete patterns using isActive flags
- Reference integrity with ObjectId refs
- Compound indexes for optimized queries

**Advanced Features:**

- Geospatial indexing (Agent locations)
- TTL indexes (SellOfferSession expiration)
- Virtual fields for computed properties
- Pre/post save hooks for business logic
- Static methods for complex queries
- Instance methods for entity operations
- Text indexes for search functionality
- Aggregation pipeline support

**Security & Validation:**

- Password hashing (User)
- Email format validation
- Enum constraints for controlled values
- Min/Max constraints on numeric fields
- Unique constraints on critical fields
- Required field validations

---

**Generated by:** Claude Code
**Documentation Version:** 1.0
**Platform:** Chashmitra - Device Trade-in & E-commerce Platform
