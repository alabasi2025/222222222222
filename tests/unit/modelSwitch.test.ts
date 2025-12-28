// tests/unit/modelSwitch.test.ts
import request from 'supertest';
import { app } from '../../server/index';

describe('Model Switch API', () => {
  it('should return the current active model and list of available models', async () => {
    const res = await request(app).get('/api/model-switch');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('activeModel');
    expect(res.body).toHaveProperty('availableModels');
    expect(Array.isArray(res.body.availableModels)).toBe(true);
  });

  it('should change the active model when a valid model is provided', async () => {
    const newModel = 'claude-opus-4.5-thinking';
    const res = await request(app)
      .post('/api/model-switch')
      .send({ model: newModel })
      .set('Content-Type', 'application/json');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, activeModel: newModel });
  });

  it('should return an error for an invalid model', async () => {
    const res = await request(app)
      .post('/api/model-switch')
      .send({ model: 'invalid-model' })
      .set('Content-Type', 'application/json');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});
