import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { once } from 'node:events';
import { spawnSync } from 'node:child_process';
import app from '../src/app.js';
import Application from '../src/models/Application.js';

// These HTTP tests substitute database methods. They do not need MongoDB
// and never insert or delete real records. Use Postman to verify persistence.
let server;
let baseUrl;
const id = '507f1f77bcf86cd799439011';

before(async () => {
  server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  baseUrl = `http://127.0.0.1:${server.address().port}/api/applications`;
});
after(async () => {
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
});

async function request(method, suffix = '', body) {
  const response = await fetch(baseUrl + suffix, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = response.status === 204 ? null : await response.json();
  return { status: response.status, data };
}

test('model trims required strings and supplies defaults and timestamps', async () => {
  const beforeDate = Date.now();
  const document = new Application({ company: ' Example ', role: ' Developer ' });
  await document.validate();
  assert.equal(document.company, 'Example');
  assert.equal(document.role, 'Developer');
  assert.equal(document.status, 'Applied');
  assert.equal(document.jobLink, '');
  assert.equal(document.notes, '');
  assert.ok(document.applicationDate.getTime() >= beforeDate);
  assert.ok(document.applicationDate.getTime() <= Date.now());
  assert.ok(Application.schema.path('createdAt'));
  assert.ok(Application.schema.path('updatedAt'));
  await assert.rejects(new Application({ company: ' ', role: 'Dev', status: 'Unknown' }).validate());
});

test('POST creates an application and returns 201', async t => {
  t.mock.method(Application, 'create', async data => {
    assert.deepEqual(data, { company: 'Example', role: 'Developer' });
    return new Application({ ...data, _id: id });
  });
  const result = await request('POST', '', { company: 'Example', role: 'Developer' });
  assert.equal(result.status, 201);
  assert.equal(result.data._id, id);
  assert.equal(result.data.status, 'Applied');
  assert.ok(result.data.applicationDate);
});

test('GET lists records newest first and handles an empty list', async t => {
  t.mock.method(Application, 'find', () => ({
    sort: async order => {
      assert.deepEqual(order, { createdAt: -1 });
      return [];
    },
  }));
  assert.deepEqual(await request('GET'), { status: 200, data: [] });
});

test('GET returns the requested record', async t => {
  t.mock.method(Application, 'findById', async receivedId => {
    assert.equal(receivedId, id);
    return { _id: id, company: 'Example', role: 'Developer' };
  });
  const result = await request('GET', `/${id}`);
  assert.equal(result.status, 200);
  assert.equal(result.data._id, id);
});

test('PATCH uses only supplied fields and enables database validation', async t => {
  t.mock.method(Application, 'findByIdAndUpdate', async (receivedId, update, options) => {
    assert.equal(receivedId, id);
    assert.deepEqual(update, { $set: { status: 'Interview' } });
    assert.deepEqual(options, { returnDocument: 'after', runValidators: true });
    return { _id: id, company: 'Example', role: 'Developer', status: 'Interview' };
  });
  const result = await request('PATCH', `/${id}`, { status: 'Interview' });
  assert.equal(result.status, 200);
  assert.equal(result.data.company, 'Example');
  assert.equal(result.data.status, 'Interview');
});

test('DELETE returns 204 with an empty body', async t => {
  t.mock.method(Application, 'findByIdAndDelete', async receivedId => {
    assert.equal(receivedId, id);
    return { _id: id };
  });
  const response = await fetch(`${baseUrl}/${id}`, { method: 'DELETE' });
  assert.equal(response.status, 204);
  assert.equal(await response.text(), '');
});

test('missing records return 404 for GET, PATCH and DELETE', async t => {
  t.mock.method(Application, 'findById', async () => null);
  t.mock.method(Application, 'findByIdAndUpdate', async () => null);
  t.mock.method(Application, 'findByIdAndDelete', async () => null);
  for (const method of ['GET', 'PATCH', 'DELETE']) {
    const result = await request(method, `/${id}`, method === 'PATCH' ? { notes: 'Updated' } : undefined);
    assert.equal(result.status, 404);
    assert.equal(result.data.message, 'Application not found.');
  }
});

test('invalid input is rejected before any database mutation', async t => {
  const create = t.mock.method(Application, 'create', () => { throw new Error('Unexpected database call'); });
  const update = t.mock.method(Application, 'findByIdAndUpdate', () => { throw new Error('Unexpected database call'); });
  const invalidBodies = [
    {}, { company: ' ', role: 'Developer' }, { company: 123, role: 'Developer' },
    { company: 'Example', role: null },
    { company: 'Example', role: 'Developer', status: 'Pending' },
    { company: 'Example', role: 'Developer', applicationDate: '2026-02-30' },
    { company: 'Example', role: 'Developer', applicationDate: null },
    { company: 'Example', role: 'Developer', jobLink: 'javascript:alert(1)' },
    { company: 'Example', role: 'Developer', notes: 123 },
    { company: 'Example', role: 'Developer', extra: 'Unknown' },
    [], null,
  ];
  for (const body of invalidBodies) {
    assert.equal((await request('POST', '', body)).status, 400, JSON.stringify(body));
  }
  for (const body of [{}, { company: '' }, { $set: { status: 'Offer' } }, { status: null }]) {
    assert.equal((await request('PATCH', `/${id}`, body)).status, 400);
  }
  assert.equal(create.mock.callCount(), 0);
  assert.equal(update.mock.callCount(), 0);
});

test('valid date and optional fields can be set and cleared', async t => {
  t.mock.method(Application, 'create', async data => new Application(data));
  const result = await request('POST', '', {
    company: 'Example', role: 'Developer', applicationDate: '2024-02-29',
    jobLink: 'https://example.com/jobs/1', notes: 'Referral', status: 'Offer',
  });
  assert.equal(result.status, 201);
  assert.equal(result.data.applicationDate, '2024-02-29T00:00:00.000Z');
  t.mock.method(Application, 'findByIdAndUpdate', async (receivedId, update) => update.$set);
  const cleared = await request('PATCH', `/${id}`, { jobLink: '', notes: '' });
  assert.equal(cleared.status, 200);
  assert.deepEqual(cleared.data, { jobLink: '', notes: '' });
});

test('invalid IDs return 400 for every single-record endpoint', async () => {
  for (const method of ['GET', 'PATCH', 'DELETE']) {
    assert.equal((await request(method, '/invalid', method === 'PATCH' ? { status: 'Offer' } : undefined)).status, 400);
  }
});

test('malformed JSON and unknown routes produce JSON errors', async () => {
  const response = await fetch(baseUrl, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{broken',
  });
  assert.equal(response.status, 400);
  assert.equal((await response.json()).message, 'Request body contains invalid JSON.');
  assert.equal((await request('GET', '/unknown/route')).status, 404);
});

test('unexpected database errors do not leak details', async t => {
  t.mock.method(Application, 'findById', async () => { throw new Error('secret connection details'); });
  const result = await request('GET', `/${id}`);
  assert.equal(result.status, 500);
  assert.deepEqual(result.data, { message: 'An unexpected server error occurred.' });
});

test('Mongoose validation errors become 400 responses', async t => {
  t.mock.method(Application, 'create', async () => {
    await new Application({ company: '', role: 'Developer' }).validate();
  });
  const result = await request('POST', '', { company: 'Example', role: 'Developer' });
  assert.equal(result.status, 400);
  assert.equal(result.data.message, 'Validation failed.');
  assert.ok(result.data.errors.length);
});

test('startup fails clearly without MongoDB configuration', () => {
  const result = spawnSync(process.execPath, ['src/server.js'], {
    env: { ...process.env, MONGODB_URI: '', PORT: '5000' }, encoding: 'utf8', timeout: 5000,
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Startup failed/);
  assert.doesNotMatch(result.stdout, /Server listening/);
});

test('startup rejects an invalid port before attempting a connection', () => {
  const result = spawnSync(process.execPath, ['src/server.js'], {
    env: { ...process.env, MONGODB_URI: '', PORT: 'invalid' }, encoding: 'utf8', timeout: 5000,
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Startup failed/);
  assert.doesNotMatch(result.stdout, /Server listening/);
});
