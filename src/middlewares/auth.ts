import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../utils/prisma";

export const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token = req.headers.authorization?.split(" ")[1];
    if (!token && req.cookies) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ message: "Authorization token required" });
    }

    // Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
    };

    // Cek user di database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        isVerified: true,
        lastVisited: true,
        role: true, 
      },
    });

    if (!user) {
      return res.status(401).json({ message: "User tidak valid" });
    }

    // Attach user ke request
    (req as any).user = user;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        message: "Session expired after 12 hours. Please login again",
        expired: true,
      });
    }
    console.error("Authentication error:", err);
    res.status(401).json({ message: "Token tidak valid" });
  }
};

export const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token = req.headers.authorization?.split(" ")[1];
    if (!token && req.cookies) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ message: "Authorization token required" });
    }

    // Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
    };

    // Cek user di database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        role: true, // Tambahkan role
      },
    });

    if (!user) {
      return res.status(401).json({ message: "User tidak valid" });
    }

    // Cek jika user adalah admin
    if (user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ message: "Akses ditolak. Hanya untuk admin" });
    }

    // Attach user ke request
    (req as any).user = user;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        message: "Admin session expired after 12 hours. Please login again",
        expired: true,
      });
    }
    console.error("Admin authentication error:", err);
    res.status(401).json({ message: "Token tidak valid" });
  }
};
