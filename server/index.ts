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
import { createLogger } from "./logger";
import { db } from "./db";
import { sql } from "drizzle-orm";

// تحميل متغيرات البيئة
dotenv.config();

const log = createLogger("Server");

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
import authRouter from "./routes/auth";
import customersRouter from "./routes/customers";
import suppliersRouter from "./routes/suppliers";
import contactsRouter from "./routes/contacts";
import currenciesRouter from "./routes/currencies";
import costCentersRouter from "./routes/costCenters";
import fixedAssetsRouter from "./routes/fixedAssets";
import budgetsRouter from "./routes/budgets";
import { authMiddleware } from "./auth";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

// ===== متغيرات مراقبة الأداء =====
let requestCount = 0;
let errorCount = 0;
// const startTime = Date.now();

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
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            "https://fonts.googleapis.com",
          ],
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
  const apiLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"),
    max: parseInt(process.env.RATE_LIMIT_MAX || "1000"),
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "تم تجاوز الحد الأقصى للطلبات. يرجى المحاولة لاحقاً." },
  });
  app.use("/api/", apiLimiter);

  // Rate Limit مشدد لمحاولات تسجيل الدخول
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 دقيقة
    max: 20, // 20 محاولة فقط
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error:
        "تم تجاوز الحد الأقصى لمحاولات تسجيل الدخول. يرجى المحاولة بعد 15 دقيقة.",
    },
  });
  app.use("/api/auth/login", authLimiter);

  // 4. Morgan - تسجيل الطلبات مع تنسيق مخصص
  app.use(
    morgan(":method :url :status :response-time ms - :res[content-length]")
  );

  // 5. Compression - ضغط الاستجابات
  app.use(compression());

  // ===== Middleware أساسي =====
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));

  // 6. XSS Protection - تنظيف المدخلات
  app.use(xssMiddleware);

  // 7. Request Counter & Timing Middleware
  app.use((_req, _res, next) => {
    requestCount++;
    next();
  });

  // ===== Health Check محسن =====
  app.get("/api/health", async (_req, res) => {
    const healthStart = Date.now();
    let dbStatus = "unknown";
    let dbLatency = 0;

    try {
      const dbStart = Date.now();
      await db.execute(sql`SELECT 1`);
      dbLatency = Date.now() - dbStart;
      dbStatus = "connected";
    } catch {
      dbStatus = "disconnected";
    }

    const memUsage = process.memoryUsage();
    const uptimeSeconds = process.uptime();

    res.json({
      status: dbStatus === "connected" ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      uptime: {
        seconds: Math.floor(uptimeSeconds),
        formatted: formatUptime(uptimeSeconds),
      },
      environment: process.env.NODE_ENV || "development",
      version: process.env.APP_VERSION || "2.0.0",
      database: {
        status: dbStatus,
        latency: `${dbLatency}ms`,
      },
      memory: {
        rss: formatBytes(memUsage.rss),
        heapUsed: formatBytes(memUsage.heapUsed),
        heapTotal: formatBytes(memUsage.heapTotal),
        external: formatBytes(memUsage.external),
      },
      stats: {
        totalRequests: requestCount,
        totalErrors: errorCount,
        errorRate:
          requestCount > 0
            ? `${((errorCount / requestCount) * 100).toFixed(2)}%`
            : "0%",
      },
      security: {
        cors: "enabled",
        helmet: "enabled",
        rateLimiting: "enabled",
        xssProtection: "enabled",
        compression: "enabled",
        authentication:
          process.env.AUTH_ENABLED === "true" ? "enabled" : "disabled",
      },
      responseTime: `${Date.now() - healthStart}ms`,
    });
  });

  // ===== Readiness Check (للـ Kubernetes/Docker) =====
  app.get("/api/ready", async (_req, res) => {
    try {
      await db.execute(sql`SELECT 1`);
      res.json({ ready: true });
    } catch {
      res.status(503).json({ ready: false, reason: "Database not available" });
    }
  });

  // ===== Liveness Check =====
  app.get("/api/live", (_req, res) => {
    res.json({ alive: true, uptime: process.uptime() });
  });

  // ===== Auth routes (لا تحتاج مصادقة) =====
  app.use("/api/auth", authRouter);

  // ===== Auth Middleware (يحمي جميع الـ routes التالية) =====
  app.use("/api", authMiddleware);

  // ===== API routes (محمية بالمصادقة) =====
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
  app.use("/api/customers", customersRouter);
  app.use("/api/suppliers", suppliersRouter);
  app.use("/api/contacts", contactsRouter);
  app.use("/api/currencies", currenciesRouter);
  app.use("/api/cost-centers", costCentersRouter);
  app.use("/api/fixed-assets", fixedAssetsRouter);
  app.use("/api/budgets", budgetsRouter);

  // ===== Global Error Handling Middleware =====
  app.use(
    (
      err: any,
      req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      errorCount++;
      const statusCode = err.statusCode || 500;

      log.error(`${req.method} ${req.url} - ${statusCode}`, {
        error: err.message,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      });

      res.status(statusCode).json({
        error: err.message || "حدث خطأ داخلي في الخادم",
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
      });
    }
  );

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
    log.info("Server started successfully", {
      port,
      environment: process.env.NODE_ENV || "development",
      authEnabled: process.env.AUTH_ENABLED === "true",
    });
    console.log(`\n${"=".repeat(60)}`);
    console.log(`  🚀 النظام المحاسبي المتكامل v2.0.0`);
    console.log(`  📡 الخادم: http://localhost:${port}/`);
    console.log(`  🔌 API: http://localhost:${port}/api`);
    console.log(`  🏥 Health: http://localhost:${port}/api/health`);
    console.log(
      `  🔐 Auth: ${process.env.AUTH_ENABLED === "true" ? "مفعّل" : "معطّل (AUTH_ENABLED=true لتفعيله)"}`
    );
    console.log(
      `  🔒 CORS ✓ | Helmet ✓ | Rate Limit ✓ | XSS ✓ | Compression ✓`
    );
    console.log(`${"=".repeat(60)}\n`);
  });

  // Graceful Shutdown
  const gracefulShutdown = (signal: string) => {
    log.warn(`${signal} received. Shutting down gracefully...`);
    server.close(() => {
      log.info("Server closed successfully", {
        totalRequests: requestCount,
        totalErrors: errorCount,
        uptime: formatUptime(process.uptime()),
      });
      process.exit(0);
    });
    setTimeout(() => {
      log.error("Forced shutdown after timeout");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));

  // معالجة الأخطاء غير المتوقعة
  process.on("uncaughtException", error => {
    log.error("Uncaught Exception", {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  });

  process.on("unhandledRejection", reason => {
    log.error("Unhandled Rejection", { reason: String(reason) });
  });
}

// ===== دوال مساعدة =====
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);

  return parts.join(" ");
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

startServer().catch(error => {
  log.error("Failed to start server", { error: error.message });
  process.exit(1);
});
