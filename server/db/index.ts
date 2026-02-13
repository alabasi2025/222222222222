import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// اتصال PostgreSQL 18 - يستخدم متغيرات البيئة بدلاً من كتابة بيانات الاعتماد في الكود
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:774424555@localhost:5432/22222';

export const client = postgres(connectionString, {
  max: 20, // Connection Pool - الحد الأقصى للاتصالات المتزامنة
  idle_timeout: 30, // إغلاق الاتصالات الخاملة بعد 30 ثانية
  connect_timeout: 10, // مهلة الاتصال 10 ثوانٍ
});

export const db = drizzle(client, { schema });
