import { Request, Response } from "express";
import { dashboardService } from "../services/dashboard.service";
import { ResponseUtil } from "../utils/response.util";

// Get dashboard statistics
export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const dashboardStats = await dashboardService.getDashboardStats();
    ResponseUtil.success(res, dashboardStats, "Statistik dashboard berhasil diambil");
  } catch (error) {
    ResponseUtil.error(res, "Gagal mengambil statistik dashboard");
  }
}; 