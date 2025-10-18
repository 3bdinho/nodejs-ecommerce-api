const asyncHandler = require("express-async-handler");

const ApiError = require("../utils/ApiError");
const ApiFeatures = require("../utils/apiFeatures");

exports.deleteOne = (model) =>
  asyncHandler(async (req, res, next) => {
    const doc = await model.findOneAndDelete({ _id: req.params.id });

    if (!doc) {
      return next(new ApiError("product not found", 404));
    }

    res.status(204).json({
      status: "success",
      message: "Deleted successfully",
    });
  });

exports.updateOne = (model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const disallowedFields = ["_id", "createdAt"];
    disallowedFields.forEach((field) => delete req.body[field]);

    const doc = await model.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new ApiError(`${model.modelName} not found`, 404));
    }

    // Special handling for Review model
    if (model.modelName === "Review") {
      await model.calcAverageRatings(doc.product);
    }

    res.status(200).json({
      status: "success",
      data: doc,
    });
  });

exports.getOne = (model, populationOpt) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    let query = await model.findById(id);
    //1-Build query
    if (populationOpt) {
      query = query.populate(populationOpt);
    }
    // 2- Excecute query
    const doc = await query;

    if (!doc) {
      return next(new ApiError(`${model.modelName} not found`, 404));
    }

    res.status(200).json({
      status: "success",
      data: doc,
    });
  });

exports.createOne = (model) =>
  asyncHandler(async (req, res, next) => {
    const newDoc = await model.create(req.body);

    res.status(201).json({
      status: "success",
      data: newDoc,
    });
  });

exports.getAll = (model, modelName = "") =>
  asyncHandler(async (req, res) => {
    let filter = {};
    if (req.filterObject) {
      filter = req.filterObject;
    }

    // Build query
    const countDocs = await model.countDocuments();
    const apiFeatures = new ApiFeatures(model.find(filter), req.query)
      .paginate(countDocs)
      .sort()
      .filter()
      .select()
      .search(modelName);

    // Execute query
    const { mongooseQuery, paginationResult } = apiFeatures;
    const doc = await mongooseQuery;

    res.status(200).json({
      status: "success",
      result: doc.length,
      paginationResult,
      data: doc,
    });
  });
