import { Request } from "express";
// import { redis, redisTTL } from "../app.js"; // REMOVED
import { TryCatch } from "../middlewares/error.js";
import { Product } from "../models/product.js";
import { Review } from "../models/review.js";
import { User } from "../models/user.js";
import {
  BaseQuery,
  NewProductRequestBody,
  SearchRequestQuery,
} from "../types/types.js";
import {
  calculatePercentage,
  // deleteFromCloudinary, // REMOVED
  findAverageRatings,
  getChartData,
  getInventories,
  // invalidateCache, // REMOVED
  // uploadToCloudinary, // REMOVED
} from "../utils/features.js";
import ErrorHandler from "../utils/utility-class.js";
import { Order } from "../models/order.js";

// Revalidate on New,Update,Delete Product & on New Order
export const getlatestProducts = TryCatch(async (req, res, next) => {
  // Cache logic REMOVED. Fetching directly from DB.
  const products = await Product.find({}).sort({ createdAt: -1 }).limit(5);

  return res.status(200).json({
    success: true,
    products,
  });
});

// Revalidate on New,Update,Delete Product & on New Order
export const getAllCategories = TryCatch(async (req, res, next) => {
  // Cache logic REMOVED. Fetching directly from DB.
  const categories = await Product.distinct("category");

  return res.status(200).json({
    success: true,
    categories,
  });
});

// Revalidate on New,Update,Delete Product & on New Order
export const getAdminProducts = TryCatch(async (req, res, next) => {
  // Cache logic REMOVED. Fetching directly from DB.
  const products = await Product.find({});

  return res.status(200).json({
    success: true,
    products,
  });
});

export const getSingleProduct = TryCatch(async (req, res, next) => {
  const id = req.params.id;

  // Cache logic REMOVED. Fetching directly from DB.
  const product = await Product.findById(id);
  if (!product) return next(new ErrorHandler("Product Not Found", 404));

  return res.status(200).json({
    success: true,
    product,
  });
});

export const newProduct = TryCatch(
  async (req: Request<{}, {}, NewProductRequestBody>, res, next) => {
    const { name, price, stock, category, description } = req.body;
    const photos = req.files as Express.Multer.File[] | undefined;

    if (!photos) return next(new ErrorHandler("Please add Photo", 400));

    if (photos.length < 1)
      return next(new ErrorHandler("Please add atleast one Photo", 400));

    if (photos.length > 5)
      return next(new ErrorHandler("You can only upload 5 Photos", 400));

    if (!name || !price || !stock || !category || !description)
      return next(new ErrorHandler("Please enter All Fields", 400));

    // CLOUDINARY LOGIC REPLACED: Placeholder logic for photos
    // const photosURL = await uploadToCloudinary(photos);
    const photosURL = photos.map(file => ({ public_id: `temp_${file.originalname}`, url: `/uploads/${file.filename}` }));
    // ------------------------------------

    await Product.create({
      name,
      price,
      description,
      stock,
      category: category.toLowerCase(),
      photos: photosURL,
    });

    // invalidateCache logic REMOVED
    // await invalidateCache({ product: true, admin: true });

    return res.status(201).json({
      success: true,
      message: "Product Created Successfully",
    });
  }
);

export const updateProduct = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const { name, price, stock, category, description } = req.body;
  const photos = req.files as Express.Multer.File[] | undefined;

  const product = await Product.findById(id);

  if (!product) return next(new ErrorHandler("Product Not Found", 404));

  if (photos && photos.length > 0) {
    // CLOUDINARY LOGIC REPLACED: Placeholder logic for photos
    // const photosURL = await uploadToCloudinary(photos);
    // const ids = product.photos.map((photo) => photo.public_id);
    // await deleteFromCloudinary(ids);
    // product.photos = photosURL;
    // ------------------------------------
    return next(new ErrorHandler("Image update functionality disabled (Cloudinary) for now.", 400));
  }

  if (name) product.name = name;
  if (price) product.price = price;
  if (stock) product.stock = stock;
  if (category) product.category = category;
  if (description) product.description = description;

  await product.save();

  // invalidateCache logic REMOVED
  /*
  await invalidateCache({
    product: true,
    productId: String(product._id),
    admin: true,
  });
  */

  return res.status(200).json({
    success: true,
    message: "Product Updated Successfully",
  });
});

export const deleteProduct = TryCatch(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new ErrorHandler("Product Not Found", 404));

  // CLOUDINARY LOGIC REMOVED
  // const ids = product.photos.map((photo) => photo.public_id);
  // await deleteFromCloudinary(ids);

  await product.deleteOne();

  // invalidateCache logic REMOVED
  /*
  await invalidateCache({
    product: true,
    productId: String(product._id),
    admin: true,
  });
  */

  return res.status(200).json({
    success: true,
    message: "Product Deleted Successfully",
  });
});

export const getAllProducts = TryCatch(
  async (req: Request<{}, {}, {}, SearchRequestQuery>, res, next) => {
    const { search, sort, category, price } = req.query;

    const page = Number(req.query.page) || 1;

    const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
    const skip = (page - 1) * limit;

    const baseQuery: BaseQuery = {};

    if (search)
      baseQuery.name = {
        $regex: search,
        $options: "i",
      };

    if (price)
      baseQuery.price = {
        $lte: Number(price),
      };

    if (category) baseQuery.category = category;

    const productsPromise = Product.find(baseQuery)
      .sort(sort && { price: sort === "asc" ? 1 : -1 })
      .limit(limit)
      .skip(skip);

    const [products, filteredOnlyProduct] = await Promise.all([
      productsPromise,
      Product.find(baseQuery),
    ]);

    const totalPage = Math.ceil(filteredOnlyProduct.length / limit);

    return res.status(200).json({
      success: true,
      products,
      totalPage,
    });
  }
);

export const allReviewsOfProduct = TryCatch(async (req, res, next) => {
  // Cache logic REMOVED. Fetching directly from DB.
  const reviews = await Review.find({
    product: req.params.id,
  })
    .populate("user", "name photo")
    .sort({ updatedAt: -1 });

  return res.status(200).json({
    success: true,
    reviews,
  });
});

export const newReview = TryCatch(async (req, res, next) => {
  const user = await User.findById(req.query.id);

  if (!user) return next(new ErrorHandler("Not Logged In", 404));

  const product = await Product.findById(req.params.id);
  if (!product) return next(new ErrorHandler("Product Not Found", 404));

  const { comment, rating } = req.body;

  const alreadyReviewed = await Review.findOne({
    user: user._id,
    product: product._id,
  });

  if (alreadyReviewed) {
    alreadyReviewed.comment = comment;
    alreadyReviewed.rating = rating;

    await alreadyReviewed.save();
  } else {
    await Review.create({
      comment,
      rating,
      user: user._id,
      product: product._id,
    });
  }

  const { ratings, numOfReviews } = await findAverageRatings(product._id);

  product.ratings = ratings;
  product.numOfReviews = numOfReviews;

  await product.save();

  // invalidateCache logic REMOVED
  /*
  await invalidateCache({
    product: true,
    productId: String(product._id),
    admin: true,
    review: true,
  });
  */

  return res.status(alreadyReviewed ? 200 : 201).json({
    success: true,
    message: alreadyReviewed ? "Review Update" : "Review Added",
  });
});

export const deleteReview = TryCatch(async (req, res, next) => {
  const user = await User.findById(req.query.id);

  if (!user) return next(new ErrorHandler("Not Logged In", 404));

  const review = await Review.findById(req.params.id);
  if (!review) return next(new ErrorHandler("Review Not Found", 404));

  const isAuthenticUser = review.user.toString() === user._id.toString();

  if (!isAuthenticUser) return next(new ErrorHandler("Not Authorized", 401));

  await review.deleteOne();

  const product = await Product.findById(review.product);

  if (!product) return next(new ErrorHandler("Product Not Found", 404));

  const { ratings, numOfReviews } = await findAverageRatings(product._id);

  product.ratings = ratings;
  product.numOfReviews = numOfReviews;

  await product.save();

  // invalidateCache logic REMOVED
  /*
  await invalidateCache({
    product: true,
    productId: String(product._id),
    admin: true,
  });
  */

  return res.status(200).json({
    success: true,
    message: "Review Deleted",
  });
});

// Admin Dashboard Stats

export const getDashboardStats = TryCatch(async (req, res, next) => {
  // Cache logic REMOVED. Fetching directly from DB.

  const today = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const thisMonth = {
    start: new Date(today.getFullYear(), today.getMonth(), 1),
    end: today,
  };

  const lastMonth = {
    start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
    end: new Date(today.getFullYear(), today.getMonth(), 0),
  };

  const thisMonthProductsPromise = Product.find({
    createdAt: {
      $gte: thisMonth.start,
      $lte: thisMonth.end,
    },
  });

  const lastMonthProductsPromise = Product.find({
    createdAt: {
      $gte: lastMonth.start,
      $lte: lastMonth.end,
    },
  });

  const thisMonthUsersPromise = User.find({
    createdAt: {
      $gte: thisMonth.start,
      $lte: thisMonth.end,
    },
  });

  const lastMonthUsersPromise = User.find({
    createdAt: {
      $gte: lastMonth.start,
      $lte: lastMonth.end,
    },
  });

  const thisMonthOrdersPromise = Order.find({
    createdAt: {
      $gte: thisMonth.start,
      $lte: thisMonth.end,
    },
  });

  const lastMonthOrdersPromise = Order.find({
    createdAt: {
      $gte: lastMonth.start,
      $lte: lastMonth.end,
    },
  });

  const lastSixMonthOrdersPromise = Order.find({
    createdAt: {
      $gte: sixMonthsAgo,
      $lte: today,
    },
  });

  const latestTransactionsPromise = Order.find({})
    .select(["orderItems", "discount", "total", "status"])
    .limit(4);

  const [
    thisMonthProducts,
    thisMonthUsers,
    thisMonthOrders,
    lastMonthProducts,
    lastMonthUsers,
    lastMonthOrders,
    productsCount,
    usersCount,
    allOrders,
    lastSixMonthOrders,
    categories,
    femaleUsersCount,
    latestTransaction,
  ] = await Promise.all([
    thisMonthProductsPromise,
    thisMonthUsersPromise,
    thisMonthOrdersPromise,
    lastMonthProductsPromise,
    lastMonthUsersPromise,
    lastMonthOrdersPromise,
    Product.countDocuments(),
    User.countDocuments(),
    Order.find({}).select("total"),
    lastSixMonthOrdersPromise,
    Product.distinct("category"),
    User.countDocuments({ gender: "female" }),
    latestTransactionsPromise,
  ]);

  const thisMonthRevenue = thisMonthOrders.reduce(
    (total, order) => total + (order.total || 0),
    0
  );

  const lastMonthRevenue = lastMonthOrders.reduce(
    (total, order) => total + (order.total || 0),
    0
  );

  const changePercent = {
    revenue: calculatePercentage(thisMonthRevenue, lastMonthRevenue),
    product: calculatePercentage(
      thisMonthProducts.length,
      lastMonthProducts.length
    ),
    user: calculatePercentage(thisMonthUsers.length, lastMonthUsers.length),
    order: calculatePercentage(
      thisMonthOrders.length,
      lastMonthOrders.length
    ),
  };

  const revenue = allOrders.reduce(
    (total, order) => total + (order.total || 0),
    0
  );

  const count = {
    revenue,
    product: productsCount,
    user: usersCount,
    order: allOrders.length,
  };

  const orderMonthCounts = new Array(6).fill(0);
  const orderMonthyRevenue = new Array(6).fill(0);

  lastSixMonthOrders.forEach((order) => {
    const creationDate = order.createdAt;
    const monthDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12;

    if (monthDiff < 6) {
      orderMonthCounts[6 - monthDiff - 1] += 1;
      orderMonthyRevenue[6 - monthDiff - 1] += order.total;
    }
  });

  const categoryCount = await getInventories({
    categories,
    productsCount,
  });

  const userRatio = {
    male: usersCount - femaleUsersCount,
    female: femaleUsersCount,
  };

  const modifiedLatestTransaction = latestTransaction.map((i) => ({
    _id: i._id,
    discount: i.discount,
    amount: i.total,
    quantity: i.orderItems.length,
    status: i.status,
  }));

  const stats = {
    categoryCount,
    changePercent,
    count,
    chart: {
      order: orderMonthCounts,
      revenue: orderMonthyRevenue,
    },
    userRatio,
    latestTransaction: modifiedLatestTransaction,
  };

  // Cache logic REMOVED
  // await redis.setex(key, redisTTL, JSON.stringify(stats));


  return res.status(200).json({
    success: true,
    stats,
  });
});

export const getPieCharts = TryCatch(async (req, res, next) => {
  // Cache logic REMOVED. Fetching directly from DB.

  const allOrderPromise = Order.find({}).select([
    "total",
    "discount",
    "subtotal",
    "tax",
    "shippingCharges",
  ]);

  const [
    processingOrder,
    shippedOrder,
    deliveredOrder,
    categories,
    productsCount,
    outOfStock,
    allOrders,
    allUsers,
    adminUsers,
    customerUsers,
  ] = await Promise.all([
    Order.countDocuments({ status: "Processing" }),
    Order.countDocuments({ status: "Shipped" }),
    Order.countDocuments({ status: "Delivered" }),
    Product.distinct("category"),
    Product.countDocuments(),
    Product.countDocuments({ stock: 0 }),
    allOrderPromise,
    User.find({}).select(["dob"]),
    User.countDocuments({ role: "admin" }),
    User.countDocuments({ role: "user" }),
  ]);

  const orderFullfillment = {
    processing: processingOrder,
    shipped: shippedOrder,
    delivered: deliveredOrder,
  };

  const productCategories = await getInventories({
    categories,
    productsCount,
  });

  const stockAvailablity = {
    inStock: productsCount - outOfStock,
    outOfStock,
  };

  const grossIncome = allOrders.reduce(
    (prev, order) => prev + (order.total || 0),
    0
  );

  const discount = allOrders.reduce(
    (prev, order) => prev + (order.discount || 0),
    0
  );

  const productionCost = allOrders.reduce(
    (prev, order) => prev + (order.shippingCharges || 0),
    0
  );

  const burnt = allOrders.reduce((prev, order) => prev + (order.tax || 0), 0);

  const marketingCost = Math.round(grossIncome * (30 / 100));

  const netMargin =
    grossIncome - discount - productionCost - burnt - marketingCost;

  const revenueDistribution = {
    netMargin,
    discount,
    productionCost,
    burnt,
    marketingCost,
  };
  
  // Helper to calculate age from DOB in User model for usersAgeGroup chart
  const calculateAge = (dob: Date): number => {
    const diff_ms = Date.now() - dob.getTime();
    const age_dt = new Date(diff_ms); 
    return Math.abs(age_dt.getUTCFullYear() - 1970);
  };

  const usersAgeGroup = {
    // Assuming 'dob' is fetched and exists on the User model
    teen: allUsers.filter((i) => calculateAge(i.dob) < 20).length, 
    adult: allUsers.filter((i) => {
      const age = calculateAge(i.dob);
      return age >= 20 && age < 40;
    }).length,
    old: allUsers.filter((i) => calculateAge(i.dob) >= 40).length,
  };
  // End of age calculation logic

  const adminCustomer = {
    admin: adminUsers,
    customer: customerUsers,
  };

  const charts = {
    orderFullfillment,
    productCategories,
    stockAvailablity,
    revenueDistribution,
    usersAgeGroup,
    adminCustomer,
  };

  // Cache logic REMOVED
  // await redis.setex(key, redisTTL, JSON.stringify(charts));

  return res.status(200).json({
    success: true,
    charts,
  });
});

export const getBarCharts = TryCatch(async (req, res, next) => {
  // Cache logic REMOVED. Fetching directly from DB.

  const today = new Date();

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const sixMonthProductPromise = Product.find({
    createdAt: {
      $gte: sixMonthsAgo,
      $lte: today,
    },
  }).select("createdAt");

  const sixMonthUsersPromise = User.find({
    createdAt: {
      $gte: sixMonthsAgo,
      $lte: today,
    },
  }).select("createdAt");

  const twelveMonthOrdersPromise = Order.find({
    createdAt: {
      $gte: twelveMonthsAgo,
      $lte: today,
    },
  }).select("createdAt");

  const [products, users, orders] = await Promise.all([
    sixMonthProductPromise,
    sixMonthUsersPromise,
    twelveMonthOrdersPromise,
  ]);

  const productCounts = getChartData({ length: 6, today, docArr: products });
  const usersCounts = getChartData({ length: 6, today, docArr: users });
  const ordersCounts = getChartData({ length: 12, today, docArr: orders });

  const charts = {
    users: usersCounts,
    products: productCounts,
    orders: ordersCounts,
  };

  // Cache logic REMOVED
  // await redis.setex(key, redisTTL, JSON.stringify(charts));

  return res.status(200).json({
    success: true,
    charts,
  });
});

export const getLineCharts = TryCatch(async (req, res, next) => {
  // Cache logic REMOVED. Fetching directly from DB.

  const today = new Date();

  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const baseQuery = {
    createdAt: {
      $gte: twelveMonthsAgo,
      $lte: today,
    },
  };

  const [products, users, orders] = await Promise.all([
    Product.find(baseQuery).select("createdAt"),
    User.find(baseQuery).select("createdAt"),
    Order.find(baseQuery).select(["createdAt", "discount", "total"]),
  ]);

  const productCounts = getChartData({ length: 12, today, docArr: products });
  const usersCounts = getChartData({ length: 12, today, docArr: users });
  const discount = getChartData({
    length: 12,
    today,
    docArr: orders,
    property: "discount",
  });
  const revenue = getChartData({
    length: 12,
    today,
    docArr: orders,
    property: "total",
  });

  const charts = {
    users: usersCounts,
    products: productCounts,
    discount,
    revenue,
  };

  // Cache logic REMOVED
  // await redis.setex(key, redisTTL, JSON.stringify(charts));

  return res.status(200).json({
    success: true,
    charts,
  });
});