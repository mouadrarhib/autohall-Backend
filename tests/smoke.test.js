import assert from 'node:assert/strict';
import { afterEach, mock, test } from 'node:test';
import request from 'supertest';
import { createApp } from '../app.js';
import { sequelize } from '../src/config/database.js';

const app = createApp();

let queryMock;

const mockQueryForLogin = (storedPassword) => {
  queryMock = mock.method(sequelize, 'query', async (sql, options = {}) => {
    if (typeof sql === 'string' && sql.includes('FROM dbo.[User]')) {
      if (options?.replacements?.username === 'smokeadmin') {
        return [
          {
            id: 1,
            full_name: 'Smoke Admin',
            email: 'smokeadmin@example.com',
            username: 'smokeadmin',
            password: storedPassword,
            actif: true,
            active: true,
          },
        ];
      }
      return [];
    }

    if (typeof sql === 'string' && sql.includes('usp_AuditLog_Write')) {
      return [];
    }

    return [];
  });
};

afterEach(() => {
  if (queryMock) {
    queryMock.mock.restore();
    queryMock = undefined;
  }
});

test('GET /healthz returns ok status', async () => {
  const res = await request(app).get('/healthz');

  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { status: 'ok' });
});

test('POST /api/auth/login returns 401 on invalid credentials', async () => {
  mockQueryForLogin('Secret123');

  const res = await request(app).post('/api/auth/login').send({
    username: 'smokeadmin',
    password: 'WrongSecret',
  });

  assert.equal(res.status, 401);
  assert.equal(res.body.success, false);
  assert.equal(res.body.error, 'Invalid credentials');
});

test('POST /api/auth/login returns 200 and sets cookie on valid credentials', async () => {
  mockQueryForLogin('Secret123');

  const res = await request(app).post('/api/auth/login').send({
    username: 'smokeadmin',
    password: 'Secret123',
  });

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data?.user?.username, 'smokeadmin');
  assert.ok(Array.isArray(res.headers['set-cookie']));
  assert.ok(res.headers['set-cookie'][0].includes('token='));
});
