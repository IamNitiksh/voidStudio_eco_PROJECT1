import { User } from "../models/user.js";
import ErrorHandler from "../utils/utility-class.js";
import { TryCatch } from "../middlewares/error.js"; 

export const adminOnly = TryCatch(async (req, res, next) => {
  const { id } = req.query;

  // FIX: Replaced slang with professional error messages
  if (!id) return next(new ErrorHandler("Please login to access this resource", 401)); 

  const user = await User.findById(id);
  // FIX: Replaced slang with professional error messages
  if (!user) return next(new ErrorHandler("Invalid User ID or Account Not Found", 401)); 
    
  if (user.role !== "admin")
    // FIX: Replaced slang with professional error messages
    return next(new ErrorHandler("You are not authorized to perform this action", 403)); 

  next();
});