const express = require("express");
const subCategoryService = require("../services/subCategoryService");
const {
  createSubCategoryValidator,
  updateSubCategoryValidator,
  deleteSubCategoryValidator,
} = require("../utils/validator/subCategoryValidator");
const authService = require("../services/authService");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .post(
    authService.protect,
    authService.restrict("admin", "seller"),
    subCategoryService.setCategoryIdToBody,
    createSubCategoryValidator,
    subCategoryService.createSubCategory
  )
  .get(
    subCategoryService.createFilterObject,
    subCategoryService.getSubCategories
  );

router
  .route("/:id")
  .get(subCategoryService.getSubCategory)
  .patch(
    authService.protect,
    authService.restrict("admin", "seller"),
    updateSubCategoryValidator,
    subCategoryService.updateSubCategory
  )
  .delete(
    authService.protect,
    authService.restrict("admin"),
    deleteSubCategoryValidator,
    subCategoryService.deleteSubCategory
  );

module.exports = router;
