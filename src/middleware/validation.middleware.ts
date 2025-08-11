import { Request, Response, NextFunction } from "express";
import { ResponseUtil } from "../utils/response.util";

export interface ValidationRule {
  field: string;
  required?: boolean;
  type?: "string" | "number" | "email";
  minLength?: number;
  maxLength?: number;
}

export class ValidationMiddleware {
  static validate(rules: ValidationRule[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      const errors: string[] = [];

      for (const rule of rules) {
        const value = req.body[rule.field];

        // Check required
        if (rule.required && (!value || value.trim() === "")) {
          errors.push(`${rule.field} wajib diisi`);
          continue;
        }

        // Skip validation if value is empty and not required
        if (!value && !rule.required) {
          continue;
        }

        // Check type
        if (rule.type === "email" && value) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            errors.push(`${rule.field} harus berupa email yang valid`);
          }
        }

        // Check length
        if (rule.minLength && value && value.length < rule.minLength) {
          errors.push(`${rule.field} minimal ${rule.minLength} karakter`);
        }

        if (rule.maxLength && value && value.length > rule.maxLength) {
          errors.push(`${rule.field} maksimal ${rule.maxLength} karakter`);
        }
      }

      if (errors.length > 0) {
        return ResponseUtil.badRequest(res, errors.join(", "));
      }

      next();
    };
  }

  static validateId(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const numId = parseInt(id);

    if (isNaN(numId)) {
      return ResponseUtil.badRequest(res, "ID tidak valid");
    }

    req.params.id = numId.toString();
    next();
  }
}

// Predefined validation rules
export const userValidations = {
  register: ValidationMiddleware.validate([
    { field: "name", required: true, minLength: 2, maxLength: 50 },
    { field: "email", required: true, type: "email" },
    { field: "password", required: true, minLength: 6, maxLength: 100 },
  ]),

  login: ValidationMiddleware.validate([
    { field: "email", required: true, type: "email" },
    { field: "password", required: true },
  ]),

  changePassword: ValidationMiddleware.validate([
    { field: "email", required: true, type: "email" },
    { field: "newPassword", required: true, minLength: 6, maxLength: 100 },
  ]),

  requestResetPassword: ValidationMiddleware.validate([
    { field: "email", required: true, type: "email" },
  ]),

  resetPassword: ValidationMiddleware.validate([
    { field: "token", required: true },
    { field: "newPassword", required: true, minLength: 6, maxLength: 100 },
  ]),

  updateUser: ValidationMiddleware.validate([
    { field: "name", minLength: 2, maxLength: 50 },
    { field: "email", type: "email" },
    { field: "password", minLength: 6, maxLength: 100 },
  ]),
}; 