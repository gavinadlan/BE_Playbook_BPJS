# 🚀 Developer Guide - BPJS Kesehatan API Documentation

> Panduan lengkap untuk tim developer dalam mengembangkan dan memaintain project dokumentasi API BPJS Kesehatan

---

## 📋 Daftar Isi

1. [Setup Development Environment](#setup-development-environment)
2. [Struktur Project & Arsitektur](#struktur-project--arsitektur)
3. [Cara Menambah API Service Baru](#cara-menambah-api-service-baru)
4. [Pengembangan Fitur Backend](#pengembangan-fitur-backend)
5. [Pengembangan Fitur Frontend](#pengembangan-fitur-frontend)
6. [Database & Prisma](#database--prisma)
7. [Testing & Quality Assurance](#testing--quality-assurance)
8. [Deployment & Production](#deployment--production)
9. [Troubleshooting](#troubleshooting)
10. [Best Practices & Coding Standards](#best-practices--coding-standards)

---

## 🛠️ Setup Development Environment

### Prerequisites
- Node.js v18+ 
- PostgreSQL v13+
- Git
- Code editor (VS Code recommended)

### Initial Setup
```bash
# Clone repository
git clone <repository-url>
cd BPJS_Kesehatan

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Setup environment variables
cp backend/.env.example backend/.env
# Edit .env sesuai konfigurasi database

# Setup database
cd backend
npx prisma migrate deploy
npx prisma generate

# Run development servers
npm run dev  # Backend on port 3001
cd ../frontend
npm run dev  # Frontend on port 3000
```

---

## 🏗️ Struktur Project & Arsitektur

### Backend Architecture
```
backend/src/
├── controllers/     # HTTP request handlers
├── services/        # Business logic layer
├── routes/          # API endpoint definitions
├── middlewares/     # Request processing middleware
├── utils/           # Helper functions
├── types/           # TypeScript type definitions
└── app.ts           # Express app configuration
```

### Frontend Architecture
```
frontend/src/
├── app/             # Next.js App Router pages
├── components/      # Reusable UI components
├── hooks/           # Custom React hooks
├── context/         # React Context providers
├── lib/             # Utility libraries
├── types/           # TypeScript types
└── utils/           # Helper functions
```

---

## 🔧 Cara Menambah API Service Baru

### 1. Buat File YAML Service Baru

Buat file YAML baru di folder kategori yang sesuai:

```bash
# Contoh: Menambah service baru "Telemedicine"
mkdir -p frontend/public/api-docs/services/telemedicine
touch frontend/public/api-docs/services/telemedicine/telemedicine.yaml
```

### 2. Struktur File YAML Service

```yaml
# frontend/public/api-docs/services/telemedicine/telemedicine.yaml
openapi: 3.0.0
info:
  title: Telemedicine API
  version: 1.0.0
  description: API untuk layanan telemedicine BPJS Kesehatan

servers:
  - url: https://api.bpjs-kesehatan.go.id/telemedicine
    description: Production server

tags:
  - name: Konsultasi
    description: Endpoint untuk konsultasi dokter online
  - name: JanjiTemu
    description: Endpoint untuk booking janji temu virtual

paths:
  /konsultasi:
    get:
      tags:
        - Konsultasi
      summary: Daftar konsultasi tersedia
      description: Mendapatkan daftar dokter yang tersedia untuk konsultasi
      parameters:
        - name: poli
          in: query
          description: Kode poli spesialisasi
          required: false
          schema:
            type: string
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Dokter'

components:
  schemas:
    Dokter:
      type: object
      properties:
        id:
          type: string
        nama:
          type: string
        spesialisasi:
          type: string
        rating:
          type: number
```

### 3. Buat File Merged

Setelah membuat file YAML service, buat file merged menggunakan swagger-cli:

```bash
# Install swagger-cli jika belum
npm install -g swagger-cli

# Bundle YAML files menjadi merged
npx swagger-cli bundle frontend/public/api-docs/services/telemedicine/telemedicine.yaml \
  --outfile frontend/public/api-docs/services/telemedicine/merged.yaml \
  --type yaml
```

### 4. Update API Order di Frontend

Tambahkan service baru ke daftar API di `frontend/src/app/fitur-api/page.tsx`:

```typescript
const API_ORDER = [
  { label: "Aplicares", file: "aplicares.yaml" },
  { label: "VClaim", file: "vclaim/merged.yaml" },
  { label: "AntreanRS", file: "antreanrs/merged.yaml" },
  { label: "Apotek", file: "apotek/merged.yaml" },
  { label: "PCare", file: "pcare/merged.yaml" },
  { label: "AntreanFKTP", file: "antreanfktp/merged.yaml" },
  { label: "Care", file: "icare/merged.yaml" },
  { label: "RekamMedis", file: "rekammedis/merged.yaml" },
  // Tambahkan service baru
  { label: "Telemedicine", file: "telemedicine/merged.yaml" },
];
```

### 5. Update Test API Page

Tambahkan service baru ke daftar service di `frontend/src/app/test-api/page.tsx`:

```typescript
// Di dalam component atau hook yang mengelola service selection
const services = [
  { value: "aplicares", label: "Aplicares" },
  { value: "vclaim", label: "VClaim" },
  { value: "antreanrs", label: "AntreanRS" },
  { value: "apotek", label: "Apotek" },
  { value: "pcare", label: "PCare" },
  { value: "antreanfktp", label: "AntreanFKTP" },
  { value: "icare", label: "iCare" },
  { value: "rekammedis", label: "RekamMedis" },
  // Tambahkan service baru
  { value: "telemedicine", label: "Telemedicine" },
];
```

---

## 🖥️ Pengembangan Fitur Backend

### **Contoh: Menambah Fitur Realtime Chat Support**

> **Note**: Ini hanya contoh implementasi untuk fitur chat support yang bisa dikembangkan ke depan. Sesuaikan dengan kebutuhan project yang sebenarnya.

#### **1. Buat Controller**
```typescript
// backend/src/controllers/chat.controller.ts
import { Request, Response } from 'express';
import { ResponseUtil } from '../utils/response.util';
import { ChatService } from '../services/chat.service';

export class ChatController {
  static async getChatHistory(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const chatHistory = await ChatService.getChatHistory(parseInt(userId));
      return ResponseUtil.success(res, 'Chat history retrieved', chatHistory);
    } catch (error) {
      return ResponseUtil.error(res, 'Failed to get chat history', error);
    }
  }

  static async sendMessage(req: Request, res: Response) {
    try {
      const { userId, message, type } = req.body;
      const savedMessage = await ChatService.saveMessage({
        userId: parseInt(userId),
        message,
        type: type || 'USER' // USER, SUPPORT, SYSTEM
      });
      
      // Emit realtime event ke user yang bersangkutan
      req.app.get('io').to(`user:${userId}`).emit('new_message', savedMessage);
      
      return ResponseUtil.success(res, 'Message sent', savedMessage);
    } catch (error) {
      return ResponseUtil.error(res, 'Failed to send message', error);
    }
  }

  static async markAsRead(req: Request, res: Response) {
    try {
      const { messageId } = req.params;
      const updatedMessage = await ChatService.markAsRead(messageId);
      return ResponseUtil.success(res, 'Message marked as read', updatedMessage);
    } catch (error) {
      return ResponseUtil.error(res, 'Failed to mark message as read', error);
    }
  }
}
```

#### **2. Buat Service**
```typescript
// backend/src/services/chat.service.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ChatService {
  static async getChatHistory(userId: number, limit: number = 50) {
    return await prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
  }

  static async saveMessage(data: CreateChatMessageDto) {
    return await prisma.chatMessage.create({
      data: {
        ...data,
        createdAt: new Date(),
        isRead: false
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
  }

  static async markAsRead(messageId: string) {
    return await prisma.chatMessage.update({
      where: { id: messageId },
      data: { isRead: true, readAt: new Date() }
    });
  }

  static async getUnreadCount(userId: number) {
    return await prisma.chatMessage.count({
      where: { 
        userId, 
        isRead: false,
        type: 'SUPPORT' // Hanya hitung pesan dari support
      }
    });
  }
}
```

#### **3. Buat Route**
```typescript
// backend/src/routes/chat.routes.ts
import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';
import { isAuthenticated } from '../middlewares/auth';
import { validateInput } from '../middlewares/validateInput';
import { chatSchemas } from '../middlewares/validateInput';

const router = Router();

router.get('/history/:userId', 
  isAuthenticated, 
  validateInput(chatSchemas.getChatHistory), 
  ChatController.getChatHistory
);

router.post('/send', 
  isAuthenticated, 
  validateInput(chatSchemas.sendMessage), 
  ChatController.sendMessage
);

router.put('/read/:messageId', 
  isAuthenticated, 
  ChatController.markAsRead
);

router.get('/unread/:userId', 
  isAuthenticated, 
  ChatController.getUnreadCount
);

export default router;
```

#### **4. Update Socket.io untuk Realtime Chat**
```typescript
// backend/src/server.ts
io.on('connection', (socket) => {
  // User join chat room
  socket.on('join_chat', (userId) => {
    socket.join(`user:${userId}`);
    console.log(`User ${userId} joined chat room`);
  });

  // Handle typing indicator
  socket.on('typing', (data) => {
    socket.to(`user:${data.userId}`).emit('user_typing', {
      userId: data.userId,
      isTyping: true
    });
  });

  // Handle stop typing
  socket.on('stop_typing', (data) => {
    socket.to(`user:${data.userId}`).emit('user_typing', {
      userId: data.userId,
      isTyping: false
    });
  });

  // Handle online status
  socket.on('set_online', (userId) => {
    socket.to(`user:${userId}`).emit('user_status', {
      userId,
      status: 'online'
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected from chat');
  });
});
```

#### **5. Register Route di app.ts**
```typescript
// backend/src/app.ts
import chatRoutes from './routes/chat.routes';

// ... existing code ...

// Register chat routes
app.use('/api/chat', chatRoutes);

// Make io available to routes
app.set('io', io);
```

### 2. Menambah Middleware Baru

```typescript
// backend/src/middlewares/customAuth.ts
import { Request, Response, NextFunction } from 'express';
import { ResponseUtil } from '../utils/response.util';

// Contoh middleware custom untuk role-based access
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      return ResponseUtil.forbidden(res, 'Access denied: Insufficient permissions');
    }
    
    next();
  };
};

// Contoh middleware untuk logging custom
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};
```

### 3. Cara Menggunakan Zod Validation di Project Ini

#### **Setup Zod Validation**
```typescript
// backend/src/middlewares/validateInput.ts
import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { ResponseUtil } from '../utils/response.util';

// Generic validation function
export const validateInput = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body, query, atau params
      const validatedData = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });
      
      // Attach validated data to request
      req.validatedData = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(err => 
          `${err.path.join('.')}: ${err.message}`
        );
        return ResponseUtil.badRequest(res, errorMessages.join(', '));
      }
      return ResponseUtil.internalError(res, 'Validation error');
    }
  };
};

// Contoh schema untuk berbagai endpoint
export const userSchemas = {
  createUser: z.object({
    body: z.object({
      name: z.string().min(2).max(100),
      email: z.string().email(),
      password: z.string().min(6)
    })
  }),
  
  updateUser: z.object({
    params: z.object({
      id: z.string().transform(val => parseInt(val))
    }),
    body: z.object({
      name: z.string().min(2).max(100).optional(),
      email: z.string().email().optional()
    })
  })
};
```

#### **Penggunaan di Route**
```typescript
// backend/src/routes/user.routes.ts
import { validateInput } from '../middlewares/validateInput';
import { userSchemas } from '../middlewares/validateInput';

router.post('/users', 
  validateInput(userSchemas.createUser), 
  UserController.createUser
);

router.put('/users/:id', 
  validateInput(userSchemas.updateUser), 
  UserController.updateUser
);
```

#### **Access Validated Data di Controller**
```typescript
// backend/src/controllers/user.controller.ts
export class UserController {
  static async createUser(req: Request, res: Response) {
    try {
      // Data sudah tervalidasi dan tersedia di req.validatedData
      const { name, email, password } = req.validatedData.body;
      
      const user = await UserService.createUser({ name, email, password });
      return ResponseUtil.success(res, 'User created successfully', user);
    } catch (error) {
      return ResponseUtil.error(res, 'Failed to create user', error);
    }
  }
}
```

### 3. Menambah Validation Schema dengan Zod

```typescript
// backend/src/middlewares/validateInput.ts
import { z } from 'zod';

export const telemedicineSchemas = {
  getDokterList: z.object({
    poli: z.string().optional(),
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(10)
  })
};

// Contoh schema untuk chat support
export const chatSchemas = {
  sendMessage: z.object({
    userId: z.number().int().positive(),
    message: z.string().min(1).max(1000),
    type: z.enum(['USER', 'SUPPORT', 'SYSTEM']).default('USER')
  }),
  
  getChatHistory: z.object({
    userId: z.string().transform(val => parseInt(val)),
    limit: z.number().min(1).max(100).default(50).optional()
  })
};
```

---

## 🎨 Pengembangan Fitur Frontend

### **Contoh: Menambah Fitur Chat Support Interface**

> **Note**: Ini hanya contoh implementasi untuk fitur chat support yang bisa dikembangkan ke depan. Sesuaikan dengan kebutuhan project yang sebenarnya.

#### **1. Buat Page Component**
```typescript
// frontend/src/app/chat-support/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';
import { ChatMessage, ChatInput, ChatHeader } from '@/components/chat';

export default function ChatSupportPage() {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchChatHistory();
      fetchUnreadCount();
      
      // Join chat room
      socket?.emit('join_chat', user.id);
    }
  }, [user, socket]);

  useEffect(() => {
    if (!socket) return;

    // Listen for new messages
    socket.on('new_message', (message: ChatMessage) => {
      setMessages(prev => [message, ...prev]);
      if (message.type === 'SUPPORT') {
        setUnreadCount(prev => prev + 1);
      }
    });

    // Listen for typing indicators
    socket.on('user_typing', (data) => {
      // Handle typing indicator
    });

    return () => {
      socket.off('new_message');
      socket.off('user_typing');
    };
  }, [socket]);

  const fetchChatHistory = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/chat/history/${user.id}`);
      const data = await response.json();
      setMessages(data.data || []);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/chat/unread/${user.id}`);
      const data = await response.json();
      setUnreadCount(data.data || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Chat Support</h1>
        {unreadCount > 0 && (
          <Badge variant="destructive" className="text-sm">
            {unreadCount} pesan baru
          </Badge>
        )}
      </div>
      
      <Card className="h-[600px] flex flex-col">
        <ChatHeader 
          isOnline={isConnected}
          supportName="BPJS Support Team"
        />
        
        <CardContent className="flex-1 p-0">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <ChatMessage 
              messages={messages}
              currentUserId={user?.id}
              onMarkAsRead={handleMarkAsRead}
            />
          )}
        </CardContent>
        
        <ChatInput 
          onSendMessage={handleSendMessage}
          disabled={!isConnected}
        />
      </Card>
    </div>
  );
}

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Telemedicine</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dokterList.map((dokter: any) => (
          <Card key={dokter.id}>
            <CardHeader>
              <CardTitle>{dokter.nama}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{dokter.spesialisasi}</p>
              <p className="text-sm text-gray-500">Rating: {dokter.rating}/5</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

#### **2. Update Navigation (Jika Diperlukan)**
```typescript
// frontend/src/components/Header.tsx
const navigation = [
  { name: 'Beranda', href: '/' },
  { name: 'Fitur API', href: '/fitur-api' },
  { name: 'Test API', href: '/test-api' },
  { name: 'Panduan', href: '/panduan' },
  { name: 'FAQ', href: '/faq' },
  // Tambahkan menu baru sesuai fitur yang dikembangkan
  // { name: 'Fitur Baru', href: '/fitur-baru' },
];
```

### **2. Menambah Component Baru**

```typescript
// frontend/src/components/shared/DataCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface DataCardProps {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}

export function DataCard({ title, description, actionLabel, onAction }: DataCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <p className="text-sm text-gray-600">{description}</p>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={onAction}
          className="w-full"
        >
          {actionLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
```

### **3. Menambah Custom Hook**

```typescript
// frontend/src/hooks/useData.ts
import { useState, useEffect, useCallback } from 'react';

interface DataItem {
  id: string;
  title: string;
  description: string;
}

export function useData() {
  const [dataList, setDataList] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (endpoint: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/${endpoint}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${endpoint}`);
      }
      
      const data = await response.json();
      setDataList(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const createItem = async (endpoint: string, itemData: Partial<DataItem>) => {
    try {
      const response = await fetch(`/api/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create ${endpoint}`);
      }
      
      return await response.json();
    } catch (err) {
      throw err;
    }
  };

  return {
    dataList,
    loading,
    error,
    fetchData,
    createItem
  };
}
```

  return {
    dokterList,
    loading,
    error,
    fetchDokterList,
    bookKonsultasi,
  };
}
```

---

## 🗄️ Database & Prisma

### **Contoh: Menambah Model untuk Fitur Chat Support**

> **Note**: Ini hanya contoh implementasi untuk fitur chat support yang bisa dikembangkan ke depan. Sesuaikan dengan kebutuhan project yang sebenarnya.

#### **1. Update Schema Prisma**
```prisma
// backend/prisma/schema.prisma

// Model untuk menyimpan pesan chat
model ChatMessage {
  id          String        @id @default(cuid())
  userId      Int           // ID user yang mengirim/menerima pesan
  message     String        // Isi pesan
  type        MessageType   // Tipe pesan (USER, SUPPORT, SYSTEM)
  isRead      Boolean       @default(false) // Status dibaca
  readAt      DateTime?     // Waktu dibaca
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  
  // Relations
  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Indexes untuk performa query
  @@index([userId, createdAt])
  @@index([userId, isRead])
}

// Model untuk menyimpan session chat
model ChatSession {
  id          String        @id @default(cuid())
  userId      Int           // ID user
  supportId   Int?          // ID support staff (opsional)
  status      SessionStatus @default(ACTIVE)
  startedAt   DateTime      @default(now())
  endedAt     DateTime?
  rating      Int?          // Rating session (1-5)
  feedback    String?       // Feedback dari user
  
  // Relations
  user        User          @relation(fields: [userId], references: [id])
  support     User?         @relation("SupportSessions", fields: [supportId], references: [id])
  messages    ChatMessage[]
  
  @@index([userId, status])
  @@index([supportId, status])
}

// Model untuk support staff
model SupportStaff {
  id          String        @id @default(cuid())
  userId      Int           // ID user yang menjadi support
  department  String        // Departemen support (e.g., "Technical", "Billing")
  isAvailable Boolean       @default(true) // Status available
  maxChats    Int           @default(5) // Maksimal chat yang bisa dihandle
  currentChats Int          @default(0) // Jumlah chat aktif
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  
  // Relations
  user        User          @relation(fields: [userId], references: [id])
  sessions    ChatSession[] @relation("SupportSessions")
  
  @@unique([userId])
  @@index([department, isAvailable])
}

// Enums
enum MessageType {
  USER        // Pesan dari user
  SUPPORT     // Pesan dari support staff
  SYSTEM      // Pesan sistem (notifikasi, dll)
}

enum SessionStatus {
  ACTIVE      // Session sedang berlangsung
  WAITING     // Menunggu response support
  RESOLVED    // Masalah sudah diselesaikan
  CLOSED      // Session ditutup
}

// Update model User yang sudah ada
model User {
  id                        Int       @id @default(autoincrement())
  name                      String
  email                     String    @unique
  password                  String
  role                      Role      @default(USER) 
  isVerified                Boolean   @default(false)
  verificationToken         String?   @unique
  resetPasswordToken        String?   @unique
  resetPasswordTokenExpiry  DateTime?
  createdAt                 DateTime  @default(now())
  updatedAt                 DateTime  @updatedAt
  lastVisited               DateTime? 
  pksFiles                  Pks[]
  
  // Tambahan untuk fitur chat
  chatMessages              ChatMessage[]
  chatSessions             ChatSession[]
  supportSessions          ChatSession[] @relation("SupportSessions")
  supportStaff             SupportStaff?
}

#### **2. Generate Migration**
```bash
cd backend
npx prisma migrate dev --name add_chat_support_models
npx prisma generate
```

#### **3. Seed Data untuk Chat Support (Optional)**
```typescript
// backend/prisma/seed-chat.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed support staff data
  const supportStaff = await prisma.supportStaff.createMany({
    data: [
      {
        userId: 1, // Pastikan user dengan ID 1 sudah ada
        department: 'Technical Support',
        isAvailable: true,
        maxChats: 5,
        currentChats: 0,
      },
      {
        userId: 2, // Pastikan user dengan ID 2 sudah ada
        department: 'Billing Support',
        isAvailable: true,
        maxChats: 3,
        currentChats: 0,
      },
    ],
  });

  // Seed sample chat messages
  const sampleMessage = await prisma.chatMessage.create({
    data: {
      userId: 1,
      message: 'Selamat datang di BPJS Kesehatan Support! Ada yang bisa kami bantu?',
      type: 'SYSTEM',
      isRead: false,
    },
  });

  console.log('Seeded chat support data:', { supportStaff, sampleMessage });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### **2. Database Queries untuk Chat Support**

```typescript
// Query untuk mendapatkan chat history dengan pagination
const chatHistory = await prisma.chatMessage.findMany({
  where: { 
    userId: parseInt(userId),
    createdAt: {
      gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 hari terakhir
    }
  },
  orderBy: { createdAt: 'desc' },
  take: 50,
  include: {
    user: {
      select: {
        id: true,
        name: true,
        email: true
      }
    }
  }
});

// Query untuk mendapatkan support staff yang available
const availableSupport = await prisma.supportStaff.findMany({
  where: {
    isAvailable: true,
    currentChats: {
      lt: prisma.supportStaff.fields.maxChats
    }
  },
  include: {
    user: {
      select: {
        id: true,
        name: true,
        email: true
      }
    }
  },
  orderBy: {
    currentChats: 'asc' // Prioritaskan yang paling sedikit chat
  }
});

// Query untuk mendapatkan unread message count per user
const unreadCounts = await prisma.chatMessage.groupBy({
  by: ['userId'],
  where: {
    isRead: false,
    type: 'SUPPORT'
  },
  _count: {
    id: true
  }
});

// Query untuk mendapatkan chat session dengan messages
const chatSession = await prisma.chatSession.findFirst({
  where: {
    userId: parseInt(userId),
    status: 'ACTIVE'
  },
  include: {
    messages: {
      orderBy: { createdAt: 'asc' },
      take: 100
    },
    support: {
      select: {
        id: true,
        name: true,
        department: true
      }
    }
  }
});
```

---

## 🧪 Testing & Quality Assurance

### 1. Backend Testing

#### Unit Testing dengan Jest
```typescript
// backend/src/__tests__/telemedicine.service.test.ts
import { TelemedicineService } from '../services/telemedicine.service';
import { PrismaClient } from '@prisma/client';

// Mock Prisma
jest.mock('@prisma/client');

describe('TelemedicineService', () => {
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;
  });

  describe('getDokterList', () => {
    it('should return dokter list without filter', async () => {
      const mockDokter = [
        { id: '1', nama: 'Dr. Test', spesialisasi: 'Test', rating: 4.5 }
      ];

      mockPrisma.dokter.findMany.mockResolvedValue(mockDokter);

      const result = await TelemedicineService.getDokterList();
      
      expect(result).toEqual(mockDokter);
      expect(mockPrisma.dokter.findMany).toHaveBeenCalledWith({
        where: {},
        select: expect.any(Object),
      });
    });
  });
});
```

#### Integration Testing
```typescript
// backend/src/__tests__/telemedicine.integration.test.ts
import request from 'supertest';
import app from '../app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Telemedicine API', () => {
  beforeAll(async () => {
    // Setup test database
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /api/telemedicine/dokter', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/telemedicine/dokter')
        .expect(401);
    });

    it('should return dokter list with valid token', async () => {
      // Create test user and get token
      const token = 'valid-jwt-token';
      
      const response = await request(app)
        .get('/api/telemedicine/dokter')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data).toBeDefined();
    });
  });
});
```

### 2. Frontend Testing

#### Component Testing dengan React Testing Library
```typescript
// frontend/src/components/__tests__/DataCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { DataCard } from '../shared/DataCard';

const mockProps = {
  title: 'Test Title',
  description: 'Test Description',
  actionLabel: 'Test Action',
  onAction: jest.fn(),
};

describe('DataCard', () => {
  it('renders card information correctly', () => {
    render(<DataCard {...mockProps} />);
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Test Action')).toBeInTheDocument();
  });

  it('calls onAction when action button is clicked', () => {
    render(<DataCard {...mockProps} />);
    
    const actionButton = screen.getByText('Test Action');
    fireEvent.click(actionButton);
    
    expect(mockProps.onAction).toHaveBeenCalled();
  });
});
```

### 3. E2E Testing dengan Cypress

```typescript
// frontend/cypress/e2e/telemedicine.cy.ts
describe('Telemedicine Page', () => {
  beforeEach(() => {
    // Login user
    cy.login('user@example.com', 'password');
  });

  it('should display dokter list', () => {
    cy.visit('/telemedicine');
    
    cy.get('[data-testid="dokter-card"]').should('have.length.greaterThan', 0);
    cy.get('[data-testid="dokter-nama"]').should('be.visible');
  });

  it('should filter dokter by spesialisasi', () => {
    cy.visit('/telemedicine');
    
    cy.get('[data-testid="filter-poli"]').select('Kardiologi');
    cy.get('[data-testid="dokter-card"]').should('contain', 'Kardiologi');
  });
});
```

---

## 🚀 Deployment & Production

### 1. Environment Variables Production

```bash
# backend/.env.production
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@prod-db:5432/bpjs_kesehatan
JWT_SECRET=your-super-secure-jwt-secret
BASE_URL=https://api.yourdomain.com
PORT=3001
CORS_ORIGIN=https://yourdomain.com

# Email configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 2. Docker Configuration

```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@db:5432/bpjs_kesehatan
    depends_on:
      - db
    volumes:
      - ./uploads:/app/uploads

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=https://api.yourdomain.com

  db:
    image: postgres:13
    environment:
      - POSTGRES_DB=bpjs_kesehatan
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### 3. PM2 Configuration

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'bpjs-backend',
      script: 'dist/server.js',
      cwd: './backend',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
    },
  ],
};
```

---

## 🔧 Troubleshooting

### Common Issues & Solutions

#### 1. Database Connection Issues
```bash
# Error: Connection refused
# Solution: Check PostgreSQL service status
sudo systemctl status postgresql
sudo systemctl start postgresql

# Error: Authentication failed
# Solution: Check pg_hba.conf and user permissions
sudo -u postgres psql
\du  # List users and roles
```

#### 2. Prisma Migration Issues
```bash
# Error: Migration lock
# Solution: Reset migration state
npx prisma migrate reset

# Error: Schema drift
# Solution: Reset and regenerate
npx prisma db push --force-reset
npx prisma generate
```

#### 3. Frontend Build Issues
```bash
# Error: TypeScript compilation
# Solution: Check types and rebuild
npm run build
npm run type-check

# Error: CSS modules
# Solution: Clear cache and reinstall
rm -rf .next node_modules
npm install
```

#### 4. API Endpoint Issues
```bash
# Error: CORS issues
# Solution: Check CORS configuration in backend
# Verify origin in app.ts

# Error: JWT validation
# Solution: Check JWT_SECRET and token format
# Verify middleware order in routes
```

---

## 📚 Best Practices & Coding Standards

### 1. Code Organization

#### Backend Structure
```typescript
// Controller: Handle HTTP requests only
export class UserController {
  static async createUser(req: Request, res: Response) {
    try {
      const userData = req.body;
      const user = await UserService.createUser(userData);
      return ResponseUtil.success(res, 'User created', user);
    } catch (error) {
      return ResponseUtil.error(res, 'Failed to create user', error);
    }
  }
}

// Service: Business logic
export class UserService {
  static async createUser(userData: CreateUserDto) {
    // Validate input
    const validatedData = await UserValidation.validate(userData);
    
    // Check business rules
    await this.checkUserExists(validatedData.email);
    
    // Create user
    const user = await prisma.user.create({
      data: validatedData,
    });
    
    return user;
  }
}
```

#### Frontend Structure
```typescript
// Page component: Layout and data fetching
export default function UserPage() {
  const { users, loading, error, fetchUsers } = useUsers();
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div>
      <UserList users={users} />
    </div>
  );
}

// Custom hook: Business logic
export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get('/users');
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  return { users, loading, fetchUsers };
}
```

### 2. Error Handling

#### Backend Error Handling
```typescript
// Global error handler
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', error);
  
  if (error instanceof ValidationError) {
    return ResponseUtil.badRequest(res, 'Validation failed', error.details);
  }
  
  if (error instanceof AuthenticationError) {
    return ResponseUtil.unauthorized(res, 'Authentication failed');
  }
  
  return ResponseUtil.internalError(res, 'Internal server error');
});

// Service error handling
export class UserService {
  static async createUser(userData: CreateUserDto) {
    try {
      // Business logic
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictError('User already exists');
        }
      }
      throw error;
    }
  }
}
```

#### Frontend Error Handling
```typescript
// Error boundary component
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to error reporting service
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    
    return this.props.children;
  }
}

// API error handling
export const api = {
  async get(url: string) {
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new ApiError(response.status, response.statusText);
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Network error');
    }
  }
};
```

### 3. Performance Optimization

#### Backend Optimization
```typescript
// Database query optimization
export class UserService {
  static async getUsersWithPosts() {
    return await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        posts: {
          select: {
            id: true,
            title: true,
            createdAt: true,
          },
          take: 5, // Limit posts per user
        },
      },
      take: 20, // Limit users
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}

// Caching dengan in-memory (sederhana)
const cache = new Map<string, { data: any; expiry: number }>();

export class CacheService {
  static async get(key: string) {
    const cached = cache.get(key);
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }
    cache.delete(key);
    return null;
  }
  
  static async set(key: string, value: any, ttl: number = 3600) {
    cache.set(key, {
      data: value,
      expiry: Date.now() + (ttl * 1000)
    });
  }
}
```

#### Frontend Optimization
```typescript
// React.memo for expensive components
export const ExpensiveComponent = React.memo(({ data }) => {
  return (
    <div>
      {data.map(item => (
        <ExpensiveItem key={item.id} item={item} />
      ))}
    </div>
  );
});

// useMemo for expensive calculations
export function UserDashboard({ users }) {
  const expensiveStats = useMemo(() => {
    return calculateUserStats(users);
  }, [users]);
  
  return <StatsDisplay stats={expensiveStats} />;
}

// Lazy loading components
const LazyComponent = lazy(() => import('./LazyComponent'));

export function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <LazyComponent />
    </Suspense>
  );
}
```

---

## 📖 Additional Resources

### Documentation Links
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Documentation](https://expressjs.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Documentation](https://react.dev/)

### Development Tools
- **VS Code** - Code editor utama dengan extensions yang berguna
- **Postman** - API testing dan development
  - **Setup Collection**: Import API endpoints dari Swagger/OpenAPI
  - **Environment Variables**: 
    - `baseUrl`: `http://localhost:3001`
    - `token`: JWT token untuk authentication
  - **Testing Scripts**: Auto-test response status dan data
  - **Collection Runner**: Batch testing multiple endpoints
- **Prisma Studio** - Database management dan exploration
  - Jalankan dengan: `npx prisma studio`
  - Buka browser di: `http://localhost:5555`
  - Berguna untuk: View data, edit records, test queries
- **Git** - Version control system
  - **Branch Strategy**: 
    - `main` - Production code
    - `develop` - Development branch
    - `feature/feature-name` - Feature branches
  - **Commit Convention**: 
    - `feat:` - New feature
    - `fix:` - Bug fix
    - `docs:` - Documentation update
    - `refactor:` - Code refactoring
  - **Pull Request**: Code review sebelum merge ke develop

### **VS Code Extensions yang Direkomendasikan:**
- **Prisma** - Syntax highlighting dan autocomplete untuk Prisma schema
- **ES7+ React/Redux/React-Native snippets** - Snippets untuk React/Next.js
- **Tailwind CSS IntelliSense** - Autocomplete untuk Tailwind CSS
- **TypeScript Importer** - Auto-import untuk TypeScript
- **Auto Rename Tag** - Auto rename HTML/JSX tags
- **Bracket Pair Colorizer** - Warna untuk bracket pairs
- **GitLens** - Enhanced Git integration
- **Prettier** - Code formatter
- **ESLint** - JavaScript/TypeScript linting

### Monitoring & Logging
> **Note**: Project ini menggunakan logging sederhana yang sudah cukup untuk development

- **Console.log** - Basic logging untuk debugging (sudah digunakan)
- **Express error handling** - Error logging otomatis
- **Prisma logging** - Database query logging (bisa diaktifkan di schema.prisma)

### **Yang Sudah Ada di Project:**
- **Console.log** untuk debugging dan development
- **Express error handling** untuk error logging otomatis
- **Prisma logging** untuk database queries (opsional)
- **Custom error responses** menggunakan ResponseUtil
- **Socket.io logging** untuk realtime connections
- **File upload logging** untuk tracking uploads

### **Tools yang Digunakan di Project Ini:**
- **Express.js** - Web framework dengan built-in error handling
- **Prisma** - ORM dengan query logging
- **Socket.io** - Realtime communication dengan connection logging
- **Multer** - File upload dengan progress tracking
- **JWT** - Authentication dengan token validation
- **bcryptjs** - Password hashing
- **Nodemailer** - Email service untuk notifications
- **Zod** - Schema validation dan type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Next.js** - React framework dengan App Router
- **TypeScript** - Type-safe JavaScript

### **Untuk Production (Opsional):**
Jika nanti project di-deploy ke production, bisa pertimbangkan:
- **Structured logging** untuk memudahkan monitoring
- **Log rotation** untuk menghemat storage
- **Security headers** untuk keamanan tambahan
- **Rate limiting** untuk mencegah abuse

Tapi untuk development dan testing, yang ada sekarang sudah cukup!

---

> **Note**: Dokumentasi ini akan terus diupdate sesuai dengan perkembangan project. Pastikan untuk selalu mengikuti best practices terbaru dan melakukan code review secara berkala.

---

## ⚠️ **PENTING: Tentang Contoh Implementasi**

### **Disclaimer**
Semua contoh implementasi dalam developer guide ini (termasuk fitur Chat Support) **HANYA BERUPA CONTOH** untuk memberikan gambaran bagaimana cara mengembangkan fitur baru. 

### **Yang Perlu Diperhatikan:**
1. **Bukan Fitur Aktual**: Fitur Chat Support yang dicontohkan bukan fitur yang sudah ada atau akan diimplementasikan secara otomatis
2. **Referensi Saja**: Gunakan sebagai referensi untuk memahami pola pengembangan yang konsisten
3. **Sesuaikan Kebutuhan**: Setiap fitur baru harus disesuaikan dengan kebutuhan bisnis yang sebenarnya
4. **Approval Required**: Implementasi fitur baru memerlukan approval dan planning yang matang
5. **Contoh Generik**: Semua contoh dibuat generik agar bisa diaplikasikan ke berbagai jenis fitur 

### **Yang Perlu Diperhatikan:**
1. **Bukan Fitur Aktual**: Fitur Chat Support yang dicontohkan bukan fitur yang sudah ada atau akan diimplementasikan secara otomatis
2. **Referensi Saja**: Gunakan sebagai referensi untuk memahami pola pengembangan yang konsisten
3. **Sesuaikan Kebutuhan**: Setiap fitur baru harus disesuaikan dengan kebutuhan bisnis yang sebenarnya
4. **Approval Required**: Implementasi fitur baru memerlukan approval dan planning yang matang

### **Cara Menggunakan Contoh:**
- **Backend**: Pelajari pola Controller → Service → Route → Middleware
- **Frontend**: Pelajari pola Page → Component → Hook → Context
- **Database**: Pelajari pola Model → Migration → Seed → Query
- **Testing**: Pelajari pola Unit Test → Integration Test → E2E Test

### **Contoh Fitur Lain yang Bisa Dikembangkan:**
- **Notification System**: Email, SMS, Push notification
- **File Management**: Advanced file upload, versioning, sharing
- **Reporting**: Analytics dashboard, export data, charts
- **Integration**: Third-party API integration, webhook
- **Mobile App**: React Native atau Flutter companion app

### **Langkah Selanjutnya:**
1. **Analisis Kebutuhan**: Identifikasi fitur yang benar-benar dibutuhkan
2. **Planning**: Buat roadmap dan timeline pengembangan
3. **Prototyping**: Buat proof of concept sebelum full development
4. **Testing**: Lakukan testing menyeluruh sebelum deployment
5. **Documentation**: Update dokumentasi sesuai fitur yang diimplementasikan

---

> **Kesimpulan**: Developer guide ini memberikan framework dan pola pengembangan yang konsisten. Gunakan sebagai referensi, bukan sebagai blueprint yang harus diikuti secara kaku. Selalu sesuaikan dengan kebutuhan project yang sebenarnya.
