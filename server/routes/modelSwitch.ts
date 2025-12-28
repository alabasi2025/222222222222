// server/routes/modelSwitch.ts
import { Router } from 'express';
import { getActiveModel, setActiveModel, availableModels } from '../modelSwitcher';

const router = Router();

// GET current active model
router.get('/', (req, res) => {
  res.json({ activeModel: getActiveModel(), availableModels });
});

// POST to change active model
router.post('/', (req, res) => {
  const { model } = req.body;
  if (!model) {
    return res.status(400).json({ error: 'Model name is required' });
  }
  try {
    setActiveModel(model);
    res.json({ success: true, activeModel: getActiveModel() });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
