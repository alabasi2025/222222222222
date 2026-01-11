import { Router } from 'express';
import { db } from '../db';
import { journalEntries, journalEntryLines, accounts, entities } from '../db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Get all journal entries (optionally filtered by entityId)
router.get('/', async (req, res) => {
  try {
    const { entityId } = req.query;
    
    // Build base query
    let query = db.select().from(journalEntries);
    
    // Filter by entityId if provided
    if (entityId) {
      query = query.where(eq(journalEntries.entityId, entityId as string));
    }
    
    // Get entries
    const entries = await query.orderBy(desc(journalEntries.date));
    
    // Get lines and accounts for each entry
    const entriesWithLines = await Promise.all(
      entries.map(async (entry: any) => {
        // Get lines for this entry
        const lines = await db.select()
          .from(journalEntryLines)
          .where(eq(journalEntryLines.entryId, entry.id));
        
        // Get account details for each line
        const linesWithAccounts = await Promise.all(
          lines.map(async (line: any) => {
            const account = await db.select()
              .from(accounts)
              .where(eq(accounts.id, line.accountId))
              .limit(1);
            
            return {
              ...line,
              account: account[0] || null
            };
          })
        );
        
        // Get entity details
        const entity = await db.select()
          .from(entities)
          .where(eq(entities.id, entry.entityId))
          .limit(1);
        
        return {
          ...entry,
          lines: linesWithAccounts,
          entity: entity[0] || null
        };
      })
    );
    
    res.json(entriesWithLines);
  } catch (error: any) {
    console.error('Error fetching journal entries:', error);
    console.error('Error details:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to fetch journal entries', details: error.message });
  }
});

// Get journal entries by entity ID
router.get('/entity/:entityId', async (req, res) => {
  try {
    // Get entries for this entity
    const entries = await db.select()
      .from(journalEntries)
      .where(eq(journalEntries.entityId, req.params.entityId))
      .orderBy(desc(journalEntries.date));
    
    // Get lines and accounts for each entry
    const entriesWithLines = await Promise.all(
      entries.map(async (entry: any) => {
        // Get lines for this entry
        const lines = await db.select()
          .from(journalEntryLines)
          .where(eq(journalEntryLines.entryId, entry.id));
        
        // Get account details for each line
        const linesWithAccounts = await Promise.all(
          lines.map(async (line: any) => {
            const account = await db.select()
              .from(accounts)
              .where(eq(accounts.id, line.accountId))
              .limit(1);
            
            return {
              ...line,
              account: account[0] || null
            };
          })
        );
        
        // Get entity details
        const entity = await db.select()
          .from(entities)
          .where(eq(entities.id, entry.entityId))
          .limit(1);
        
        return {
          ...entry,
          lines: linesWithAccounts,
          entity: entity[0] || null
        };
      })
    );
    
    res.json(entriesWithLines);
  } catch (error: any) {
    console.error('Error fetching journal entries by entity:', error);
    console.error('Error details:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to fetch journal entries', details: error.message });
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
