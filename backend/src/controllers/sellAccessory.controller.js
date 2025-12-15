

const { validationResult } = require('express-validator');
const SellAccessory = require('../models/sellAccessory.model');
const SellProduct = require('../models/sellProduct.model');
const {
  ApiError,
  asyncHandler,
} = require('../middlewares/errorHandler.middleware');


exports.createAccessory = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation Error', errors.array());
  }

  const { categoryId, key, title, delta } = req.body;

  
  const Category = require('../models/category.model');
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  
  const existingAccessory = await SellAccessory.findOne({ categoryId, key });
  if (existingAccessory) {
    throw new ApiError(
      400,
      'Accessory with this key already exists for this category'
    );
  }

  
  const lastAccessory = await SellAccessory.findOne({ categoryId }).sort({
    order: -1,
  });
  const order = lastAccessory ? lastAccessory.order + 1 : 1;

  const accessory = new SellAccessory({
    categoryId,
    key,
    title,
    delta,
    order,
    createdBy: req.user.id,
  });

  await accessory.save();

  res.status(201).json({
    success: true,
    message: 'Accessory created successfully',
    data: accessory,
  });
});


exports.getAccessories = asyncHandler(async (req, res) => {
  const { categoryId, isActive } = req.query;

  const query = {};

  if (categoryId) query.categoryId = categoryId;
  if (isActive !== undefined) query.isActive = isActive === 'true';

  const accessories = await SellAccessory.find(query)
    .populate('categoryId', 'name')
    .populate('createdBy', 'name email')
    .sort({ order: 1 });

  res.json({
    success: true,
    data: accessories,
  });
});


exports.getAccessoriesForCustomer = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  const accessories = await SellAccessory.getActiveForCategory(categoryId);

  res.json({
    success: true,
    data: accessories,
  });
});


exports.getCustomerAccessories = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation Error', errors.array());
  }

  const { categoryId } = req.query;

  
  const Category = require('../models/category.model');
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  
  const accessories = await SellAccessory.find({
    categoryId,
    isActive: true,
  }).sort({ order: 1 });

  res.json({
    success: true,
    data: accessories,
  });
});


exports.getAccessory = asyncHandler(async (req, res) => {
  const accessory = await SellAccessory.findById(req.params.id)
    .populate('categoryId', 'name')
    .populate('createdBy', 'name email');

  if (!accessory) {
    throw new ApiError(404, 'Accessory not found');
  }

  res.json({
    success: true,
    data: accessory,
  });
});


exports.updateAccessory = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation Error', errors.array());
  }

  const { key, title, delta, isActive, order } = req.body;

  const accessory = await SellAccessory.findById(req.params.id);
  if (!accessory) {
    throw new ApiError(404, 'Accessory not found');
  }

  
  if (key && key !== accessory.key) {
    const existingAccessory = await SellAccessory.findOne({
      categoryId: accessory.categoryId,
      key,
      _id: { $ne: req.params.id },
    });
    if (existingAccessory) {
      throw new ApiError(
        400,
        'Accessory with this key already exists for this category'
      );
    }
  }

  const updatedAccessory = await SellAccessory.findByIdAndUpdate(
    req.params.id,
    { ...req.body, updatedBy: req.user._id },
    { new: true, runValidators: true }
  )
    .populate('categoryId', 'name')
    .populate('createdBy', 'name email');

  res.json({
    success: true,
    message: 'Accessory updated successfully',
    data: updatedAccessory,
  });
});


exports.reindexAccessoryOrders = asyncHandler(async (req, res) => {
  try {
    
    const accessories = await SellAccessory.find({});

    
    const byCategory = {};
    accessories.forEach((acc) => {
      const catId = acc.categoryId ? acc.categoryId.toString() : 'null';
      if (!byCategory[catId]) {
        byCategory[catId] = [];
      }
      byCategory[catId].push(acc);
    });

    let updatedCount = 0;

    
    for (const categoryId in byCategory) {
      const categoryAccessories = byCategory[categoryId];

      
      categoryAccessories.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      
      for (let i = 0; i < categoryAccessories.length; i++) {
        await SellAccessory.findByIdAndUpdate(
          categoryAccessories[i]._id,
          { order: i + 1 },
          { runValidators: false } 
        );
        updatedCount++;
      }
    }

    res.json({
      success: true,
      message: `Successfully reindexed ${updatedCount} accessories`,
      data: { updatedCount },
    });
  } catch (error) {
    throw new ApiError(
      500,
      'Failed to reindex accessory orders: ' + error.message
    );
  }
});


exports.migrateAndReindexAccessories = asyncHandler(async (req, res) => {
  try {
    const SellProduct = require('../models/sellProduct.model');
    const mongoose = require('mongoose');

    
    const accessories = await SellAccessory.find({}).lean();

    let migratedCount = 0;

    
    for (const acc of accessories) {
      
      if ('productId' in acc) {
        if (acc.productId && !acc.categoryId) {
          
          const product = await SellProduct.findById(acc.productId).select(
            'categoryId'
          );

          if (product && product.categoryId) {
            
            await mongoose.connection.collection('sellaccessories').updateOne(
              { _id: acc._id },
              {
                $set: { categoryId: product.categoryId },
                $unset: { productId: 1 },
              }
            );
            migratedCount++;
          }
        } else if (!acc.productId && !acc.categoryId) {
          
          await mongoose.connection
            .collection('sellaccessories')
            .updateOne({ _id: acc._id }, { $unset: { productId: 1 } });
        }
      }
    }

    
    const updatedAccessories = await SellAccessory.find({});
    const byCategory = {};

    updatedAccessories.forEach((acc) => {
      const catId = acc.categoryId ? acc.categoryId.toString() : 'null';
      if (!byCategory[catId]) byCategory[catId] = [];
      byCategory[catId].push(acc);
    });

    let reindexedCount = 0;
    for (const categoryId in byCategory) {
      const categoryAccessories = byCategory[categoryId];
      categoryAccessories.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      for (let i = 0; i < categoryAccessories.length; i++) {
        await SellAccessory.findByIdAndUpdate(
          categoryAccessories[i]._id,
          { order: i + 1 },
          { runValidators: false }
        );
        reindexedCount++;
      }
    }

    res.json({
      success: true,
      message: `Migrated ${migratedCount} accessories, reindexed ${reindexedCount} orders`,
      data: { migratedCount, reindexedCount },
    });
  } catch (error) {
    throw new ApiError(500, 'Migration failed: ' + error.message);
  }
});


exports.deleteAccessory = asyncHandler(async (req, res) => {
  const accessory = await SellAccessory.findById(req.params.id);
  if (!accessory) {
    throw new ApiError(404, 'Accessory not found');
  }

  await accessory.deleteOne();

  res.json({
    success: true,
    message: 'Accessory deleted successfully',
  });
});


exports.bulkCreateAccessories = asyncHandler(async (req, res) => {
  const { categoryId, accessories } = req.body;

  
  const Category = require('../models/category.model');
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  
  if (!Array.isArray(accessories) || accessories.length === 0) {
    throw new ApiError(
      400,
      'Accessories array is required and cannot be empty'
    );
  }

  
  const keys = accessories.map((acc) => acc.key);
  const duplicateKeys = keys.filter(
    (key, index) => keys.indexOf(key) !== index
  );
  if (duplicateKeys.length > 0) {
    throw new ApiError(
      400,
      `Duplicate keys found in request: ${duplicateKeys.join(', ')}`
    );
  }

  
  const existingAccessories = await SellAccessory.find({
    categoryId,
    key: { $in: keys },
  });

  if (existingAccessories.length > 0) {
    const existingKeys = existingAccessories.map((acc) => acc.key);
    throw new ApiError(
      400,
      `Accessories with these keys already exist for this category: ${existingKeys.join(
        ', '
      )}`
    );
  }

  
  const lastAccessory = await SellAccessory.findOne({ categoryId }).sort({
    order: -1,
  });
  let nextOrder = lastAccessory ? lastAccessory.order + 1 : 1;

  
  const accessoriesToCreate = accessories.map((accessory) => ({
    categoryId,
    key: accessory.key,
    title: accessory.title,
    delta: accessory.delta,
    isActive: accessory.isActive !== undefined ? accessory.isActive : true,
    order: nextOrder++,
    createdBy: req.user._id,
  }));

  
  const createdAccessories =
    await SellAccessory.insertMany(accessoriesToCreate);

  res.status(201).json({
    success: true,
    message: `${createdAccessories.length} accessories created successfully`,
    data: createdAccessories,
  });
});


exports.reorderAccessories = asyncHandler(async (req, res) => {
  const { categoryId, accessoryIds } = req.body;

  
  const Category = require('../models/category.model');
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  
  if (!Array.isArray(accessoryIds) || accessoryIds.length === 0) {
    throw new ApiError(
      400,
      'Accessory IDs array is required and cannot be empty'
    );
  }

  
  const accessories = await SellAccessory.find({
    _id: { $in: accessoryIds },
    categoryId,
  });

  if (accessories.length !== accessoryIds.length) {
    throw new ApiError(
      400,
      'Some accessories do not belong to the specified category'
    );
  }

  
  const updatePromises = accessoryIds.map((accessoryId, index) =>
    SellAccessory.findByIdAndUpdate(
      accessoryId,
      { order: index + 1, updatedBy: req.user._id },
      { new: true }
    )
  );

  const updatedAccessories = await Promise.all(updatePromises);

  res.json({
    success: true,
    message: 'Accessories reordered successfully',
    data: updatedAccessories,
  });
});


exports.toggleAccessoryStatus = asyncHandler(async (req, res) => {
  const accessory = await SellAccessory.findById(req.params.id);
  if (!accessory) {
    throw new ApiError(404, 'Accessory not found');
  }

  accessory.isActive = !accessory.isActive;
  await accessory.save();

  res.json({
    success: true,
    message: `Accessory ${
      accessory.isActive ? 'activated' : 'deactivated'
    } successfully`,
    data: accessory,
  });
});
