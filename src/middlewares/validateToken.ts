import { Request, Response, NextFunction } from "express";

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
