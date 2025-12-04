import express from "express";
import {
  deleteUser,
  getAllUsers,
  getUser,
  newUser,
  loginUser,
  registerUser,
} from "../controllers/user.js";
import { adminOnly } from "../middlewares/auth.js";

const app = express.Router();

// route - /api/v1/user/new (Firebase-based signup)
app.post("/new", newUser);

// route - /api/v1/user/register (Email/password signup)
app.post("/register", registerUser);

// route - /api/v1/user/login (Email/password login)
app.post("/login", loginUser);

// Route - /api/v1/user/all
app.get("/all", adminOnly, getAllUsers);

// Route - /api/v1/user/dynamicID
app.route("/:id").get(getUser).delete(adminOnly, deleteUser);

export default app;
