import { Router } from 'express';
import { db } from '../db';
import { journalEntries, journalEntryLines, accounts, entities } from '../db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Get all journal entries
router.get('/', async (req, res) => {
  try {
    const entries = await db.query.journalEntries.findMany({
      orderBy: [desc(journalEntries.date)],
      with: {
        lines: {
          with: {
            account: true
          }
        },
        entity: true
      }
    });
    res.json(entries);
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    res.status(500).json({ error: 'Failed to fetch journal entries' });
  }
});

// Get single journal entry
router.get('/:id', async (req, res) => {
  try {
    const entry = await db.query.journalEntries.findFirst({
      where: eq(journalEntries.id, req.params.id),
      with: {
        lines: {
          with: {
            account: true
          }
        },
        entity: true
      }
    });
    
    if (!entry) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }
    
    res.json(entry);
  } catch (error) {
    console.error('Error fetching journal entry:', error);
    res.status(500).json({ error: 'Failed to fetch journal entry' });
  }
});

// Create journal entry
router.post('/', async (req, res) => {
  try {
    const { entityId, date, description, type, status, lines, reference, createdBy } = req.body;
    
    const entryId = `JV-${Date.now()}`;
    
    await db.transaction(async (tx) => {
      // Create header
      await tx.insert(journalEntries).values({
        id: entryId,
        entityId,
        date: new Date(date),
        description,
        type: type || 'manual',
        status: status || 'draft',
        reference,
        createdBy,
      });

      // Create lines
      if (lines && lines.length > 0) {
        for (const line of lines) {
          await tx.insert(journalEntryLines).values({
            id: `JVL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            entryId: entryId,
            accountId: line.accountId,
            debit: line.debit || 0,
            credit: line.credit || 0,
            currency: line.currency || 'YER',
            description: line.description || description,
          });

          // Update account balance (simplified - real accounting needs more logic)
          // For now, we assume balances are calculated on fly or updated here
          // This is a placeholder for actual balance update logic
        }
      }
    });

    const newEntry = await db.query.journalEntries.findFirst({
      where: eq(journalEntries.id, entryId),
      with: {
        lines: true
      }
    });

    res.status(201).json(newEntry);
  } catch (error) {
    console.error('Error creating journal entry:', error);
    res.status(500).json({ error: 'Failed to create journal entry' });
  }
});

export default router;
