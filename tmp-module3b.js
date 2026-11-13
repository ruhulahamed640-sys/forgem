/* Follow-up capture for Module 3: verifies the additive changes made after the
 * main capture run (topicProgress in subject trees, 409 on rename-to-existing).
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:4000/api/v1';
const OUT = path.join(__dirname, 'tmp-m3');
fs.mkdirSync(OUT, { recursive: true });

const EMAIL = 'module3.owner@studypilot.test';
const EMAIL2 = 'module3.other@studypilot.test';

const prisma = new PrismaClient({
  datasources: { db: { url: `${process.env.DIRECT_DATABASE_URL}&connection_limit=1` } },
});

const results = [];

function sign(user, session) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const body = Buffer.from(
    JSON.stringify({
      id: user.id,
      email: user.email,
      roles: ['STUDENT'],
      sessionId: session.id,
      clientId: 'web-app',
      iat: now,
      exp: now + 3600,
    }),
  ).toString('base64url');
  const sig = crypto
    .createHmac('sha256', process.env.JWT_ACCESS_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');
  return `${header}.${body}.${sig}`;
}

async function call(label, method, url, opts = {}) {
  const started = Date.now();
  const headers = {};
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json';
  const res = await fetch(BASE + url, {
    method,
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    signal: AbortSignal.timeout(120000),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }
  const entry = {
    label,
    request: { method, path: url, body: opts.body },
    status: res.status,
    durationMs: Date.now() - started,
    response: json,
  };
  results.push(entry);
  console.log(label, res.status, `${entry.durationMs}ms`);
  return entry;
}

async function seedUser(email) {
  const role = await prisma.role.findUnique({ where: { name: 'STUDENT' } });
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: 'capture-script-no-login',
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
      profile: { create: { firstName: 'Module3', lastName: 'Capture' } },
      settings: { create: {} },
      userPoints: { create: {} },
      ...(role ? { userRoles: { create: { roleId: role.id } } } : {}),
    },
  });
  const session = await prisma.userSession.create({
    data: {
      userId: user.id,
      clientId: 'web-app',
      deviceName: 'module3-capture',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });
  return { user, token: sign(user, session) };
}

async function cleanup() {
  await prisma.user.deleteMany({ where: { email: { in: [EMAIL, EMAIL2] } } });
}

(async () => {
  await cleanup();
  const owner = await seedUser(EMAIL);
  const other = await seedUser(EMAIL2);

  const s1 = await call('b.subject.create', 'POST', '/subjects', {
    token: owner.token,
    body: { name: 'Computer Networks' },
  });
  const s1id = s1.response.data.id;
  const s2 = await call('b.subject.create.second', 'POST', '/subjects', {
    token: owner.token,
    body: { name: 'Computer Architecture' },
  });
  const s2id = s2.response.data.id;

  await call('b.subject.rename-existing', 'PATCH', `/subjects/${s2id}`, {
    token: owner.token,
    body: { name: 'computer networks' },
  });
  await call('b.subjects.search-name', 'GET', '/subjects?search=computer', { token: owner.token });

  const ch = await call('b.chapter.create', 'POST', '/chapters', {
    token: owner.token,
    body: { subjectId: s1id, title: 'The Link Layer', orderIndex: 1 },
  });
  const chid = ch.response.data.id;
  const ch2 = await call('b.chapter.create.second', 'POST', '/chapters', {
    token: owner.token,
    body: { subjectId: s1id, title: 'The Network Layer', orderIndex: 1 },
  });
  const ch2id = ch2.response.data.id;
  const ch3 = await call('b.chapter.create.third', 'POST', '/chapters', {
    token: owner.token,
    body: { subjectId: s1id, title: 'Transport Layer', orderIndex: 2 },
  });
  const ch3id = ch3.response.data.id;
  await call('b.chapter.reorder.transport-to-1', 'PATCH', `/chapters/${ch3id}`, {
    token: owner.token,
    body: { orderIndex: 1 },
  });
  await call('b.chapter.reorder.transport-to-3', 'PATCH', `/chapters/${ch3id}`, {
    token: owner.token,
    body: { orderIndex: 3 },
  });
  const t = await call('b.topic.create', 'POST', '/chapters/topics', {
    token: owner.token,
    body: { chapterId: chid, title: 'Ethernet & Switching', orderIndex: 1 },
  });
  const tid = t.response.data.id;
  const t2 = await call('b.topic.create.second', 'POST', '/chapters/topics', {
    token: owner.token,
    body: { chapterId: chid, title: 'ARP & VLANs', orderIndex: 1 },
  });
  const t2id = t2.response.data.id;
  await call('b.topic.reorder.arp-to-2', 'PATCH', `/topics/${t2id}`, {
    token: owner.token,
    body: { orderIndex: 2 },
  });
  await call('b.topic.complete', 'POST', `/topics/${tid}/complete`, { token: owner.token });
  await call('b.subject.detail', 'GET', `/subjects/${s1id}`, { token: owner.token });
  await call('b.subjects.list', 'GET', '/subjects', { token: owner.token });
  await call('b.other.subject.detail', 'GET', `/subjects/${s1id}`, { token: other.token });

  fs.writeFileSync(path.join(OUT, 'followup-results.json'), JSON.stringify(results, null, 2));

  await cleanup();
  await prisma.$disconnect();
  console.log('DONE');
})().catch(async (error) => {
  console.error(error);
  try {
    await cleanup();
  } catch {}
  await prisma.$disconnect();
  process.exit(1);
});
