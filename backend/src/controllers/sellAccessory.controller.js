/**
 * @fileoverview Sell Accessory Management Controller
 * @description Handles all sell accessory-related operations including CRUD operations
 * and accessory ordering.
 * @author Cashify Development Team
 * @version 1.0.0
 */

const { validationResult } = require("express-validator");
const SellAccessory = require("../models/sellAccessory.model");
const SellProduct = require("../models/sellProduct.model");
const {
  ApiError,
  asyncHandler,
} = require("../middlewares/errorHandler.middleware");

/**
 * Create new sell accessory
 * @route POST /api/sell/accessories
 * @access Private (Admin only)
 */
exports.createAccessory = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, "Validation Error", errors.array());
  }

  const { categoryId, key, title, delta } = req.body;

  // Verify category exists
  const Category = require("../models/category.model");
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  // Check if accessory with same key already exists for this category
  const existingAccessory = await SellAccessory.findOne({ categoryId, key });
  if (existingAccessory) {
    throw new ApiError(
      400,
      "Accessory with this key already exists for this category"
    );
  }

  // Get next order number
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
    message: "Accessory created successfully",
    data: accessory,
  });
});

/**
 * Get all accessories for a product
 * @route GET /api/sell/accessories
 * @access Private (Admin only)
 */
exports.getAccessories = asyncHandler(async (req, res) => {
  const { categoryId, isActive } = req.query;

  const query = {};

  if (categoryId) query.categoryId = categoryId;
  if (isActive !== undefined) query.isActive = isActive === "true";

  const accessories = await SellAccessory.find(query)
    .populate("categoryId", "name")
    .populate("createdBy", "name email")
    .sort({ order: 1 });

  res.json({
    success: true,
    data: accessories,
  });
});

/**
 * Get accessories for customer flow
 * @route GET /api/sell/accessories/customer/:categoryId
 * @access Public
 */
exports.getAccessoriesForCustomer = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  const accessories = await SellAccessory.getActiveForCategory(categoryId);

  res.json({
    success: true,
    data: accessories,
  });
});

/**
 * Get accessories for customers (public endpoint)
 * @route GET /api/sell/accessories/customer
 * @access Public
 */
exports.getCustomerAccessories = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, "Validation Error", errors.array());
  }

  const { categoryId } = req.query;

  // Verify category exists
  const Category = require("../models/category.model");
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  // Get all active accessories for the category
  const accessories = await SellAccessory.find({
    categoryId,
    isActive: true,
  }).sort({ order: 1 });

  res.json({
    success: true,
    data: accessories,
  });
});

/**
 * Get single accessory
 * @route GET /api/sell/accessories/:id
 * @access Private (Admin only)
 */
exports.getAccessory = asyncHandler(async (req, res) => {
  const accessory = await SellAccessory.findById(req.params.id)
    .populate("categoryId", "name")
    .populate("createdBy", "name email");

  if (!accessory) {
    throw new ApiError(404, "Accessory not found");
  }

  res.json({
    success: true,
    data: accessory,
  });
});

/**
 * Update accessory
 * @route PUT /api/sell/accessories/:id
 * @access Private (Admin only)
 */
exports.updateAccessory = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, "Validation Error", errors.array());
  }

  const { key, title, delta, isActive, order } = req.body;

  const accessory = await SellAccessory.findById(req.params.id);
  if (!accessory) {
    throw new ApiError(404, "Accessory not found");
  }

  // Check if key is being changed and if it conflicts
  if (key && key !== accessory.key) {
    const existingAccessory = await SellAccessory.findOne({
      categoryId: accessory.categoryId,
      key,
      _id: { $ne: req.params.id },
    });
    if (existingAccessory) {
      throw new ApiError(
        400,
        "Accessory with this key already exists for this category"
      );
    }
  }

  const updatedAccessory = await SellAccessory.findByIdAndUpdate(
    req.params.id,
    { ...req.body, updatedBy: req.user._id },
    { new: true, runValidators: true }
  )
    .populate("categoryId", "name")
    .populate("createdBy", "name email");

  res.json({
    success: true,
    message: "Accessory updated successfully",
    data: updatedAccessory,
  });
});

/**
 * Reindex accessory orders
 * @route POST /api/sell/accessories/reindex-orders
 * @access Private (Admin only)
 */
exports.reindexAccessoryOrders = asyncHandler(async (req, res) => {
  try {
    // Get all accessories
    const accessories = await SellAccessory.find({});

    // Group by categoryId
    const byCategory = {};
    accessories.forEach((acc) => {
      const catId = acc.categoryId ? acc.categoryId.toString() : "null";
      if (!byCategory[catId]) {
        byCategory[catId] = [];
      }
      byCategory[catId].push(acc);
    });

    let updatedCount = 0;

    // Update each category's accessories with sequential orders
    for (const categoryId in byCategory) {
      const categoryAccessories = byCategory[categoryId];

      // Sort by createdAt
      categoryAccessories.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      // Update each accessory
      for (let i = 0; i < categoryAccessories.length; i++) {
        await SellAccessory.findByIdAndUpdate(
          categoryAccessories[i]._id,
          { order: i + 1 },
          { runValidators: false } // Skip validation to allow partial update
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
      "Failed to reindex accessory orders: " + error.message
    );
  }
});

/**
 * Migrate productId to categoryId and reindex orders
 * @route POST /api/sell/accessories/migrate-and-reindex
 * @access Private (Admin only)
 */
exports.migrateAndReindexAccessories = asyncHandler(async (req, res) => {
  try {
    const SellProduct = require("../models/sellProduct.model");
    const mongoose = require("mongoose");

    // Get all accessories with productId field
    const accessories = await SellAccessory.find({}).lean();

    let migratedCount = 0;

    // Migrate productId to categoryId
    for (const acc of accessories) {
      // Check if it has productId field (even if null)
      if ("productId" in acc) {
        if (acc.productId && !acc.categoryId) {
          // Get the product to find its categoryId
          const product = await SellProduct.findById(acc.productId).select(
            "categoryId"
          );

          if (product && product.categoryId) {
            // Update with categoryId and remove productId
            await mongoose.connection.collection("sellaccessories").updateOne(
              { _id: acc._id },
              {
                $set: { categoryId: product.categoryId },
                $unset: { productId: 1 },
              }
            );
            migratedCount++;
          }
        } else if (!acc.productId && !acc.categoryId) {
          // Remove empty productId field
          await mongoose.connection
            .collection("sellaccessories")
            .updateOne({ _id: acc._id }, { $unset: { productId: 1 } });
        }
      }
    }

    // Now reindex orders
    const updatedAccessories = await SellAccessory.find({});
    const byCategory = {};

    updatedAccessories.forEach((acc) => {
      const catId = acc.categoryId ? acc.categoryId.toString() : "null";
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
    throw new ApiError(500, "Migration failed: " + error.message);
  }
});

/**
 * Delete accessory
 * @route DELETE /api/sell/accessories/:id
 * @access Private (Admin only)
 */
exports.deleteAccessory = asyncHandler(async (req, res) => {
  const accessory = await SellAccessory.findById(req.params.id);
  if (!accessory) {
    throw new ApiError(404, "Accessory not found");
  }

  await accessory.deleteOne();

  res.json({
    success: true,
    message: "Accessory deleted successfully",
  });
});

/**
 * Bulk create accessories
 * @route POST /api/sell/accessories/bulk
 * @access Private (Admin)
 */
exports.bulkCreateAccessories = asyncHandler(async (req, res) => {
  const { categoryId, accessories } = req.body;

  // Verify category exists
  const Category = require("../models/category.model");
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  // Validate accessories array
  if (!Array.isArray(accessories) || accessories.length === 0) {
    throw new ApiError(
      400,
      "Accessories array is required and cannot be empty"
    );
  }

  // Check for duplicate keys within the request
  const keys = accessories.map((acc) => acc.key);
  const duplicateKeys = keys.filter(
    (key, index) => keys.indexOf(key) !== index
  );
  if (duplicateKeys.length > 0) {
    throw new ApiError(
      400,
      `Duplicate keys found in request: ${duplicateKeys.join(", ")}`
    );
  }

  // Check for existing accessories with same keys for this category
  const existingAccessories = await SellAccessory.find({
    categoryId,
    key: { $in: keys },
  });

  if (existingAccessories.length > 0) {
    const existingKeys = existingAccessories.map((acc) => acc.key);
    throw new ApiError(
      400,
      `Accessories with these keys already exist for this category: ${existingKeys.join(
        ", "
      )}`
    );
  }

  // Get next order number
  const lastAccessory = await SellAccessory.findOne({ categoryId }).sort({
    order: -1,
  });
  let nextOrder = lastAccessory ? lastAccessory.order + 1 : 1;

  // Prepare accessories for bulk insert
  const accessoriesToCreate = accessories.map((accessory) => ({
    categoryId,
    key: accessory.key,
    title: accessory.title,
    delta: accessory.delta,
    isActive: accessory.isActive !== undefined ? accessory.isActive : true,
    order: nextOrder++,
    createdBy: req.user._id,
  }));

  // Bulk insert
  const createdAccessories = await SellAccessory.insertMany(
    accessoriesToCreate
  );

  res.status(201).json({
    success: true,
    message: `${createdAccessories.length} accessories created successfully`,
    data: createdAccessories,
  });
});

/**
 * Reorder accessories
 * @route PUT /api/sell/accessories/reorder
 * @access Private (Admin)
 */
exports.reorderAccessories = asyncHandler(async (req, res) => {
  const { categoryId, accessoryIds } = req.body;

  // Verify category exists
  const Category = require("../models/category.model");
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  // Validate accessoryIds array
  if (!Array.isArray(accessoryIds) || accessoryIds.length === 0) {
    throw new ApiError(
      400,
      "Accessory IDs array is required and cannot be empty"
    );
  }

  // Verify all accessories belong to the specified category
  const accessories = await SellAccessory.find({
    _id: { $in: accessoryIds },
    categoryId,
  });

  if (accessories.length !== accessoryIds.length) {
    throw new ApiError(
      400,
      "Some accessories do not belong to the specified category"
    );
  }

  // Update order for each accessory
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
    message: "Accessories reordered successfully",
    data: updatedAccessories,
  });
});

/**
 * Toggle accessory status
 * @route PATCH /api/sell/accessories/:id/toggle-status
 * @access Private (Admin only)
 */
exports.toggleAccessoryStatus = asyncHandler(async (req, res) => {
  const accessory = await SellAccessory.findById(req.params.id);
  if (!accessory) {
    throw new ApiError(404, "Accessory not found");
  }

  accessory.isActive = !accessory.isActive;
  await accessory.save();

  res.json({
    success: true,
    message: `Accessory ${
      accessory.isActive ? "activated" : "deactivated"
    } successfully`,
    data: accessory,
  });
});
