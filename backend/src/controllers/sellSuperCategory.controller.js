const SellSuperCategory = require('../models/sellSuperCategory.model');
const Category = require('../models/category.model');
const {
  asyncHandler,
  ApiError,
} = require('../middlewares/errorHandler.middleware');




exports.getPublicSuperCategories = asyncHandler(async (req, res) => {
  const superCategories = await SellSuperCategory.find({ isActive: true })
    .sort('sortOrder')
    .select('name slug image description');

  
  const superCategoriesWithCategories = await Promise.all(
    superCategories.map(async (superCat) => {
      const categories = await Category.find({
        superCategory: superCat._id,
        isActive: true,
      })
        .sort('sortOrder')
        .select('name slug image description');

      return {
        ...superCat.toObject(),
        categories,
      };
    })
  );

  res.status(200).json({
    success: true,
    count: superCategoriesWithCategories.length,
    data: superCategoriesWithCategories,
  });
});




exports.getAllSuperCategories = asyncHandler(async (req, res) => {
  const { isActive, search, sort = 'sortOrder' } = req.query;

  const filter = {};

  if (isActive !== undefined) {
    filter.isActive = isActive === 'true';
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const superCategories = await SellSuperCategory.find(filter)
    .sort(sort)
    .populate('categories');

  res.status(200).json({
    success: true,
    count: superCategories.length,
    data: superCategories,
  });
});




exports.getSuperCategory = asyncHandler(async (req, res) => {
  const superCategory = await SellSuperCategory.findById(
    req.params.id
  ).populate('categories');

  if (!superCategory) {
    throw new ApiError(404, 'Super category not found');
  }

  res.status(200).json({
    success: true,
    data: superCategory,
  });
});




exports.createSuperCategory = asyncHandler(async (req, res) => {
  const { name, description, image, isActive, sortOrder } = req.body;

  
  if (!image) {
    throw new ApiError(400, 'Please provide an image URL');
  }

  const superCategoryData = {
    name,
    description,
    image, 
    isActive,
    sortOrder,
    createdBy: req.user._id,
  };

  const superCategory = await SellSuperCategory.create(superCategoryData);

  res.status(201).json({
    success: true,
    message: 'Super category created successfully',
    data: superCategory,
  });
});




exports.updateSuperCategory = asyncHandler(async (req, res) => {
  let superCategory = await SellSuperCategory.findById(req.params.id);

  if (!superCategory) {
    throw new ApiError(404, 'Super category not found');
  }

  const { name, description, image, isActive, sortOrder } = req.body;

  const updateData = {
    name,
    description,
    isActive,
    sortOrder,
    updatedBy: req.user._id,
  };

  
  if (image) {
    updateData.image = image;
  }

  superCategory = await SellSuperCategory.findByIdAndUpdate(
    req.params.id,
    updateData,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    message: 'Super category updated successfully',
    data: superCategory,
  });
});




exports.deleteSuperCategory = asyncHandler(async (req, res) => {
  const superCategory = await SellSuperCategory.findById(req.params.id);

  if (!superCategory) {
    throw new ApiError(404, 'Super category not found');
  }

  
  const categoriesCount = await Category.countDocuments({
    superCategory: req.params.id,
  });

  if (categoriesCount > 0) {
    throw new ApiError(
      400,
      'Cannot delete super category with linked categories. Please delete or reassign categories first.'
    );
  }

  await superCategory.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Super category deleted successfully',
    data: null,
  });
});




exports.getCategoriesBySuperCategory = asyncHandler(async (req, res) => {
  const superCategory = await SellSuperCategory.findById(req.params.id);

  if (!superCategory) {
    throw new ApiError(404, 'Super category not found');
  }

  const categories = await Category.find({
    superCategory: req.params.id,
  }).sort('sortOrder');

  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories,
  });
});
