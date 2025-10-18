const SubCategory = require("../models/subCategoryModel");
const handlersFactory = require("./handlersFactory");

exports.setCategoryIdToBody = (req, res, next) => {
  // Ensure category comes from either body or route
  if (!req.body.category) req.body.category = req.params.categoryId;
  next();
};

exports.createFilterObject = (req, res, next) => {
  // For nested route
  let filterObject = {};
  if (req.params.categoryId) filterObject = { category: req.params.categoryId };

  req.filterObj = filterObject;

  next();
};

// @desc    get subCategory
// @route   GET /api/v1/subCategories
// @access  public
exports.getSubCategories = handlersFactory.getAll(SubCategory);

// @desc    Create subCategory
// @route   Post  /api/v1/subcategories
// @access  Private
exports.createSubCategory = handlersFactory.createOne(SubCategory);

// @desc  get specific subCategory by id
// @route GET /api/v1/categories/:id
// @access public
exports.getSubCategory = handlersFactory.getOne(SubCategory);

// @desc  update specific subCategory by id
// @route patch /api/v1/subCategories/:id
// @access Private
exports.updateSubCategory = handlersFactory.updateOne(SubCategory);

// @desc  delete specific subcategory by id
// @route delete /api/v1/subCategories/:id
// @access Private
exports.deleteSubCategory = handlersFactory.deleteOne(SubCategory);
