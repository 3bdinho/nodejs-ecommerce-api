const express = require("express");
const BrandService = require("../services/brandService");

const {
  getBrandValidator,
  createBrandValidator,
  deleteBrandValidator,
  updateBrandValidator,
} = require("../utils/validator/brandValidator");
const authService = require("../services/authService");

const router = express.Router();

router
  .route("/")
  .get(BrandService.getBrands)
  .post(
    authService.protect,
    authService.restrict("admin"),
    BrandService.uploadBrandimage,
    BrandService.resizeCategoryImage,
    createBrandValidator,
    BrandService.createBrand
  );

router
  .route("/:id")
  .get(getBrandValidator, BrandService.getBrand)
  .patch(
    authService.protect,
    authService.restrict("admin"),
    BrandService.uploadBrandimage,
    BrandService.resizeCategoryImage,
    updateBrandValidator,
    BrandService.updateBrand
  )
  .delete(
    authService.protect,
    authService.restrict("admin"),
    deleteBrandValidator,
    BrandService.deleteBrand
  );

module.exports = router;
