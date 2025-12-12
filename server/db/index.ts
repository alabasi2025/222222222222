import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// اتصال PostgreSQL
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/accounting';

export const client = postgres(connectionString);
export const db = drizzle(client, { schema });
