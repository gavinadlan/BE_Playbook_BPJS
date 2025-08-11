import { Response } from "express";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
}

export class ResponseUtil {
  static success<T>(
    res: Response,
    data: T,
    message: string = "Success",
    statusCode: number = 200
  ) {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
    };
    return res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    message: string = "Error occurred",
    statusCode: number = 500,
    error?: any
  ) {
    const response: ApiResponse = {
      success: false,
      message,
      error: process.env.NODE_ENV === "development" ? error : undefined,
    };
    return res.status(statusCode).json(response);
  }

  static notFound(res: Response, message: string = "Resource not found") {
    return this.error(res, message, 404);
  }

  static badRequest(res: Response, message: string = "Bad request") {
    return this.error(res, message, 400);
  }

  static unauthorized(res: Response, message: string = "Unauthorized") {
    return this.error(res, message, 401);
  }

  static forbidden(res: Response, message: string = "Forbidden") {
    return this.error(res, message, 403);
  }

  static conflict(res: Response, message: string = "Conflict") {
    return this.error(res, message, 409);
  }
} 