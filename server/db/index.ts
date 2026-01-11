import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// اتصال PostgreSQL 18 للنظام 2222222
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:774424555@localhost:5432/db_2222222';

export const client = postgres(connectionString);
export const db = drizzle(client, { schema });
