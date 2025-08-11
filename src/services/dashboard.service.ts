import { PrismaClient } from "@prisma/client";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/id";

dayjs.extend(relativeTime);
dayjs.locale("id");

const prisma = new PrismaClient();

export interface DashboardStats {
  stats: Array<{
    title: string;
    value: string;
    change: string;
    description: string;
    link: string;
  }>;
  activities: Array<{
    user: string;
    action: string;
    time: string;
  }>;
  summary: {
    totalUsers: number;
    totalPks: number;
    pendingPks: number;
    approvedPks: number;
    rejectedPks: number;
  };
}

export class DashboardService {
  // Calculate date ranges for comparisons
  private getDateRanges() {
    const now = new Date();
    const lastMonth = dayjs(now).subtract(1, "month").toDate();
    const startOfCurrentMonth = dayjs(now).startOf("month").toDate();
    const startOfLastMonth = dayjs(now)
      .subtract(1, "month")
      .startOf("month")
      .toDate();
    const endOfLastMonth = dayjs(now)
      .subtract(1, "month")
      .endOf("month")
      .toDate();

    return {
      now,
      lastMonth,
      startOfCurrentMonth,
      startOfLastMonth,
      endOfLastMonth,
    };
  }

  // Get user statistics
  private async getUserStatistics() {
    const { startOfCurrentMonth, startOfLastMonth, endOfLastMonth } = this.getDateRanges();

    const [totalUsers, usersLastMonth, usersCurrentMonth] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
        },
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: startOfCurrentMonth,
          },
        },
      }),
    ]);

    const userGrowth =
      usersLastMonth > 0
        ? Math.round(((usersCurrentMonth - usersLastMonth) / usersLastMonth) * 100)
        : usersCurrentMonth > 0
        ? 100
        : 0;

    return { totalUsers, userGrowth };
  }

  // Get PKS statistics
  private async getPksStatistics() {
    const { startOfCurrentMonth, startOfLastMonth, endOfLastMonth } = this.getDateRanges();

    const [totalPks, pendingPks, approvedPks, rejectedPks] = await Promise.all([
      prisma.pks.count(),
      prisma.pks.count({ where: { status: "PENDING" } }),
      prisma.pks.count({ where: { status: "APPROVED" } }),
      prisma.pks.count({ where: { status: "REJECTED" } }),
    ]);

    // Get PKS statistics for comparison
    const [pendingPksLastMonth, pendingPksCurrentMonth, approvedPksLastMonth, approvedPksCurrentMonth] = await Promise.all([
      prisma.pks.count({
        where: {
          status: "PENDING",
          submittedAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
        },
      }),
      prisma.pks.count({
        where: {
          status: "PENDING",
          submittedAt: {
            gte: startOfCurrentMonth,
          },
        },
      }),
      prisma.pks.count({
        where: {
          status: "APPROVED",
          approvedAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
        },
      }),
      prisma.pks.count({
        where: {
          status: "APPROVED",
          approvedAt: {
            gte: startOfCurrentMonth,
          },
        },
      }),
    ]);

    const pendingGrowth =
      pendingPksLastMonth > 0
        ? Math.round(((pendingPksCurrentMonth - pendingPksLastMonth) / pendingPksLastMonth) * 100)
        : pendingPksCurrentMonth > 0
        ? 100
        : 0;

    const approvedGrowth =
      approvedPksLastMonth > 0
        ? Math.round(((approvedPksCurrentMonth - approvedPksLastMonth) / approvedPksLastMonth) * 100)
        : approvedPksCurrentMonth > 0
        ? 100
        : 0;

    return {
      totalPks,
      pendingPks,
      approvedPks,
      rejectedPks,
      pendingGrowth,
      approvedGrowth,
    };
  }

  // Get recent activities
  private async getRecentActivities() {
    const { now } = this.getDateRanges();

    const [recentPks, recentUsers] = await Promise.all([
      prisma.pks.findMany({
        where: {
          OR: [
            { status: "APPROVED", approvedAt: { not: null } },
            { status: "REJECTED", rejectedAt: { not: null } },
          ],
        },
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
        orderBy: [
          { approvedAt: "desc" },
          { rejectedAt: "desc" },
          { submittedAt: "desc" },
        ],
        take: 5,
      }),
      prisma.user.findMany({
        where: {
          createdAt: {
            gte: dayjs(now).subtract(7, "day").toDate(),
          },
        },
        select: {
          name: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
    ]);

    const getStatusText = (status: string) => {
      switch (status) {
        case "APPROVED":
          return "menyetujui";
        case "REJECTED":
          return "menolak";
        default:
          return "memproses";
      }
    };

    const activities = [
      // PKS activities
      ...recentPks.map((pks) => {
        const actionTime =
          pks.status === "APPROVED"
            ? pks.approvedAt
            : pks.rejectedAt || pks.submittedAt;

        return {
          user: "Admin",
          action: `${getStatusText(pks.status)} dokumen PKS dari ${
            pks.user?.name || "Tidak Diketahui"
          }`,
          time: dayjs(actionTime).fromNow(),
        };
      }),
      // User registration activities
      ...recentUsers.map((user) => ({
        user: user.name,
        action: "mendaftar ke sistem",
        time: dayjs(user.createdAt).fromNow(),
      })),
    ].slice(0, 5);

    return activities;
  }

  // Get dashboard statistics
  async getDashboardStats(): Promise<DashboardStats> {
    const [userStats, pksStats, activities] = await Promise.all([
      this.getUserStatistics(),
      this.getPksStatistics(),
      this.getRecentActivities(),
    ]);

    const stats = [
      {
        title: "Total User",
        value: userStats.totalUsers.toString(),
        change: userStats.userGrowth >= 0 ? `+${userStats.userGrowth}%` : `${userStats.userGrowth}%`,
        description: "Dibandingkan bulan lalu",
        link: "/admin/users",
      },
      {
        title: "PKS Menunggu",
        value: pksStats.pendingPks.toString(),
        change: pksStats.pendingGrowth >= 0 ? `+${pksStats.pendingGrowth}%` : `${pksStats.pendingGrowth}%`,
        description: "Dibandingkan bulan lalu",
        link: "/admin/pks",
      },
      {
        title: "PKS Disetujui",
        value: pksStats.approvedPks.toString(),
        change: pksStats.approvedGrowth >= 0 ? `+${pksStats.approvedGrowth}%` : `${pksStats.approvedGrowth}%`,
        description: "Dibandingkan bulan lalu",
        link: "/admin/pks",
      },
    ];

    return {
      stats,
      activities,
      summary: {
        totalUsers: userStats.totalUsers,
        totalPks: pksStats.totalPks,
        pendingPks: pksStats.pendingPks,
        approvedPks: pksStats.approvedPks,
        rejectedPks: pksStats.rejectedPks,
      },
    };
  }
}

export const dashboardService = new DashboardService(); 