import { Router, Request, Response } from "express";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import {
  hashPassword,
  verifyPassword,
  generateToken,
  createSession,
  deleteSession,
  deleteAllUserSessions,
  findUserByUsername,
  findUserByEmail,
  findUserById,
  authMiddleware,
  requireRole,
  AuthRequest,
} from "../auth";

const router = Router();

// ===== تسجيل الدخول =====
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: "اسم المستخدم وكلمة المرور مطلوبان" });
      return;
    }

    // البحث عن المستخدم
    const user = await findUserByUsername(username);
    if (!user) {
      res.status(401).json({ error: "اسم المستخدم أو كلمة المرور غير صحيحة" });
      return;
    }

    // التحقق من حالة الحساب
    if (!user.isActive) {
      res.status(403).json({ error: "الحساب معطل. يرجى التواصل مع المسؤول" });
      return;
    }

    // التحقق من كلمة المرور
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ error: "اسم المستخدم أو كلمة المرور غير صحيحة" });
      return;
    }

    // إنشاء token
    const authUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      entityId: user.entityId,
    };
    const token = generateToken(authUser);

    // إنشاء جلسة
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"];
    await createSession(user.id, token, ipAddress, userAgent);

    // تحديث آخر تسجيل دخول
    await db.update(users)
      .set({ lastLoginAt: new Date(), updatedAt: new Date() })
      .where(eq(users.id, user.id));

    res.json({
      message: "تم تسجيل الدخول بنجاح",
      token,
      user: authUser,
    });
  } catch (error) {
    console.error("[Auth] Login error:", error);
    res.status(500).json({ error: "حدث خطأ أثناء تسجيل الدخول" });
  }
});

// ===== تسجيل مستخدم جديد (يتطلب صلاحية admin) =====
router.post("/register", authMiddleware, requireRole("admin"), async (req: AuthRequest, res: Response) => {
  try {
    const { username, email, password, fullName, role, entityId } = req.body;

    if (!username || !password || !fullName) {
      res.status(400).json({ error: "اسم المستخدم وكلمة المرور والاسم الكامل مطلوبة" });
      return;
    }

    // التحقق من عدم وجود المستخدم
    const existingUser = await findUserByUsername(username);
    if (existingUser) {
      res.status(409).json({ error: "اسم المستخدم مستخدم بالفعل" });
      return;
    }

    if (email) {
      const existingEmail = await findUserByEmail(email);
      if (existingEmail) {
        res.status(409).json({ error: "البريد الإلكتروني مستخدم بالفعل" });
        return;
      }
    }

    // التحقق من صحة الدور
    const validRoles = ["admin", "manager", "accountant", "user"];
    if (role && !validRoles.includes(role)) {
      res.status(400).json({ error: `الدور غير صالح. الأدوار المتاحة: ${validRoles.join(", ")}` });
      return;
    }

    // تشفير كلمة المرور
    const passwordHash = await hashPassword(password);

    // إنشاء المستخدم
    const result = await db.insert(users).values({
      username,
      email: email || null,
      passwordHash,
      fullName,
      role: role || "user",
      entityId: entityId || null,
    }).returning();

    const newUser = result[0];

    res.status(201).json({
      message: "تم إنشاء المستخدم بنجاح",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role,
        entityId: newUser.entityId,
      },
    });
  } catch (error) {
    console.error("[Auth] Register error:", error);
    res.status(500).json({ error: "حدث خطأ أثناء إنشاء المستخدم" });
  }
});

// ===== تسجيل الخروج =====
router.post("/logout", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(" ")[1];
      await deleteSession(token);
    }
    res.json({ message: "تم تسجيل الخروج بنجاح" });
  } catch (error) {
    console.error("[Auth] Logout error:", error);
    res.status(500).json({ error: "حدث خطأ أثناء تسجيل الخروج" });
  }
});

// ===== تسجيل الخروج من جميع الأجهزة =====
router.post("/logout-all", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user) {
      await deleteAllUserSessions(req.user.id);
    }
    res.json({ message: "تم تسجيل الخروج من جميع الأجهزة" });
  } catch (error) {
    console.error("[Auth] Logout all error:", error);
    res.status(500).json({ error: "حدث خطأ" });
  }
});

// ===== الحصول على بيانات المستخدم الحالي =====
router.get("/me", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.id === "system") {
      res.json({
        user: {
          id: "system",
          username: "system",
          fullName: "مستخدم النظام",
          role: "admin",
          entityId: null,
        },
        authEnabled: process.env.AUTH_ENABLED === "true",
      });
      return;
    }

    const user = await findUserById(req.user.id);
    if (!user) {
      res.status(404).json({ error: "المستخدم غير موجود" });
      return;
    }

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        entityId: user.entityId,
        lastLoginAt: user.lastLoginAt,
      },
      authEnabled: true,
    });
  } catch (error) {
    console.error("[Auth] Me error:", error);
    res.status(500).json({ error: "حدث خطأ" });
  }
});

// ===== تغيير كلمة المرور =====
router.put("/change-password", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: "كلمة المرور الحالية والجديدة مطلوبتان" });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ error: "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل" });
      return;
    }

    if (!req.user || req.user.id === "system") {
      res.status(400).json({ error: "لا يمكن تغيير كلمة مرور مستخدم النظام" });
      return;
    }

    const user = await findUserById(req.user.id);
    if (!user) {
      res.status(404).json({ error: "المستخدم غير موجود" });
      return;
    }

    const isValid = await verifyPassword(currentPassword, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ error: "كلمة المرور الحالية غير صحيحة" });
      return;
    }

    const newHash = await hashPassword(newPassword);
    await db.update(users)
      .set({ passwordHash: newHash, updatedAt: new Date() })
      .where(eq(users.id, user.id));

    // حذف جميع الجلسات لإجبار إعادة تسجيل الدخول
    await deleteAllUserSessions(user.id);

    res.json({ message: "تم تغيير كلمة المرور بنجاح. يرجى إعادة تسجيل الدخول" });
  } catch (error) {
    console.error("[Auth] Change password error:", error);
    res.status(500).json({ error: "حدث خطأ أثناء تغيير كلمة المرور" });
  }
});

// ===== قائمة المستخدمين (admin فقط) =====
router.get("/users", authMiddleware, requireRole("admin"), async (_req: Request, res: Response) => {
  try {
    const allUsers = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      fullName: users.fullName,
      role: users.role,
      entityId: users.entityId,
      isActive: users.isActive,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
    }).from(users);

    res.json(allUsers);
  } catch (error) {
    console.error("[Auth] List users error:", error);
    res.status(500).json({ error: "حدث خطأ" });
  }
});

// ===== تعديل مستخدم (admin فقط) =====
router.put("/users/:id", authMiddleware, requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { fullName, email, role, entityId, isActive } = req.body;

    const user = await findUserById(id);
    if (!user) {
      res.status(404).json({ error: "المستخدم غير موجود" });
      return;
    }

    const updateData: any = { updatedAt: new Date() };
    if (fullName !== undefined) updateData.fullName = fullName;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (entityId !== undefined) updateData.entityId = entityId;
    if (isActive !== undefined) updateData.isActive = isActive;

    await db.update(users).set(updateData).where(eq(users.id, id));

    res.json({ message: "تم تحديث المستخدم بنجاح" });
  } catch (error) {
    console.error("[Auth] Update user error:", error);
    res.status(500).json({ error: "حدث خطأ أثناء تحديث المستخدم" });
  }
});

// ===== إعادة تعيين كلمة مرور مستخدم (admin فقط) =====
router.put("/users/:id/reset-password", authMiddleware, requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      res.status(400).json({ error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" });
      return;
    }

    const user = await findUserById(id);
    if (!user) {
      res.status(404).json({ error: "المستخدم غير موجود" });
      return;
    }

    const passwordHash = await hashPassword(newPassword);
    await db.update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, id));

    // حذف جميع جلسات المستخدم
    await deleteAllUserSessions(id);

    res.json({ message: "تم إعادة تعيين كلمة المرور بنجاح" });
  } catch (error) {
    console.error("[Auth] Reset password error:", error);
    res.status(500).json({ error: "حدث خطأ" });
  }
});

// ===== إنشاء مستخدم admin أولي (يعمل مرة واحدة فقط) =====
router.post("/setup", async (_req: Request, res: Response) => {
  try {
    // التحقق من عدم وجود أي مستخدم
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length > 0) {
      res.status(400).json({ error: "تم إعداد النظام مسبقاً. استخدم /login" });
      return;
    }

    // إنشاء مستخدم admin افتراضي
    const passwordHash = await hashPassword("admin123");
    const result = await db.insert(users).values({
      username: "admin",
      email: "admin@system.local",
      passwordHash,
      fullName: "مدير النظام",
      role: "admin",
    }).returning();

    const admin = result[0];

    res.status(201).json({
      message: "تم إعداد النظام بنجاح. يرجى تغيير كلمة المرور فوراً",
      user: {
        id: admin.id,
        username: admin.username,
        fullName: admin.fullName,
        role: admin.role,
      },
      defaultPassword: "admin123",
    });
  } catch (error) {
    console.error("[Auth] Setup error:", error);
    res.status(500).json({ error: "حدث خطأ أثناء إعداد النظام" });
  }
});

export default router;
