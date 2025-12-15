const express = require('express');
const router = express.Router();


const authRoutes = require('./auth.routes');
const categoryRoutes = require('./category.routes');
const buySuperCategoryRoutes = require('./buySuperCategory.routes');
const sellSuperCategoryRoutes = require('./sellSuperCategory.routes');
const buyCategoryRoutes = require('./buyCategory.routes');
const buyProductRoutes = require('./buyProduct.routes');
const userRoutes = require('./user.routes');
const productRoutes = require('./product.routes');
const partnerRoutes = require('./partner.routes');
const partnerPermissionRoutes = require('./partnerPermission.routes');
const adminRoutes = require('./admin.routes');
const vendorRoutes = require('./vendor.routes');
const sellRoutes = require('./sell.routes');
const buyRoutes = require('./buy.routes');
const salesRoutes = require('./sales.routes');
const walletRoutes = require('./wallet.routes');
const uploadRoutes = require('./upload.routes');
const contactRoutes = require('./contact.routes');


const sellProductRoutes = require('./sellProduct.routes');
const sellQuestionRoutes = require('./sellQuestion.routes');
const sellDefectRoutes = require('./sellDefect.routes');
const sellAccessoryRoutes = require('./sellAccessory.routes');
const sellConfigRoutes = require('./sellConfig.routes');
const sellOfferSessionRoutes = require('./sellOfferSession.routes');
const sellOrderRoutes = require('./sellOrder.routes');
const pickupRoutes = require('./pickup.routes');
const agentRoutes = require('./agent.routes');
const agentAppRoutes = require('./agentApp.routes');


router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/buy-super-categories', buySuperCategoryRoutes);
router.use('/sell-super-categories', sellSuperCategoryRoutes);
router.use('/buy-categories', buyCategoryRoutes);
router.use('/buy-products', buyProductRoutes);
router.use('/user', userRoutes);
router.use('/products', productRoutes);
router.use('/partners', partnerRoutes);
router.use('/partner', partnerRoutes); 
router.use('/partner-permissions', partnerPermissionRoutes);
router.use('/admin', adminRoutes);
router.use('/vendor', vendorRoutes);
router.use('/sell', sellRoutes);
router.use('/buy', buyRoutes);
router.use('/sales', salesRoutes);
router.use('/wallet', walletRoutes);
router.use('/upload', uploadRoutes);
router.use('/contact', contactRoutes);


router.use('/sell-products', sellProductRoutes);
router.use('/sell-questions', sellQuestionRoutes);
router.use('/sell-defects', sellDefectRoutes);
router.use('/sell-accessories', sellAccessoryRoutes);
router.use('/sell-config', sellConfigRoutes);
router.use('/sell-sessions', sellOfferSessionRoutes);
router.use('/sell-orders', sellOrderRoutes);
router.use('/pickups', pickupRoutes);
router.use('/agent', agentRoutes);
router.use('/agent-app', agentAppRoutes);

module.exports = router;
