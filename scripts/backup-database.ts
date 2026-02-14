import postgres from "postgres";
import * as fs from "fs";
import * as path from "path";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:774424555@localhost:5432/db_2222222";
const sql = postgres(connectionString);

function escapeSQLValue(value: any): string {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "string") {
    return `'${value.replace(/'/g, "''").replace(/\\/g, "\\\\")}'`;
  }
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") return value.toString();
  if (typeof value === "object") {
    return `'${JSON.stringify(value).replace(/'/g, "''").replace(/\\/g, "\\\\")}'`;
  }
  return `'${String(value).replace(/'/g, "''").replace(/\\/g, "\\\\")}'`;
}

function escapeSQLIdentifier(identifier: string): string {
  return `"${identifier.replace(/"/g, '""')}"`;
}

async function backupDatabase() {
  try {
    console.log("بدء النسخ الاحتياطي لقاعدة البيانات...");

    // الحصول على جميع أسماء الجداول
    const tables = await sql`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;

    console.log(`تم العثور على ${tables.length} جدول`);

    let sqlDump = `-- Database Backup
-- Generated at: ${new Date().toISOString()}
-- Database: db_2222222

BEGIN;

`;

    // تصدير كل جدول
    for (const table of tables) {
      const tableName = table.tablename;
      console.log(`جاري تصدير الجدول: ${tableName}...`);

      // الحصول على بيانات الجدول
      const data = await sql.unsafe(
        `SELECT * FROM ${escapeSQLIdentifier(tableName)}`
      );

      if (data.length > 0) {
        // الحصول على أسماء الأعمدة
        const columns = Object.keys(data[0]);
        const columnList = columns
          .map(col => escapeSQLIdentifier(col))
          .join(", ");

        // إضافة بيانات INSERT
        for (const row of data) {
          const values = columns
            .map(col => escapeSQLValue(row[col]))
            .join(", ");
          sqlDump += `INSERT INTO ${escapeSQLIdentifier(tableName)} (${columnList}) VALUES (${values});\n`;
        }
      }
    }

    sqlDump += "\nCOMMIT;\n";

    // حفظ الملف
    const backupFileName = `database_backup_${new Date().toISOString().replace(/[:.]/g, "-").split("T")[0]}.sql`;
    const backupPath = path.join(process.cwd(), backupFileName);

    fs.writeFileSync(backupPath, sqlDump, "utf8");
    console.log(`\nتم حفظ النسخة الاحتياطية في: ${backupFileName}`);
    console.log(
      `حجم الملف: ${(fs.statSync(backupPath).size / 1024).toFixed(2)} KB`
    );
  } catch (error) {
    console.error("خطأ أثناء النسخ الاحتياطي:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

backupDatabase();
