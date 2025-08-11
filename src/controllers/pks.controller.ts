import { Request, Response } from "express";
import { pksService } from "../services/pks.service";
import { ResponseUtil } from "../utils/response.util";
import { io } from "../server";

// Get all PKS
export const getAllPks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.query;
    const pksList = await pksService.getAllPks(userId as string);
    ResponseUtil.success(res, pksList, "Data PKS berhasil diambil");
  } catch (error) {
    ResponseUtil.error(res, "Gagal mengambil data PKS");
  }
};

// Create PKS
export const createPks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { company, userId } = req.body;
    const file = req.file;

    if (!file || !company || !userId) {
      ResponseUtil.badRequest(res, "Semua field wajib diisi.");
      return;
    }

    const baseUrl = process.env.BASE_URL || "http://localhost:3001";

    const newPks = await pksService.createPks({
      company,
      userId: parseInt(userId),
      originalName: file.originalname,
      filename: file.filename,
      path: `${baseUrl}/uploads/${file.filename}`,
    });

    // Emit event to all admin (or all clients)
    io.emit("new_pks_submission", {
      pks: newPks,
    });

    ResponseUtil.success(res, newPks, "PKS berhasil dibuat", 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal membuat PKS";
    ResponseUtil.error(res, message, 400);
  }
};

// Get all PKS submissions (admin)
export const getAllPksSubmissions = async (req: Request, res: Response): Promise<void> => {
  try {
    const submissions = await pksService.getAllPksSubmissions();
    ResponseUtil.success(res, submissions, "Data PKS submissions berhasil diambil");
  } catch (error) {
    ResponseUtil.error(res, "Gagal mengambil data PKS submissions");
  }
};

// Update PKS status (admin)
export const updatePksStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    const updated = await pksService.updatePksStatus(parseInt(id), {
      status,
      reason,
    });

    // Ambil data PKS yang sudah diupdate untuk dapat userId
    const updatedPks = await pksService.getPksById(parseInt(id));
    const userId = updatedPks.userId;
    if (userId) {
      io.to(`user:${userId}`).emit("status_pks_update", {
        pksId: updatedPks.id,
        status: updatedPks.status,
        updatedAt: new Date(),
      });
      if (status === "APPROVED" || status === "REJECTED") {
        io.to(`user:${userId}`).emit("notification", {
          type: "info",
          message:
            status === "APPROVED"
              ? "PKS Anda telah di-approve!"
              : `PKS Anda ditolak${reason ? ": " + reason : ""}`,
          createdAt: new Date(),
        });
      }
    }

    ResponseUtil.success(res, updated, "Status PKS berhasil diupdate");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal mengupdate status PKS";
    const statusCode = message.includes("tidak ditemukan") ? 404 : 500;
    ResponseUtil.error(res, message, statusCode);
  }
};

// Get PKS by ID
export const getPksById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const pks = await pksService.getPksById(parseInt(id));
    ResponseUtil.success(res, pks, "Data PKS berhasil diambil");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal mengambil data PKS";
    const statusCode = message.includes("tidak ditemukan") ? 404 : 500;
    ResponseUtil.error(res, message, statusCode);
  }
};

// Get PKS statistics
export const getPksStatistics = async (req: Request, res: Response): Promise<void> => {
  try {
    const statistics = await pksService.getPksStatistics();
    ResponseUtil.success(res, statistics, "Statistik PKS berhasil diambil");
  } catch (error) {
    ResponseUtil.error(res, "Gagal mengambil statistik PKS");
  }
}; 