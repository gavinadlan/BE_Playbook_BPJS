import { v4 as uuidv4 } from "uuid";
import * as jwt from "jsonwebtoken";

// Untuk verifikasi email
export function generateVerificationToken(): string {
  return uuidv4();
}

// Untuk reset password (return object dengan token dan expiry)
export function generateResetPasswordToken(): {
  token: string;
  expiresAt: Date;
} {
  return {
    token: uuidv4(),
    expiresAt: new Date(Date.now() + 3600000), // 1 jam
  };
}

export const generateAuthToken = (userId: number, role: string): string => {
  const JWT_SECRET = process.env.JWT_SECRET;

  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  // Explicit typing untuk menghindari conflict
  const payload: any = {
    userId: userId,
    role: role,
  };

  const options: any = {
    expiresIn: "12h",
  };

  return jwt.sign(payload, JWT_SECRET, options);
};
