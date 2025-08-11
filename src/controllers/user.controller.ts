import { Request, Response } from "express";
import { userService } from "../services/user.service";
import { ResponseUtil } from "../utils/response.util";
import { userValidations, ValidationMiddleware } from "../middleware/validation.middleware";

// Authentication Controllers
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    await userService.register({ name, email, password });
    
    ResponseUtil.success(
      res,
      null,
      "Registrasi berhasil. Silakan cek email untuk verifikasi.",
      201
    );
  } catch (error) {
    ResponseUtil.error(res, error instanceof Error ? error.message : "Gagal register");
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const result = await userService.login({ email, password });
    // Set JWT as httpOnly cookie
    res.cookie("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // true jika di production
      sameSite: "lax",
      maxAge: 12 * 60 * 60 * 1000, // 12 jam
    });
    // Kirim hanya user, jangan token
    ResponseUtil.success(res, { user: result.user }, "Login berhasil");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal login";
    const statusCode = message.includes("tidak ditemukan") ? 404 : 
                      message.includes("verifikasi") ? 403 : 400;
    ResponseUtil.error(res, message, statusCode);
  }
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!("verifiedToken" in req)) {
      ResponseUtil.badRequest(res, "Token tidak tersedia di request.");
      return;
    }

    const token = req.verifiedToken;
    if (!token || typeof token !== "string") {
      ResponseUtil.badRequest(res, "Token tidak valid atau tidak ditemukan.");
      return;
    }

    await userService.verifyEmail(token);
    ResponseUtil.success(res, null, "Email berhasil diverifikasi. Silakan login.");
  } catch (error) {
    ResponseUtil.error(res, error instanceof Error ? error.message : "Gagal verifikasi email");
  }
};

// Password Management Controllers
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, newPassword } = req.body;
    await userService.changePassword(email, newPassword);
    ResponseUtil.success(res, null, "Password berhasil diubah.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal ubah password";
    const statusCode = message.includes("tidak ditemukan") ? 404 : 400;
    ResponseUtil.error(res, message, statusCode);
  }
};

export const requestResetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    await userService.requestResetPassword(email);
    
    ResponseUtil.success(
      res,
      null,
      "Instruksi reset password telah dikirim ke email Anda"
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal request reset password";
    const statusCode = message.includes("tidak ditemukan") ? 404 : 500;
    ResponseUtil.error(res, message, statusCode);
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;
    
    let decodedToken;
    try {
      decodedToken = decodeURIComponent(token);
    } catch (error) {
      ResponseUtil.badRequest(res, "Format token tidak valid");
      return;
    }

    await userService.resetPassword(decodedToken, newPassword);
    ResponseUtil.success(
      res,
      null,
      "Password berhasil direset. Silakan login dengan password baru."
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal reset password";
    const statusCode = message.includes("tidak valid") ? 400 : 500;
    ResponseUtil.error(res, message, statusCode);
  }
};

// User Management Controllers (Admin)
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await userService.getAllUsers();
    ResponseUtil.success(res, users, "Data users berhasil diambil");
  } catch (error) {
    ResponseUtil.error(res, "Gagal mengambil data users");
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(parseInt(id));
    ResponseUtil.success(res, user, "Data user berhasil diambil");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal mengambil data user";
    const statusCode = message.includes("tidak ditemukan") ? 404 : 500;
    ResponseUtil.error(res, message, statusCode);
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, role, password, isVerified } = req.body;
    
    const updatedUser = await userService.updateUser(parseInt(id), {
      name,
      email,
      role,
      password,
      isVerified,
    });
    
    ResponseUtil.success(res, updatedUser, "User berhasil diupdate");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal mengupdate user";
    const statusCode = message.includes("tidak ditemukan") ? 404 : 
                      message.includes("sudah digunakan") ? 409 : 500;
    ResponseUtil.error(res, message, statusCode);
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const currentUserId = (req as any).user?.id;
    
    await userService.deleteUser(parseInt(id), currentUserId);
    ResponseUtil.success(res, null, "User berhasil dihapus");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal menghapus user";
    const statusCode = message.includes("tidak ditemukan") ? 404 : 
                      message.includes("akun sendiri") ? 400 : 500;
    ResponseUtil.error(res, message, statusCode);
  }
};

export const me = async (req: Request, res: Response): Promise<void> => {
  try {
    // Diasumsikan sudah lewat isAuthenticated, user sudah ada di req.user
    const user = (req as any).user;
    if (!user) {
      ResponseUtil.unauthorized(res, "User tidak ditemukan di session");
      return;
    }
    ResponseUtil.success(res, { user }, "User aktif");
  } catch (error) {
    ResponseUtil.error(res, "Gagal mengambil data user aktif");
  }
};

// Export validation middleware for routes
export { userValidations, ValidationMiddleware }; 