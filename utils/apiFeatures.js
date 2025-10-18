class ApiFeatures {
  constructor(mongooseQuery, queryStr) {
    this.mongooseQuery = mongooseQuery;
    this.queryStr = queryStr;
  }

  filter() {
    // 1) Filtering
    const queryObj = { ...this.queryStr };
    const excludesFields = ["page", "sort", "limit", "fields", "keyword"];
    excludesFields.forEach((field) => delete queryObj[field]);
    // Apply Filtering using [gte|gt|lte|lt]
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    //4) Sorting
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.sort(sortBy);
    } else {
      this.mongooseQuery.sort("-createdAt");
    }
    return this;
  }

  select() {
    if (this.queryStr.fields) {
      const fieldBy = this.queryStr.fields.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.select(fieldBy);
    } else {
      this.mongooseQuery = this.mongooseQuery.select("-__v");
    }
    return this;
  }

  search(modelName) {
    const { keyword } = this.queryStr;
    if (!keyword) return this;

    const fields =
      modelName === "Product" ? ["title", "description"] : ["name"];

    const kayWordFilter = {
      $or: fields.map((field) => ({
        [field]: { $regex: keyword, $options: "i" },
      })),
    };

    this.mongooseQuery = this.mongooseQuery.find(kayWordFilter);
    return this;
  }

  paginate(countDocuments) {
    //3) Pagination
    const page = Number(this.queryStr.page) || 1;
    const limit = Number(this.queryStr.limit) || 10;
    const skip = (page - 1) * limit;
    const endIndex = page * limit;

    const pagination = {};
    pagination.currentPage = page;
    pagination.limit = limit;
    pagination.numberOfPages = Math.ceil(countDocuments / limit);

    if (endIndex < countDocuments) pagination.next = page + 1;
    if (skip > 0) pagination.prev = page - 1;

    this.paginationResult = pagination;
    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);

    return this;
  }
}

module.exports = ApiFeatures;
