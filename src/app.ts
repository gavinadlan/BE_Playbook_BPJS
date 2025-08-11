import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import userRoutes from "./routes/user.routes";
import adminRoutes from "./routes/admin.routes";
import pksRoutes from "./routes/pks.routes";
import cookieParser from "cookie-parser";
import { createProxyMiddleware } from "http-proxy-middleware";

dotenv.config();
console.log("JWT Secret:", process.env.JWT_SECRET);
console.log("DB URL:", process.env.DATABASE_URL);

const app = express();

// Middleware CORS untuk API routes
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

// Handle preflight requests
app.options("*", cors());

// Body parser
app.use(express.json());
app.use(cookieParser());

// Static files dengan header khusus untuk PDF
app.use("/uploads", (req, res, next) => {
  const ext = path.extname(req.path).toLowerCase();
  
  // Set Content-Type yang tepat
  if (ext === '.pdf') {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
  } else if (ext === '.docx') {
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'inline');
  } else if (ext === '.doc') {
    res.setHeader('Content-Type', 'application/msword');
    res.setHeader('Content-Disposition', 'inline');
  }
  
  // CORS headers untuk static files
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  
  next();
});

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/pks", pksRoutes);
app.use("/api/admin", adminRoutes);

// Proxy untuk semua BPJS services
app.use(
  "/api/bpjs",
  createProxyMiddleware({
    target: "https://apijkn-dev.bpjs-kesehatan.go.id",
    changeOrigin: true,
    pathRewrite: (path, req) => {
      // Hilangkan '/api/bpjs' di depan, biarkan sisanya sama persis
      return path.replace(/^\/api\/bpjs/, "");
    },
    secure: false,
  })
);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err);
  res.status(500).json({ message: "Terjadi kesalahan server" });
});

// Handle 404
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Endpoint tidak ditemukan" });
});

export default app; 