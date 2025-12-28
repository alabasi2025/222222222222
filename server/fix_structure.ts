
import { db } from './db/index';
import { entities } from './db/schema';
import { eq } from 'drizzle-orm';

async function main() {
  try {
    console.log('Checking for Holding entity...');
    const holding = await db.select().from(entities).where(eq(entities.type, 'holding'));
    
    let holdingId = '';

    if (holding.length > 0) {
      console.log('Holding entity already exists:', holding[0].name);
      holdingId = holding[0].id;
    } else {
      console.log('Creating Holding entity...');
      const newHolding = await db.insert(entities).values({
        id: 'HOLD-001',
        name: 'مجموعة العباسي',
        type: 'holding',
        parentId: null,
        themeColor: '#7c3aed'
      }).returning();
      holdingId = newHolding[0].id;
      console.log('Created:', newHolding[0]);
    }

    // Update existing UNITS to be children of HOLDING
    console.log('Updating Units to be children of Holding...');
    
    // Get all units
    const units = await db.select().from(entities).where(eq(entities.type, 'unit'));
    
    for (const unit of units) {
      if (!unit.parentId) {
        await db.update(entities)
          .set({ parentId: holdingId })
          .where(eq(entities.id, unit.id));
        console.log(`Linked ${unit.name} to Holding`);
      }
    }

    console.log('Structure updated successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
