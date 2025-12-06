// Imports remain the same, removing Stripe dependency
import { TryCatch } from "../middlewares/error.js";
import { Coupon } from "../models/coupon.js";
import ErrorHandler from "../utils/utility-class.js";

// createPaymentIntent function REMOVED

export const newCoupon = TryCatch(async (req, res, next) => {
  const { code, amount } = req.body;

  if (!code || !amount)
    return next(new ErrorHandler("Please enter both coupon code and amount", 400));
    
  const discountAmount = Number(amount);
  if (isNaN(discountAmount) || discountAmount <= 0) 
    return next(new ErrorHandler("Amount must be a positive number", 400));

  await Coupon.create({ code, amount: discountAmount });

  return res.status(201).json({
    success: true,
    message: `Coupon ${code} Created Successfully`,
  });
});

export const applyDiscount = TryCatch(async (req, res, next) => {
  const couponCode = req.query.coupon as string;

  if (!couponCode) 
     return next(new ErrorHandler("Please provide a coupon code", 400));
    
  const discount = await Coupon.findOne({ code: couponCode });

  if (!discount) return next(new ErrorHandler("Invalid Coupon Code", 400));

  return res.status(200).json({
    success: true,
    discount: discount.amount,
  });
});

export const allCoupons = TryCatch(async (req, res, next) => {
  const coupons = await Coupon.find({});

  return res.status(200).json({
    success: true,
    coupons,
  });
});

export const getCoupon = TryCatch(async (req, res, next) => {
  const { id } = req.params;

  const coupon = await Coupon.findById(id);

  if (!coupon) return next(new ErrorHandler("Coupon Not Found", 404)); // FIX: Changed to 404

  return res.status(200).json({
    success: true,
    coupon,
  });
});

export const updateCoupon = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const { code, amount } = req.body;

  const coupon = await Coupon.findById(id);

  if (!coupon) return next(new ErrorHandler("Coupon Not Found", 404)); // FIX: Changed to 404

  if (code) coupon.code = code;
  
  if (amount) {
    const discountAmount = Number(amount);
    if (isNaN(discountAmount) || discountAmount <= 0) 
        return next(new ErrorHandler("Amount must be a positive number", 400));
    coupon.amount = discountAmount;
  }

  await coupon.save();

  return res.status(200).json({
    success: true,
    message: `Coupon ${coupon.code} Updated Successfully`,
  });
});

export const deleteCoupon = TryCatch(async (req, res, next) => {
  const { id } = req.params;

  const coupon = await Coupon.findByIdAndDelete(id);

  if (!coupon) return next(new ErrorHandler("Coupon Not Found", 404)); // FIX: Changed to 404

  return res.status(200).json({
    success: true,
    message: `Coupon ${coupon.code} Deleted Successfully`,
  });
});