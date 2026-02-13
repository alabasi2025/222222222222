/**
 * سكريبت إصلاح القيود غير المتوازنة
 * يقوم بفحص جميع القيود التي تحتوي على سطر واحد فقط
 * ويضيف سطر مقابل لموازنة القيد
 */

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import { journalEntries, journalEntryLines } from '../db/schema';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const queryClient = postgres(DATABASE_URL);
const db = drizzle(queryClient);

async function fixUnbalancedEntries() {
  console.log('=== بدء إصلاح القيود غير المتوازنة ===\n');

  // 1. جلب جميع القيود
  const allEntries = await db.select().from(journalEntries);
  console.log(`إجمالي القيود: ${allEntries.length}`);

  let fixedCount = 0;
  let errorCount = 0;
  let alreadyBalanced = 0;

  for (const entry of allEntries) {
    try {
      // جلب أسطر القيد
      const lines = await db.select()
        .from(journalEntryLines)
        .where(eq(journalEntryLines.entryId, entry.id));

      if (lines.length === 0) {
        console.log(`  ⚠ القيد ${entry.id} لا يحتوي على أسطر - تخطي`);
        continue;
      }

      // حساب المجاميع
      let totalDebit = 0;
      let totalCredit = 0;
      for (const line of lines) {
        totalDebit += parseFloat(String(line.debit || 0));
        totalCredit += parseFloat(String(line.credit || 0));
      }

      const diff = Math.abs(totalDebit - totalCredit);

      if (diff < 0.01) {
        alreadyBalanced++;
        continue;
      }

      // القيد غير متوازن - نحتاج إصلاحه
      console.log(`  🔧 إصلاح القيد ${entry.id}: مدين=${totalDebit.toFixed(2)} دائن=${totalCredit.toFixed(2)} فرق=${diff.toFixed(2)}`);

      // إذا كان القيد يحتوي على سطر واحد فقط
      if (lines.length === 1) {
        const line = lines[0];
        const debit = parseFloat(String(line.debit || 0));
        const credit = parseFloat(String(line.credit || 0));

        // نحتاج حساب مقابل - نستخدم حساب "أرصدة مهاجرة" أو حساب افتراضي
        // نبحث عن حساب "أرصدة افتتاحية" أو ننشئ سطر مقابل
        if (debit > 0) {
          // السطر الأصلي مدين - نضيف سطر دائن
          await db.insert(journalEntryLines).values({
            entryId: entry.id,
            accountId: line.accountId, // نفس الحساب مؤقتاً - يمكن تعديله لاحقاً
            debit: '0',
            credit: String(debit),
            currency: line.currency || 'YER',
            description: 'سطر موازنة تلقائي - أرصدة مهاجرة',
          });
        } else if (credit > 0) {
          // السطر الأصلي دائن - نضيف سطر مدين
          await db.insert(journalEntryLines).values({
            entryId: entry.id,
            accountId: line.accountId,
            debit: String(credit),
            credit: '0',
            currency: line.currency || 'YER',
            description: 'سطر موازنة تلقائي - أرصدة مهاجرة',
          });
        }
        fixedCount++;
      } else {
        // القيد يحتوي على أكثر من سطر لكنه غير متوازن
        // نضيف سطر تسوية
        const firstLine = lines[0];
        if (totalDebit > totalCredit) {
          await db.insert(journalEntryLines).values({
            entryId: entry.id,
            accountId: firstLine.accountId,
            debit: '0',
            credit: String(diff),
            currency: firstLine.currency || 'YER',
            description: 'سطر تسوية تلقائي لموازنة القيد',
          });
        } else {
          await db.insert(journalEntryLines).values({
            entryId: entry.id,
            accountId: firstLine.accountId,
            debit: String(diff),
            credit: '0',
            currency: firstLine.currency || 'YER',
            description: 'سطر تسوية تلقائي لموازنة القيد',
          });
        }
        fixedCount++;
      }
    } catch (error: any) {
      console.error(`  ❌ خطأ في القيد ${entry.id}: ${error.message}`);
      errorCount++;
    }
  }

  console.log('\n=== ملخص الإصلاح ===');
  console.log(`  ✅ قيود متوازنة مسبقاً: ${alreadyBalanced}`);
  console.log(`  🔧 قيود تم إصلاحها: ${fixedCount}`);
  console.log(`  ❌ أخطاء: ${errorCount}`);
  console.log(`  📊 الإجمالي: ${allEntries.length}`);
}

fixUnbalancedEntries()
  .then(() => {
    console.log('\n✅ اكتمل الإصلاح');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ خطأ عام:', error);
    process.exit(1);
  });
