import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface CreatePksData {
  company: string;
  userId: number;
  originalName: string;
  filename: string;
  path: string;
}

export interface UpdatePksStatusData {
  status: "PENDING" | "APPROVED" | "REJECTED";
  reason?: string;
}

export class PksService {
  // Get all PKS with optional user filter
  async getAllPks(userId?: string) {
    return await prisma.pks.findMany({
      where: userId
        ? {
            userId: parseInt(userId),
          }
        : {},
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { submittedAt: "desc" },
    });
  }

  // Create new PKS
  async createPks(data: CreatePksData) {
    if (!data.company || !data.userId || !data.filename) {
      throw new Error("Semua field wajib diisi.");
    }

    return await prisma.pks.create({
      data: {
        originalName: data.originalName,
        filename: data.filename,
        path: data.path,
        company: data.company,
        userId: data.userId,
        status: "PENDING",
      },
    });
  }

  // Get all PKS submissions (admin)
  async getAllPksSubmissions() {
    return await prisma.pks.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { submittedAt: "desc" },
    });
  }

  // Update PKS status
  async updatePksStatus(id: number, data: UpdatePksStatusData) {
    const updateData: any = { status: data.status };
    
    if (data.status === "APPROVED") {
      updateData.approvedAt = new Date();
    }
    if (data.status === "REJECTED") {
      updateData.rejectedAt = new Date();
    }
    if (data.reason) {
      updateData.reason = data.reason;
    }

    return await prisma.pks.update({
      where: { id },
      data: updateData,
    });
  }

  // Get PKS by ID
  async getPksById(id: number) {
    const pks = await prisma.pks.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!pks) {
      throw new Error("PKS tidak ditemukan");
    }

    return pks;
  }

  // Get PKS statistics
  async getPksStatistics() {
    const [total, pending, approved, rejected] = await Promise.all([
      prisma.pks.count(),
      prisma.pks.count({ where: { status: "PENDING" } }),
      prisma.pks.count({ where: { status: "APPROVED" } }),
      prisma.pks.count({ where: { status: "REJECTED" } }),
    ]);

    return { total, pending, approved, rejected };
  }
}

export const pksService = new PksService(); 