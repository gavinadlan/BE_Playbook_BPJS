import { Request, Response, NextFunction } from "express";

export const validateRegisterInput = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ message: "Semua field wajib diisi." });
    return;
  }
  next();
};

export const validateLoginInput = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ message: "Email dan password wajib diisi." });
    return;
  }
  next();
};

export const validateChangePasswordInput = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    res.status(400).json({ message: "Email dan password baru wajib diisi." });
    return;
  }
  next();
};

export const validateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { token } = req.query;

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
