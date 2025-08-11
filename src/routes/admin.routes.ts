import express from "express";
import { isAuthenticated, isAdmin } from "../middlewares/auth";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/user.controller";
import {
  getAllPksSubmissions,
  updatePksStatus,
} from "../controllers/pks.controller";
import { getDashboardStats } from "../controllers/dashboard.controller";

const router = express.Router();

// Gunakan middleware untuk semua route admin
router.use(isAuthenticated);
router.use(isAdmin);

// Dashboard statistics
router.get("/dashboard", getDashboardStats);

// User management
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// PKS management
router.get("/pks", getAllPksSubmissions);
router.patch("/pks/:id/status", updatePksStatus);

export default router;
