import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import compression from "compression";
import dotenv from "dotenv";
import { xssMiddleware } from "./validation";

// تحميل متغيرات البيئة
dotenv.config();

// Import routes
import entitiesRouter from "./routes/entities";
import accountsRouter from "./routes/accounts";
import cashBoxesRouter from "./routes/cashBoxes";
import banksWalletsRouter from "./routes/banksWallets";
import inventoryRouter from "./routes/inventory";
import warehousesRouter from "./routes/warehouses";
import stockMovementsRouter from "./routes/stockMovements";
import itemCategoriesRouter from "./routes/itemCategories";
import interUnitTransfersRouter from "./routes/interUnitTransfers";
import modelSwitchRouter from "./routes/modelSwitch";
import dashboardRouter from "./routes/dashboard";
import journalEntriesRouter from "./routes/journalEntries";
import paymentsRouter from "./routes/payments";
import geminiCreditsRouter from "./routes/geminiCredits";
import antigravityCreditsRouter from "./routes/antigravityCredits";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

async function startServer() {
  const server = createServer(app);

  // ===== حزم الأمان =====

  // 1. Helmet - ترويسات أمان HTTP
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "blob:"],
          connectSrc: ["'self'", "http://localhost:*", "https://*.alabasi.uk"],
        },
      },
      crossOriginEmbedderPolicy: false,
    })
  );

  // 2. CORS - حماية الطلبات عبر النطاقات
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || "*",
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  );

  // 3. Rate Limiting - تحديد معدل الطلبات
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 دقيقة
    max: parseInt(process.env.RATE_LIMIT_MAX || "1000"), // 1000 طلب لكل نافذة
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "تم تجاوز الحد الأقصى للطلبات. يرجى المحاولة لاحقاً." },
  });
  app.use("/api/", limiter);

  // 4. Morgan - تسجيل الطلبات
  app.use(morgan("combined"));

  // 5. Compression - ضغط الاستجابات
  app.use(compression());

  // ===== Middleware أساسي =====
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));

  // 6. XSS Protection - تنظيف المدخلات
  app.use(xssMiddleware);

  // ===== Health Check =====
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
    });
  });

  // ===== API routes =====
  app.use("/api/entities", entitiesRouter);
  app.use("/api/accounts", accountsRouter);
  app.use("/api/cash-boxes", cashBoxesRouter);
  app.use("/api/banks-wallets", banksWalletsRouter);
  app.use("/api/inventory", inventoryRouter);
  app.use("/api/warehouses", warehousesRouter);
  app.use("/api/stock-movements", stockMovementsRouter);
  app.use("/api/item-categories", itemCategoriesRouter);
  app.use("/api/inter-unit-transfers", interUnitTransfersRouter);
  app.use("/api/model-switch", modelSwitchRouter);
  app.use("/api/dashboard", dashboardRouter);
  app.use("/api/journal-entries", journalEntriesRouter);
  app.use("/api/payments", paymentsRouter);
  app.use("/api/gemini-credits", geminiCreditsRouter);
  app.use("/api/antigravity-credits", antigravityCreditsRouter);

  // ===== Global Error Handling Middleware =====
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("[Global Error]", err.stack || err.message || err);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
      error: err.message || "حدث خطأ داخلي في الخادم",
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  });

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = parseInt(process.env.PORT || "10001");

  server.listen(port, () => {
    console.log(`✅ Server running on http://localhost:${port}/`);
    console.log(`📡 API available at http://localhost:${port}/api`);
    console.log(`🔒 Security: CORS ✓ | Helmet ✓ | Rate Limit ✓ | Morgan ✓ | Compression ✓`);
    console.log(`🏥 Health check: http://localhost:${port}/api/health`);
  });

  // Graceful Shutdown
  const gracefulShutdown = (signal: string) => {
    console.log(`\n⚠️ ${signal} received. Shutting down gracefully...`);
    server.close(() => {
      console.log("✅ Server closed.");
      process.exit(0);
    });
    setTimeout(() => {
      console.error("⚠️ Forced shutdown after timeout.");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
}

startServer().catch(console.error);
