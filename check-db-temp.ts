
import { db } from './server/db/index';
import { entities } from './server/db/schema';

async function check() {
  try {
    const res = await db.select().from(entities);
    console.log('Entities count:', res.length);
    if (res.length > 0) {
        console.log('Use Sample:', res[0].name);
    }
  } catch (e) {
    console.error('Error:', e);
  }
  process.exit(0);
}

check();
