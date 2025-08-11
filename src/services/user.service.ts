import bcrypt from "bcryptjs";
import prisma from "../utils/prisma";
import {
  generateVerificationToken,
  generateResetPasswordToken,
  generateAuthToken,
} from "../utils/token";
import {
  sendVerificationEmail,
  sendResetPasswordEmail,
} from "./email.service";

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: string;
  password?: string;
  isVerified?: boolean;
}

export class UserService {
  // Register user
  async register(data: CreateUserData) {
    const existingUser = await prisma.user.findUnique({ 
      where: { email: data.email } 
    });
    
    if (existingUser) {
      throw new Error("Email sudah terdaftar.");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const token = generateVerificationToken();

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        isVerified: false,
        verificationToken: token,
      },
    });

    await sendVerificationEmail(data.email, token);
    return user;
  }

  // Login user
  async login(data: LoginData) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new Error("User tidak ditemukan.");
    }

    if (!user.isVerified) {
      throw new Error("Silakan verifikasi email terlebih dahulu.");
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      throw new Error("Password salah.");
    }

    const token = generateAuthToken(user.id, user.role);

    await prisma.user.update({
      where: { id: user.id },
      data: { lastVisited: new Date() },
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }

  // Verify email
  async verifyEmail(token: string) {
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        isVerified: false,
      },
    });

    if (!user) {
      throw new Error("Token tidak ditemukan atau sudah digunakan");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
      },
    });

    return user;
  }

  // Change password
  async changePassword(email: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error("User tidak ditemukan.");
    }

    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) {
      throw new Error("Password baru tidak boleh sama dengan password lama.");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    return user;
  }

  // Request reset password
  async requestResetPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error("Email tidak ditemukan.");
    }

    const { token, expiresAt } = generateResetPasswordToken();

    await prisma.user.update({
      where: { email },
      data: {
        resetPasswordToken: token,
        resetPasswordTokenExpiry: expiresAt,
      },
    });

    await sendResetPasswordEmail(email, token);
    return { token };
  }

  // Reset password
  async resetPassword(token: string, newPassword: string) {
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      throw new Error("Token tidak valid atau sudah kadaluarsa");
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      throw new Error("Password baru tidak boleh sama dengan password lama");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordTokenExpiry: null,
      },
    });

    return user;
  }

  // Get all users
  async getAllUsers() {
    return await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        lastVisited: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  // Get user by ID
  async getUserById(id: number) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        lastVisited: true,
        createdAt: true,
        isVerified: true,
      },
    });

    if (!user) {
      throw new Error("User tidak ditemukan");
    }

    return user;
  }

  // Update user
  async updateUser(id: number, data: UpdateUserData) {
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new Error("User tidak ditemukan");
    }

    if (data.email && data.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (emailExists) {
        throw new Error("Email sudah digunakan");
      }
    }

    const updateData: any = {};

    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    if (data.role) updateData.role = data.role;
    if (data.isVerified !== undefined) updateData.isVerified = data.isVerified;

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    updateData.updatedAt = new Date();

    return await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        lastVisited: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // Delete user
  async deleteUser(id: number, currentUserId?: number) {
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: {
        pksFiles: true,
      },
    });

    if (!existingUser) {
      throw new Error("User tidak ditemukan");
    }

    if (currentUserId === id) {
      throw new Error("Tidak dapat menghapus akun sendiri");
    }

    await prisma.user.delete({
      where: { id },
    });

    return existingUser;
  }
}

export const userService = new UserService(); 