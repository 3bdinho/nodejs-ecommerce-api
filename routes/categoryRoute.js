const express = require("express");
const CategoryService = require("../services/categoryService");

const {
  getCategoryValidator,
  createCategoryValidator,
  deleteCategoryValidator,
  updateCategoryValidator,
} = require("../utils/validator/categoryValidator");
const subCategoryRoute = require("./subCategoryRoute");
const authService = require("../services/authService");

// const upload = multer({ dest: "uploads/categories" });

const router = express.Router();

router
  .route("/")
  .get(CategoryService.getCategories)
  .post(
    authService.protect,
    authService.restrict("admin"),
    CategoryService.uploadCategoryimage,
    CategoryService.resizeCategoryImage,
    createCategoryValidator,
    CategoryService.createCategorie
  );

router
  .route("/:id")
  .get(authService.protect, getCategoryValidator, CategoryService.getCategory)
  .patch(
    authService.protect,
    authService.restrict("admin"),
    CategoryService.uploadCategoryimage,
    CategoryService.resizeCategoryImage,
    updateCategoryValidator,
    CategoryService.updateCategory
  )
  .delete(
    authService.protect,
    authService.restrict("admin"),
    deleteCategoryValidator,
    CategoryService.deleteCategory
  );

router.use("/:categoryId/subCategories", subCategoryRoute);

module.exports = router;
