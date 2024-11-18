class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filter() {
    //FILTERING
    const exludedFields = ["page", "limit", "sort", "fields"];
    let queryObj = { ...this.queryString };
    exludedFields.forEach((el) => {
      delete queryObj[el];
    });
    //ADVANCED FILTERING
    let queryStr = JSON.stringify(queryObj);
    const replaceStr = /\b(gte|gt|lte|lt)\b/g;
    queryStr = queryStr.replace(replaceStr, (match) => {
      return `$${match}`;
    });
    queryObj = JSON.parse(queryStr);

    this.query = this.query.find(queryObj);
    return this;
  }
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }
  Limitfields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }
  paginate() {
    const limit = this.queryString.limit || 10;
    const page = this.queryString.page || 1;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    // if (req.query.page) {
    //   const moviesCount = await Movie.countDocuments();
    //   if (skip >= moviesCount) {
    //     throw new Error("This page is not found!");
    //   }
    // }
    return this;
  }
}

module.exports = APIFeatures;
