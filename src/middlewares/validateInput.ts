import { Request, Response, NextFunction } from "express";
import { z } from "zod";

// Skema untuk registrasi
const RegisterSchema = z
  .object({
    name: z.string().min(3, "Nama minimal 3 karakter"),
    email: z.string().email("Email tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter"),
  })
  .passthrough();

// Skema untuk login
const LoginSchema = z
  .object({
    email: z.string().email("Email tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter"),
  })
  .passthrough();

// Skema untuk lupa password
const ForgotPasswordSchema = z.object({
  email: z.string().email("Email tidak valid"),
});

// Skema untuk reset password
const ResetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(6, "Password minimal 6 karakter"),
});

// Skema untuk change password
const ChangePasswordSchema = z.object({
  email: z.string().email("Email tidak valid"),
  newPassword: z.string().min(6, "Password minimal 6 karakter"),
});

export const validateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = (req.query.token || req.body.token || req.params.token) as
    | string
    | undefined;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Token verifikasi diperlukan",
    });
  }

  if (typeof token !== "string" || token.length < 10) {
    return res.status(400).json({
      success: false,
      message: "Format token tidak valid",
    });
  }

  req.verifiedToken = token;
  next();
};

export const validateRegisterInput = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    RegisterSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validasi gagal",
        errors: error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        })),
      });
    }
    next(error);
  }
};

export const validateLoginInput = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    LoginSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validasi gagal",
        errors: error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        })),
      });
    }
    next(error);
  }
};

export const validateForgotPasswordInput = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    ForgotPasswordSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validasi gagal",
        errors: error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        })),
      });
    }
    next(error);
  }
};

export const validateResetPasswordInput = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    ResetPasswordSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validasi gagal",
        errors: error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        })),
      });
    }
    next(error);
  }
};

export const validateChangePasswordInput = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    ChangePasswordSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validasi gagal",
        errors: error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        })),
      });
    }
    next(error);
  }
};
