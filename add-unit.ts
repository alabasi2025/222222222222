
import { db } from './server/db/index';
import { entities } from './server/db/schema';

async function addUnit() {
  try {
    console.log('Inserting new unit...');
    await db.insert(entities).values({
      id: 'UNIT-003',
      name: 'وحدة أعمال صنعاء',
      type: 'unit',
      parentId: 'HOLD-001'
    });
    console.log('Unit added successfully: UNIT-003 (وحدة أعمال صنعاء)');
  } catch (e) {
    console.error('Error adding unit:', e);
  }
  process.exit(0);
}

addUnit();
