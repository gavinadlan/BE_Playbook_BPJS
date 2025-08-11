import { Router } from "express";
import {
  register,
  login,
  verifyEmail,
  changePassword,
  requestResetPassword,
  resetPassword,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  me,
} from "../controllers/user.controller";
import {
  validateRegisterInput,
  validateLoginInput,
  validateChangePasswordInput,
  validateToken,
  validateForgotPasswordInput,
  validateResetPasswordInput,
} from "../middlewares/validateInput";
import { isAuthenticated, isAdmin } from "../middlewares/auth";

const router = Router();

// Authentication routes
router.post("/register", validateRegisterInput, register);
router.post("/login", validateLoginInput, login);
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  res.json({ success: true, message: "Logout berhasil" });
});
router.get("/me", isAuthenticated, me);
router.post("/verify-email", validateToken, verifyEmail);

// Password management routes
router.put("/change-password", validateChangePasswordInput, changePassword);
router.post("/request-reset-password", validateForgotPasswordInput, requestResetPassword);
router.post("/reset-password", validateResetPasswordInput, resetPassword);

// User management routes (admin only)
router.get("/", isAuthenticated, isAdmin, getAllUsers);
router.get("/:id", isAuthenticated, isAdmin, getUserById);
router.put("/:id", isAuthenticated, isAdmin, updateUser);
router.delete("/:id", isAuthenticated, isAdmin, deleteUser);

export default router;
