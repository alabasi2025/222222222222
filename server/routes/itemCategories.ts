import { Router } from 'express';
import { db } from '../db/index';
import { itemCategories } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Get all categories
router.get('/', async (_req, res) => {
  try {
    const allCategories = await db.select().from(itemCategories);
    res.json(allCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get categories by entity
router.get('/entity/:entityId', async (req, res) => {
  try {
    const entityCategories = await db.select().from(itemCategories).where(eq(itemCategories.entityId, req.params.entityId));
    res.json(entityCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get category by ID
router.get('/:id', async (req, res) => {
  try {
    const category = await db.select().from(itemCategories).where(eq(itemCategories.id, req.params.id));
    if (category.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category[0]);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

// Create new category
router.post('/', async (req, res) => {
  try {
    const newCategory = await db.insert(itemCategories).values({
      id: req.body.id || `CAT-${Date.now()}`,
      ...req.body,
    }).returning();
    res.status(201).json(newCategory[0]);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Update category
router.put('/:id', async (req, res) => {
  try {
    const updated = await db
      .update(itemCategories)
      .set(req.body)
      .where(eq(itemCategories.id, req.params.id))
      .returning();
    
    if (updated.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Delete category
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await db.delete(itemCategories).where(eq(itemCategories.id, req.params.id)).returning();
    if (deleted.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

export default router;
