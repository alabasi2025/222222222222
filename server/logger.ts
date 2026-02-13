import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== مستويات التسجيل =====
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

// ===== ألوان الطرفية =====
const COLORS = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  gray: "\x1b[90m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
};

// ===== إعدادات Logger =====
const LOG_DIR = process.env.LOG_DIR || path.resolve(__dirname, "..", "logs");
const LOG_LEVEL = (process.env.LOG_LEVEL || "info").toLowerCase();
const LOG_TO_FILE = process.env.LOG_TO_FILE === "true";
const MAX_LOG_SIZE = parseInt(process.env.MAX_LOG_SIZE || "10485760"); // 10MB

// تحويل مستوى التسجيل من نص إلى رقم
function parseLogLevel(level: string): LogLevel {
  switch (level) {
    case "error": return LogLevel.ERROR;
    case "warn": return LogLevel.WARN;
    case "info": return LogLevel.INFO;
    case "debug": return LogLevel.DEBUG;
    default: return LogLevel.INFO;
  }
}

const currentLogLevel = parseLogLevel(LOG_LEVEL);

// ===== إنشاء مجلد السجلات =====
if (LOG_TO_FILE) {
  try {
    if (!fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR, { recursive: true });
    }
  } catch {
    console.warn("⚠️ Could not create log directory:", LOG_DIR);
  }
}

// ===== دوران الملفات =====
function rotateLogFile(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      if (stats.size >= MAX_LOG_SIZE) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const ext = path.extname(filePath);
        const base = path.basename(filePath, ext);
        const rotatedPath = path.join(LOG_DIR, `${base}-${timestamp}${ext}`);
        fs.renameSync(filePath, rotatedPath);

        // حذف الملفات القديمة (الاحتفاظ بآخر 5)
        const logFiles = fs.readdirSync(LOG_DIR)
          .filter(f => f.startsWith(base) && f !== path.basename(filePath))
          .sort()
          .reverse();

        if (logFiles.length > 5) {
          logFiles.slice(5).forEach(f => {
            try { fs.unlinkSync(path.join(LOG_DIR, f)); } catch { /* ignore */ }
          });
        }
      }
    }
  } catch {
    // تجاهل أخطاء الدوران
  }
}

// ===== كتابة في الملف =====
function writeToFile(level: string, message: string): void {
  if (!LOG_TO_FILE) return;

  const logFile = path.join(LOG_DIR, `app-${level.toLowerCase()}.log`);
  const allLogFile = path.join(LOG_DIR, "app.log");

  rotateLogFile(logFile);
  rotateLogFile(allLogFile);

  const logLine = `${message}\n`;

  try {
    fs.appendFileSync(allLogFile, logLine);
    fs.appendFileSync(logFile, logLine);
  } catch {
    // تجاهل أخطاء الكتابة
  }
}

// ===== تنسيق الرسالة =====
function formatMessage(level: string, module: string, message: string, data?: any): string {
  const timestamp = new Date().toISOString();
  const dataStr = data ? ` | ${JSON.stringify(data)}` : "";
  return `[${timestamp}] [${level}] [${module}] ${message}${dataStr}`;
}

// ===== Logger Class =====
class Logger {
  private module: string;

  constructor(module: string) {
    this.module = module;
  }

  error(message: string, data?: any): void {
    if (currentLogLevel >= LogLevel.ERROR) {
      const formatted = formatMessage("ERROR", this.module, message, data);
      console.error(`${COLORS.red}${formatted}${COLORS.reset}`);
      writeToFile("error", formatted);
    }
  }

  warn(message: string, data?: any): void {
    if (currentLogLevel >= LogLevel.WARN) {
      const formatted = formatMessage("WARN", this.module, message, data);
      console.warn(`${COLORS.yellow}${formatted}${COLORS.reset}`);
      writeToFile("warn", formatted);
    }
  }

  info(message: string, data?: any): void {
    if (currentLogLevel >= LogLevel.INFO) {
      const formatted = formatMessage("INFO", this.module, message, data);
      console.log(`${COLORS.blue}${formatted}${COLORS.reset}`);
      writeToFile("info", formatted);
    }
  }

  debug(message: string, data?: any): void {
    if (currentLogLevel >= LogLevel.DEBUG) {
      const formatted = formatMessage("DEBUG", this.module, message, data);
      console.log(`${COLORS.gray}${formatted}${COLORS.reset}`);
      writeToFile("debug", formatted);
    }
  }

  // تسجيل طلب HTTP
  request(method: string, url: string, statusCode: number, duration: number, userId?: string): void {
    const data = { method, url, statusCode, duration: `${duration}ms`, userId };
    if (statusCode >= 500) {
      this.error("Server Error Response", data);
    } else if (statusCode >= 400) {
      this.warn("Client Error Response", data);
    } else {
      this.info("Request completed", data);
    }
  }

  // تسجيل عملية قاعدة بيانات
  db(operation: string, table: string, duration: number, data?: any): void {
    this.debug(`DB ${operation} on ${table}`, { duration: `${duration}ms`, ...data });
  }

  // تسجيل حدث أمني
  security(event: string, data?: any): void {
    const formatted = formatMessage("SECURITY", this.module, event, data);
    console.warn(`${COLORS.cyan}${formatted}${COLORS.reset}`);
    writeToFile("security", formatted);
  }
}

// ===== Factory Function =====
export function createLogger(module: string): Logger {
  return new Logger(module);
}

// ===== Default Logger =====
export const logger = createLogger("App");

export default logger;
