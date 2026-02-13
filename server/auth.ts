import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { users, sessions } from "./db/schema";
import { eq, and, sql, lt } from "drizzle-orm";

// ===== أنواع المصادقة =====
export interface AuthUser {
  id: string;
  username: string;
  email: string | null;
  fullName: string;
  role: string;
  entityId: string | null;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

// ===== ثوابت =====
const JWT_SECRET = process.env.JWT_SECRET || "change-this-secret-in-production-774424555";
const _JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const JWT_EXPIRES_IN_SECONDS = 7 * 24 * 60 * 60; // 7 أيام بالثواني
const SALT_ROUNDS = 12;

// ===== دوال مساعدة =====

/**
 * تشفير كلمة المرور
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * التحقق من كلمة المرور
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * إنشاء JWT token
 */
export function generateToken(user: AuthUser): string {
  const payload: Record<string, string | undefined> = {
    id: user.id,
    username: user.username,
    role: user.role,
    entityId: user.entityId || undefined,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN_SECONDS });
}

/**
 * التحقق من JWT token
 */
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// ===== Middleware =====

/**
 * Middleware للمصادقة - يتحقق من وجود وصلاحية الـ token
 * يمكن تفعيله أو تعطيله عبر متغير البيئة AUTH_ENABLED
 */
export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  // التحقق من تفعيل المصادقة
  const authEnabled = process.env.AUTH_ENABLED === "true";
  
  if (!authEnabled) {
    // إذا المصادقة معطلة، السماح بالمرور مع مستخدم افتراضي
    req.user = {
      id: "system",
      username: "system",
      email: null,
      fullName: "مستخدم النظام",
      role: "admin",
      entityId: null,
    };
    return next();
  }

  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "غير مصرح - يرجى تسجيل الدخول" });
    return;
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    res.status(401).json({ error: "جلسة منتهية - يرجى إعادة تسجيل الدخول" });
    return;
  }

  req.user = {
    id: decoded.id,
    username: decoded.username,
    email: decoded.email || null,
    fullName: decoded.fullName || decoded.username,
    role: decoded.role,
    entityId: decoded.entityId || null,
  };

  next();
}

/**
 * Middleware للتحقق من الصلاحيات
 */
export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "غير مصرح" });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: "ليس لديك صلاحية للوصول إلى هذا المورد" });
      return;
    }

    next();
  };
}

// ===== دوال قاعدة البيانات =====

/**
 * البحث عن مستخدم بالاسم
 */
export async function findUserByUsername(username: string) {
  const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
  return result[0] || null;
}

/**
 * البحث عن مستخدم بالبريد الإلكتروني
 */
export async function findUserByEmail(email: string) {
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0] || null;
}

/**
 * البحث عن مستخدم بالمعرف
 */
export async function findUserById(id: string) {
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0] || null;
}

/**
 * إنشاء جلسة جديدة
 */
export async function createSession(userId: string, token: string, ipAddress?: string, userAgent?: string) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 أيام

  const result = await db.insert(sessions).values({
    userId,
    token,
    expiresAt,
    ipAddress: ipAddress || null,
    userAgent: userAgent || null,
  }).returning();

  return result[0];
}

/**
 * حذف جلسة (تسجيل خروج)
 */
export async function deleteSession(token: string) {
  await db.delete(sessions).where(eq(sessions.token, token));
}

/**
 * حذف جميع جلسات المستخدم
 */
export async function deleteAllUserSessions(userId: string) {
  await db.delete(sessions).where(eq(sessions.userId, userId));
}

/**
 * التحقق من صلاحية الجلسة
 */
export async function validateSession(token: string) {
  const result = await db.select()
    .from(sessions)
    .where(
      and(
        eq(sessions.token, token),
        sql`${sessions.expiresAt} > NOW()`
      )
    )
    .limit(1);

  return result[0] || null;
}

/**
 * تنظيف الجلسات المنتهية
 */
export async function cleanExpiredSessions() {
  await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
}
