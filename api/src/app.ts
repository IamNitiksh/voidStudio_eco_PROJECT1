import express from "express";
import { connectDB /*, connectRedis*/ } from "./utils/features.js"; // Removed connectRedis
import { errorMiddleware } from "./middlewares/error.js";
import { config } from "dotenv";
import morgan from "morgan";
// import Stripe from "stripe"; // Commented out Stripe import
import cors from "cors";
// import { v2 as cloudinary } from "cloudinary"; // Commented out Cloudinary import

// Importing Routes
import userRoute from "./routes/user.js";
import productRoute from "./routes/products.js";
import orderRoute from "./routes/order.js";
import paymentRoute from "./routes/payment.js";
import dashboardRoute from "./routes/stats.js";

config({
  path: "./.env",
});

const port = process.env.PORT || 4000;
const mongoURI = process.env.MONGO_URI || "";
// const stripeKey = process.env.STRIPE_KEY || ""; // Commented out stripe key
// const redisURI = process.env.REDIS_URI || ""; // Commented out redis URI

// CRITICAL CORS FIX: Allow multiple frontend origins in development
// In production, set CLIENT_URL to your deployed frontend URL
const clientURL = process.env.CLIENT_URL || "http://localhost:5174";
const allowedOrigins = [
  clientURL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:5175",
]; 

// export const redisTTL = process.env.REDIS_TTL || 60 * 60 * 4; // Commented out redisTTL and its export

connectDB(mongoURI);
// export const redis = connectRedis(redisURI); // Commented out Redis connection and its export

// Commented out Cloudinary configuration
/*
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});
*/

// export const stripe = new Stripe(stripeKey); // Commented out Stripe initialization and its export

const app = express();

app.use(express.json());
app.use(morgan("dev"));

// APPLYING CORS WITH CORRECT ORIGIN(S)
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("API Working with /api/v1");
});

// Using Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/order", orderRoute);
app.use("/api/v1/payment", paymentRoute);
app.use("/api/v1/dashboard", dashboardRoute);

app.use("/uploads", express.static("uploads"));
app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`Express is working on http://localhost:${port}`);
  console.log(`CORS Policy allowing access from: ${clientURL}`);
});