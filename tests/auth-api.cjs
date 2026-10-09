// Run: node tests/auth-api.cjs. Exercises the actual handler with a mocked upstream.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const ts = require('typescript');
const { NextRequest } = require('next/server');
const path = require('node:path');
const compile = (file) => ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const load = (file) => { const mod = new Module(file, module); mod.filename = file; mod.paths = module.paths; mod._compile(compile(file), file); return mod.exports; };
const routeFile = path.resolve('app/api/auth/[action]/route.ts');
const routeSource = fs.readFileSync(routeFile, 'utf8').replace('@/lib/auth/origin', path.resolve('lib/auth/origin.js').replace(/\\/g, '/'));
const routeMod = new Module(routeFile, module);
routeMod.filename = routeFile;
routeMod.paths = module.paths;
routeMod._compile(ts.transpileModule(routeSource, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, routeFile);
const { POST } = routeMod.exports;
let calls = [];
let result = { error: false, token: 'test-session', guestId: 'guest-42' };
let status = 200;
global.fetch = async (url, options) => { calls.push({ url, options, body: JSON.parse(options.body) }); return Response.json(result, { status }); };
const request = (action, data, headers = {}) => POST(new NextRequest(`http://localhost:3000/api/auth/${action}`, { method: 'POST', headers: { origin: 'http://localhost:3000', 'content-type': 'application/json', ...headers }, body: JSON.stringify(data) }), { params: Promise.resolve({ action }) });
(async () => {
  let response = await request('login', { email: ' user@example.com ', password: 'password', remember: true });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { error: false });
  assert.deepEqual(calls.at(-1).body, { handle: 'user@example.com', password: 'password' });
  assert.match(response.headers.get('set-cookie'), /coinzy_session=test-session/);
  assert.match(response.headers.get('set-cookie'), /HttpOnly/);
  assert.match(response.headers.get('set-cookie'), /SameSite=lax/i);
  assert.match(response.headers.get('set-cookie'), /Max-Age=/);
  response = await request('signup', { email: 'user@example.com', password: 'password', name: ' Collector ', timezone: 'Asia/Kolkata', language: 'en' }, { cookie: 'coinzy_guest_id=guest-42' });
  assert.equal(response.status, 200);
  assert.deepEqual(calls.at(-1).body, { email: 'user@example.com', fullName: 'Collector', password: 'password', confirmPass: 'password', timezone: 'Asia/Kolkata', language: 'en', guestId: 'guest-42' });
  assert.doesNotMatch(response.headers.get('set-cookie'), /Max-Age=/);
  response = await request('guest', {}, { cookie: 'coinzy_guest_id=guest-42' });
  assert.equal(response.status, 200);
  assert.deepEqual(calls.at(-1).body, { guestId: 'guest-42' });
  assert.match(response.headers.get('set-cookie'), /coinzy_guest_id=guest-42/);
  result = { error: false };
  response = await request('forgot', { email: 'user@example.com' });
  assert.equal(response.status, 200);
  assert.deepEqual(calls.at(-1).body, { handle: 'user@example.com' });
  response = await request('reset', { email: 'user@example.com', password: 'newpassword', code: '123456' });
  assert.equal(response.status, 200);
  assert.deepEqual(calls.at(-1).body, { email: 'user@example.com', password: 'newpassword', token: '123456' });
  assert.equal(response.headers.get('set-cookie'), null);
  result = { error: true, reason: 'Incorrect password' };
  response = await request('login', { email: 'user@example.com', password: 'password' });
  assert.equal(response.status, 400);
  assert.equal((await response.json()).reason, 'Incorrect password');
  assert.equal(response.headers.get('set-cookie'), null);
  result = { error: false };
  assert.equal((await request('login', { email: 'user@example.com', password: 'password' })).status, 502);
  result = { error: false, token: 'google-session', user: { email: 'collector@gmail.com' } };
  status = 200;
  response = await request('google', { credential: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.payload.sig', fullName: ' Example Collector ' });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { error: false, email: 'collector@gmail.com' });
  assert.equal(calls.at(-1).url.includes('/auth/social-login/google'), true);
  assert.deepEqual(calls.at(-1).body, { credential: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.payload.sig', fullName: 'Example Collector' });
  assert.match(response.headers.get('set-cookie'), /coinzy_session=google-session/);
  assert.equal((await request('google', {})).status, 400);
  assert.equal((await request('login', { email: 'bad', password: 'password' })).status, 400);
  assert.equal((await request('reset', { email: 'user@example.com', password: 'password', code: 'bad' })).status, 400);
  assert.equal((await request('guest', {}, { origin: 'https://other.example' })).status, 403);
  result = { error: false, token: 'test-session', guestId: 'guest-42' };
  status = 200;
  const count = calls.length;
  response = await POST(
    new NextRequest('http://localhost:3000/api/auth/guest', {
      method: 'POST',
      headers: { origin: 'http://127.0.0.1:3000', 'content-type': 'application/json' },
      body: JSON.stringify({}),
    }),
    { params: Promise.resolve({ action: 'guest' }) },
  );
  assert.equal(response.status, 200);
  assert.equal(calls.length, count + 1);
  result = { error: true, reason: 'Service unavailable' }; status = 503;
  assert.equal((await request('guest', {})).status, 502);
  global.fetch = async () => { throw new Error('Network unavailable'); };
  assert.equal((await request('guest', {})).status, 502);
  console.log('PASS: auth contracts (incl. google), cookies, guest reuse, validation, origin checks and upstream errors');
})().catch(error => { console.error(error); process.exitCode = 1; });
