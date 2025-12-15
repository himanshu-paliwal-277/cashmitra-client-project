const BuySuperCategory = require('../models/buySuperCategory.model');
const BuyCategory = require('../models/buyCategory.model');
const {
  asyncHandler,
  ApiError,
} = require('../middlewares/errorHandler.middleware');




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

  const superCategories = await BuySuperCategory.find(filter)
    .sort(sort)
    .populate('categories');

  res.status(200).json({
    success: true,
    count: superCategories.length,
    data: superCategories,
  });
});




exports.getPublicSuperCategories = asyncHandler(async (req, res) => {
  const { search, sort = 'sortOrder' } = req.query;

  const filter = { isActive: true };

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const superCategories = await BuySuperCategory.find(filter)
    .select('name description image sortOrder isActive')
    .sort(sort);

  res.status(200).json({
    success: true,
    count: superCategories.length,
    data: superCategories,
  });
});




exports.getSuperCategory = asyncHandler(async (req, res) => {
  const superCategory = await BuySuperCategory.findById(req.params.id).populate(
    'categories'
  );

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

  const superCategory = await BuySuperCategory.create(superCategoryData);

  res.status(201).json({
    success: true,
    message: 'Super category created successfully',
    data: superCategory,
  });
});




exports.updateSuperCategory = asyncHandler(async (req, res) => {
  let superCategory = await BuySuperCategory.findById(req.params.id);

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

  superCategory = await BuySuperCategory.findByIdAndUpdate(
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
  const superCategory = await BuySuperCategory.findById(req.params.id);

  if (!superCategory) {
    throw new ApiError(404, 'Super category not found');
  }

  
  const categoriesCount = await BuyCategory.countDocuments({
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
  const superCategory = await BuySuperCategory.findById(req.params.id);

  if (!superCategory) {
    throw new ApiError(404, 'Super category not found');
  }

  const categories = await BuyCategory.find({
    superCategory: req.params.id,
  }).sort('sortOrder');

  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories,
  });
});



exports.getPublicCategoriesBySuperCategory = asyncHandler(async (req, res) => {
  const superCategory = await BuySuperCategory.findById(req.params.id);

  if (!superCategory) {
    throw new ApiError(404, 'Super category not found');
  }

  if (!superCategory.isActive) {
    throw new ApiError(404, 'Super category is not active');
  }

  const categories = await BuyCategory.find({
    superCategory: req.params.id,
    isActive: true, 
  }).sort('sortOrder');

  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories,
  });
});