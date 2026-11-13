/* Temporary live-capture script for Module 3 (Syllabus Management).
 * Seeds two throw-away users, exercises every syllabus route, writes raw
 * request/response captures to tmp-m3/, then deletes the throw-away users.
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:4000/api/v1';
const OUT = path.join(__dirname, 'tmp-m3');
fs.mkdirSync(OUT, { recursive: true });

const OWNER_EMAIL = 'module3.owner@studypilot.test';
const OTHER_EMAIL = 'module3.other@studypilot.test';

const prisma = new PrismaClient({
  datasources: {
    db: { url: `${process.env.DIRECT_DATABASE_URL}&connection_limit=1` },
  },
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
  let res;
  try {
    res = await fetch(BASE + url, {
      method,
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      signal: AbortSignal.timeout(120000),
    });
  } catch (error) {
    const entry = {
      label,
      request: { method, path: url, body: opts.body },
      status: 'NETWORK_ERROR',
      error: String(error && error.message),
    };
    results.push(entry);
    console.log(label, 'NETWORK_ERROR', entry.error);
    return entry;
  }
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }
  const rh = {};
  for (const [k, v] of res.headers) {
    if (/^(retry-after|x-ratelimit|content-type)/i.test(k)) rh[k] = v;
  }
  const entry = {
    label,
    request: { method, path: url, body: opts.body },
    status: res.status,
    headers: rh,
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
  await prisma.user.deleteMany({ where: { email: { in: [OWNER_EMAIL, OTHER_EMAIL] } } });
}

(async () => {
  const health = await call('health.check', 'GET', '/health');
  if (health.status !== 200) {
    console.error('Server is not healthy; aborting.');
    await prisma.$disconnect();
    process.exit(1);
  }

  await cleanup();

  const owner = await seedUser(OWNER_EMAIL);
  const other = await seedUser(OTHER_EMAIL);

  // ---------------------------------------------------------------- auth 401
  await call('auth.missing-token', 'GET', '/subjects');
  await call('auth.bad-token', 'GET', '/subjects', { token: 'not.a.jwt' });

  // ------------------------------------------- academic years / semesters
  await call('academic-years.list', 'GET', '/academic-years', { token: owner.token });
  await call('academic-years.create', 'POST', '/academic-years', {
    token: owner.token,
    body: { name: '2026-2027', startDate: '2026-01-01', endDate: '2026-12-31' },
  });
  await call('semesters.list', 'GET', '/semesters', { token: owner.token });
  await call('subjects.semester-filter', 'GET', '/subjects?semesterId=00000000-0000-4000-8000-000000000000', {
    token: owner.token,
  });

  // ------------------------------------------------- subject validation 400
  await call('subject.create.empty-name', 'POST', '/subjects', { token: owner.token, body: { name: '' } });
  await call('subject.create.long-name', 'POST', '/subjects', {
    token: owner.token,
    body: { name: 'x'.repeat(151) },
  });
  await call('subject.create.weekly-too-low', 'POST', '/subjects', {
    token: owner.token,
    body: { name: 'Too Low', targetWeeklyMinutes: 5 },
  });
  await call('subject.create.weekly-too-high', 'POST', '/subjects', {
    token: owner.token,
    body: { name: 'Too High', targetWeeklyMinutes: 3001 },
  });
  await call('subject.create.icon-too-long', 'POST', '/subjects', {
    token: owner.token,
    body: { name: 'Long Icon', icon: 'i'.repeat(65) },
  });
  await call('subject.create.reject-academic-year', 'POST', '/subjects', {
    token: owner.token,
    body: { name: 'With Year', academicYearId: '00000000-0000-4000-8000-000000000000' },
  });
  await call('subject.create.reject-class', 'POST', '/subjects', {
    token: owner.token,
    body: { name: 'With Class', classId: '00000000-0000-4000-8000-000000000000' },
  });
  await call('subject.create.reject-archived', 'POST', '/subjects', {
    token: owner.token,
    body: { name: 'Archived On Create', isArchived: true },
  });

  // ------------------------------------------------------- subject defaults
  const s1 = await call('subject.create.defaults', 'POST', '/subjects', {
    token: owner.token,
    body: { name: 'Operating Systems & Concurrency' },
  });
  const s1id = s1.response?.data?.id;

  const s1detail = await call('subject.get.after-create', 'GET', `/subjects/${s1id}`, { token: owner.token });

  await call('subject.create.duplicate-same-case', 'POST', '/subjects', {
    token: owner.token,
    body: { name: 'Operating Systems & Concurrency' },
  });
  await call('subject.create.duplicate-different-case', 'POST', '/subjects', {
    token: owner.token,
    body: { name: 'operating systems & concurrency' },
  });
  await call('subject.create.duplicate-trimmed', 'POST', '/subjects', {
    token: owner.token,
    body: { name: '  Operating Systems & Concurrency  ' },
  });

  const s2 = await call('subject.create.custom', 'POST', '/subjects', {
    token: owner.token,
    body: {
      name: 'Database Systems',
      code: 'CS-302',
      colorHex: '#0EA5E9',
      icon: 'database',
      targetWeeklyMinutes: 240,
    },
  });
  const s2id = s2.response?.data?.id;

  await call('subjects.list.default', 'GET', '/subjects', { token: owner.token });
  await call('subjects.list.archived-false', 'GET', '/subjects?archived=false', { token: owner.token });
  await call('subjects.list.archived-true-empty', 'GET', '/subjects?archived=true', { token: owner.token });
  await call('subjects.list.archived-all', 'GET', '/subjects?archived=all', { token: owner.token });
  await call('subjects.list.search-name', 'GET', '/subjects?search=database', { token: owner.token });
  await call('subjects.list.search-code', 'GET', '/subjects?search=cs-30', { token: owner.token });
  await call('subjects.list.search-no-match', 'GET', '/subjects?search=zzz-nope', { token: owner.token });
  await call('subjects.list.unknown-params-ignored', 'GET', '/subjects?semesterId=abc&page=2&limit=5', {
    token: owner.token,
  });

  // --------------------------------------------------------- subject updates
  await call('subject.update.fields', 'PATCH', `/subjects/${s1id}`, {
    token: owner.token,
    body: {
      name: 'Operating Systems',
      code: 'CS-301',
      colorHex: '#2563EB',
      icon: 'cpu',
      targetWeeklyMinutes: 300,
    },
  });
  await call('subject.update.empty-name', 'PATCH', `/subjects/${s1id}`, {
    token: owner.token,
    body: { name: '' },
  });
  await call('subject.update.unknown-field', 'PATCH', `/subjects/${s1id}`, {
    token: owner.token,
    body: { semesterId: '00000000-0000-4000-8000-000000000000' },
  });
  await call('subject.update.rename-to-existing', 'PATCH', `/subjects/${s1id}`, {
    token: owner.token,
    body: { name: 'database systems' },
  });

  // ------------------------------------------------------- archive/restore
  await call('subject.archive', 'PATCH', `/subjects/${s1id}`, { token: owner.token, body: { isArchived: true } });
  await call('subjects.list.after-archive-default', 'GET', '/subjects', { token: owner.token });
  await call('subjects.list.after-archive-true', 'GET', '/subjects?archived=true', { token: owner.token });
  await call('subjects.list.after-archive-all', 'GET', '/subjects?archived=all', { token: owner.token });
  await call('subject.get.archived-by-id', 'GET', `/subjects/${s1id}`, { token: owner.token });
  await call('subject.restore', 'PATCH', `/subjects/${s1id}`, { token: owner.token, body: { isArchived: false } });

  // ------------------------------------------------------- ownership/errors
  await call('subject.get.malformed-id', 'GET', '/subjects/not-a-uuid', { token: owner.token });
  await call('subject.get.unknown-id', 'GET', '/subjects/00000000-0000-4000-8000-000000000000', {
    token: owner.token,
  });
  await call('subject.get.other-users-subject', 'GET', `/subjects/${s1id}`, { token: other.token });
  await call('subject.patch.other-users-subject', 'PATCH', `/subjects/${s1id}`, {
    token: other.token,
    body: { name: 'Hijack' },
  });
  await call('subject.delete.other-users-subject', 'DELETE', `/subjects/${s1id}`, { token: other.token });
  await call('subject.put-not-allowed', 'PUT', `/subjects/${s1id}`, { token: owner.token, body: { name: 'X' } });
  await call('subjects.put-collection-not-allowed', 'PUT', '/subjects', { token: owner.token, body: { name: 'X' } });

  // -------------------------------------------------------- chapter creates
  await call('chapter.create.invalid-subject-uuid', 'POST', '/chapters', {
    token: owner.token,
    body: { subjectId: 'nope', title: 'Bad', orderIndex: 1 },
  });
  await call('chapter.create.unknown-subject', 'POST', '/chapters', {
    token: owner.token,
    body: { subjectId: '00000000-0000-4000-8000-000000000000', title: 'Bad', orderIndex: 1 },
  });
  await call('chapter.create.other-users-subject', 'POST', '/chapters', {
    token: other.token,
    body: { subjectId: s1id, title: 'Bad', orderIndex: 1 },
  });
  await call('chapter.create.missing-title', 'POST', '/chapters', {
    token: owner.token,
    body: { subjectId: s1id, orderIndex: 1 },
  });
  await call('chapter.create.long-title', 'POST', '/chapters', {
    token: owner.token,
    body: { subjectId: s1id, title: 'c'.repeat(201), orderIndex: 1 },
  });
  await call('chapter.create.too-short-estimate', 'POST', '/chapters', {
    token: owner.token,
    body: { subjectId: s1id, title: 'Short', orderIndex: 1, estimatedMinutes: 3 },
  });
  await call('chapter.create.zero-order', 'POST', '/chapters', {
    token: owner.token,
    body: { subjectId: s1id, title: 'Zero', orderIndex: 0 },
  });

  const cA = await call('chapter.create.A-first', 'POST', '/chapters', {
    token: owner.token,
    body: {
      subjectId: s1id,
      title: 'Foundations',
      orderIndex: 1,
      description: 'Processes, threads, and scheduling.',
      estimatedMinutes: 90,
    },
  });
  const cAid = cA.response?.data?.id;

  const cB = await call('chapter.create.B-insert-at-1', 'POST', '/chapters', {
    token: owner.token,
    body: { subjectId: s1id, title: 'Memory Management', orderIndex: 1 },
  });
  const cBid = cB.response?.data?.id;

  const cC = await call('chapter.create.C-insert-at-2', 'POST', '/chapters', {
    token: owner.token,
    body: { subjectId: s1id, title: 'File Systems', orderIndex: 2 },
  });
  const cCid = cC.response?.data?.id;

  const treeAfterChapters = await call('subject.get.tree-after-chapters', 'GET', `/subjects/${s1id}`, {
    token: owner.token,
  });

  // ------------------------------------------------------- chapter updates
  await call('chapter.update.fields', 'PATCH', `/chapters/${cBid}`, {
    token: owner.token,
    body: { title: 'Memory & Virtual Memory', description: 'Paging and segmentation.', estimatedMinutes: 120 },
  });
  await call('chapter.update.unknown-field', 'PATCH', `/chapters/${cBid}`, {
    token: owner.token,
    body: { subjectId: s2id },
  });
  await call('chapter.update.other-user', 'PATCH', `/chapters/${cBid}`, {
    token: other.token,
    body: { title: 'Hijack' },
  });
  await call('chapter.patch.unknown-id', 'PATCH', `/chapters/00000000-0000-4000-8000-000000000000`, {
    token: owner.token,
    body: { title: 'Ghost' },
  });
  await call('chapter.patch.malformed-id', 'PATCH', '/chapters/abc', { token: owner.token, body: { title: 'Ghost' } });

  // ------------------------------------------------------------- reordering
  const reorder = await call('chapter.reorder.C-to-1', 'PATCH', `/chapters/${cCid}`, {
    token: owner.token,
    body: { orderIndex: 1 },
  });
  const treeAfterReorder = await call('subject.get.tree-after-reorder', 'GET', `/subjects/${s1id}`, {
    token: owner.token,
  });
  await call('chapter.reorder.huge-index-clamped', 'PATCH', `/chapters/${cAid}`, {
    token: owner.token,
    body: { orderIndex: 999 },
  });
  const treeAfterClamp = await call('subject.get.tree-after-clamp', 'GET', `/subjects/${s1id}`, {
    token: owner.token,
  });

  // reset a clean order: Foundations, Memory, File
  await call('chapter.reorder.foundations-to-1', 'PATCH', `/chapters/${cAid}`, {
    token: owner.token,
    body: { orderIndex: 1 },
  });
  await call('chapter.reorder.memory-to-2', 'PATCH', `/chapters/${cBid}`, {
    token: owner.token,
    body: { orderIndex: 2 },
  });
  await call('chapter.reorder.file-to-3', 'PATCH', `/chapters/${cCid}`, {
    token: owner.token,
    body: { orderIndex: 3 },
  });

  // ---------------------------------------------------------- topic creates
  await call('topic.create.invalid-chapter-uuid', 'POST', '/chapters/topics', {
    token: owner.token,
    body: { chapterId: 'nope', title: 'Bad', orderIndex: 1 },
  });
  await call('topic.create.unknown-chapter', 'POST', '/chapters/topics', {
    token: owner.token,
    body: { chapterId: '00000000-0000-4000-8000-000000000000', title: 'Bad', orderIndex: 1 },
  });
  await call('topic.create.other-users-chapter', 'POST', '/chapters/topics', {
    token: other.token,
    body: { chapterId: cAid, title: 'Bad', orderIndex: 1 },
  });
  await call('topic.create.reject-is-completed', 'POST', '/chapters/topics', {
    token: owner.token,
    body: { chapterId: cAid, title: 'Bad', orderIndex: 1, isCompleted: true },
  });
  await call('topic.create.bad-difficulty', 'POST', '/chapters/topics', {
    token: owner.token,
    body: { chapterId: cAid, title: 'Bad', orderIndex: 1, difficultyLevel: 9 },
  });

  const t1 = await call('topic.create.t1-position-1', 'POST', '/chapters/topics', {
    token: owner.token,
    body: {
      chapterId: cAid,
      title: 'Process Lifecycle',
      orderIndex: 1,
      difficultyLevel: 2,
      contentSummary: 'States, PCB, context switching.',
      estimatedMinutes: 45,
    },
  });
  const t1id = t1.response?.data?.id;

  const t2 = await call('topic.create.t2-insert-at-1', 'POST', '/chapters/topics', {
    token: owner.token,
    body: { chapterId: cAid, title: 'Threads & Concurrency', orderIndex: 1 },
  });
  const t2id = t2.response?.data?.id;

  const t3 = await call('topic.create.t3-insert-at-2', 'POST', '/chapters/topics', {
    token: owner.token,
    body: { chapterId: cAid, title: 'CPU Scheduling', orderIndex: 2 },
  });
  const t3id = t3.response?.data?.id;

  await call('subject.get.tree-after-topics', 'GET', `/subjects/${s1id}`, { token: owner.token });
  await call('topic.update.fields', 'PATCH', `/topics/${t1id}`, {
    token: owner.token,
    body: {
      title: 'Process Lifecycle & PCB',
      difficultyLevel: 3,
      contentSummary: 'States, PCB, context switching, fork/exec.',
      estimatedMinutes: 60,
      orderIndex: 3,
    },
  });
  await call('topic.update.unknown-field', 'PATCH', `/topics/${t1id}`, {
    token: owner.token,
    body: { isCompleted: true },
  });
  await call('topic.update.other-user', 'PATCH', `/topics/${t1id}`, {
    token: other.token,
    body: { title: 'Hijack' },
  });
  await call('topic.patch.unknown-id', 'PATCH', '/topics/00000000-0000-4000-8000-000000000000', {
    token: owner.token,
    body: { title: 'Ghost' },
  });
  await call('topic.patch.malformed-id', 'PATCH', '/topics/abc', { token: owner.token, body: { title: 'Ghost' } });

  // reset topic order t1,t2,t3
  await call('topic.reorder.t1-to-1', 'PATCH', `/topics/${t1id}`, { token: owner.token, body: { orderIndex: 1 } });
  await call('topic.reorder.t2-to-2', 'PATCH', `/topics/${t2id}`, { token: owner.token, body: { orderIndex: 2 } });
  await call('topic.reorder.t3-to-3', 'PATCH', `/topics/${t3id}`, { token: owner.token, body: { orderIndex: 3 } });
  await call('topic.reorder.t3-to-1', 'PATCH', `/topics/${t3id}`, { token: owner.token, body: { orderIndex: 1 } });
  await call('subject.get.tree-after-topic-reorder', 'GET', `/subjects/${s1id}`, { token: owner.token });
  await call('topic.reorder.t3-back-to-3', 'PATCH', `/topics/${t3id}`, { token: owner.token, body: { orderIndex: 3 } });

  // ------------------------------------------------------ topic completion
  const completeT1 = await call('topic.complete.t1', 'POST', `/topics/${t1id}/complete`, { token: owner.token });
  await call('topic.complete.t1-again-idempotent', 'POST', `/topics/${t1id}/complete`, { token: owner.token });
  await call('subjectProgress.after-topic-complete', 'GET', '/analytics/subject-progress', { token: owner.token });
  await call('subject.get.progress-after-topic-complete', 'GET', `/subjects/${s1id}`, { token: owner.token });

  await call('topic.uncomplete.t1', 'POST', `/topics/${t1id}/uncomplete`, { token: owner.token });
  await call('subjectProgress.after-topic-uncomplete', 'GET', '/analytics/subject-progress', { token: owner.token });

  await call('topic.complete.t1-second', 'POST', `/topics/${t1id}/complete`, { token: owner.token });
  await call('topic.complete.t2', 'POST', `/topics/${t2id}/complete`, { token: owner.token });
  const progressTwoTopics = await call('subjectProgress.two-topics', 'GET', '/analytics/subject-progress', {
    token: owner.token,
  });

  // ---------------------------------------------------- chapter completion
  const chapA1 = await call('chapter.complete.A', 'POST', `/chapters/${cAid}/complete`, { token: owner.token });
  await call('subjectProgress.after-chapter-A', 'GET', '/analytics/subject-progress', { token: owner.token });
  const chapB1 = await call('chapter.complete.B', 'POST', `/chapters/${cBid}/complete`, { token: owner.token });
  await call('subjectProgress.after-chapter-B', 'GET', '/analytics/subject-progress', { token: owner.token });
  const chapA2 = await call('chapter.uncomplete.A', 'POST', `/chapters/${cAid}/uncomplete`, { token: owner.token });
  await call('subjectProgress.after-chapter-A-uncomplete', 'GET', '/analytics/subject-progress', {
    token: owner.token,
  });
  await call('chapter.complete.A-again', 'POST', `/chapters/${cAid}/complete`, { token: owner.token });
  await call('chapter.complete.C', 'POST', `/chapters/${cCid}/complete`, { token: owner.token });
  await call('subjectProgress.all-chapters-complete', 'GET', '/analytics/subject-progress', {
    token: owner.token,
  });
  await call('chapter.complete.other-user', 'POST', `/chapters/${cAid}/complete`, { token: other.token });
  await call('chapter.complete.unknown-id', 'POST', '/chapters/00000000-0000-4000-8000-000000000000/complete', {
    token: owner.token,
  });
  await call('chapter.complete.malformed-id', 'POST', '/chapters/abc/complete', { token: owner.token });
  await call('topic.complete.other-user', 'POST', `/topics/${t1id}/complete`, { token: other.token });
  await call('topic.complete.unknown-id', 'POST', '/topics/00000000-0000-4000-8000-000000000000/complete', {
    token: owner.token,
  });

  // ------------------------------------------------------------- deletions
  await call('topic.delete.other-user', 'DELETE', `/topics/${t3id}`, { token: other.token });
  await call('topic.delete.t3', 'DELETE', `/topics/${t3id}`, { token: owner.token });
  await call('topic.delete.t3-again', 'DELETE', `/topics/${t3id}`, { token: owner.token });
  await call('subjectProgress.after-topic-delete', 'GET', '/analytics/subject-progress', { token: owner.token });

  await call('chapter.delete.other-user', 'DELETE', `/chapters/${cCid}`, { token: other.token });
  await call('chapter.delete.C-with-topics', 'DELETE', `/chapters/${cCid}`, { token: owner.token });
  await call('chapter.delete.C-again', 'DELETE', `/chapters/${cCid}`, { token: owner.token });
  await call('subjectProgress.after-chapter-delete', 'GET', '/analytics/subject-progress', { token: owner.token });
  await call('subject.get.after-chapter-delete', 'GET', `/subjects/${s1id}`, { token: owner.token });

  // ------------------------------------------------------------- rate limit
  // 105 concurrent requests to the same handler; the 100/min/IP bucket for
  // GET /health must overflow without affecting GET /subjects.
  const burst = await Promise.all(
    Array.from({ length: 105 }, (_, i) => call(`ratelimit.health.${i + 1}`, 'GET', '/health')),
  );
  const blocked = burst.filter((b) => b.status === 429);
  const allowed = burst.filter((b) => b.status === 200);
  fs.writeFileSync(
    path.join(OUT, 'ratelimit-summary.json'),
    JSON.stringify(
      {
        total: burst.length,
        allowed: allowed.length,
        blocked: blocked.length,
        firstBlocked: blocked[0] || null,
        lastBlocked: blocked[blocked.length - 1] || null,
        firstAllowed: allowed[0] || null,
        lastAllowed: allowed[allowed.length - 1] || null,
      },
      null,
      2,
    ),
  );
  console.log(`ratelimit burst: ${allowed.length} allowed, ${blocked.length} blocked`);
  await call('ratelimit.subjects-still-ok', 'GET', '/subjects', { token: owner.token });

  // ------------------------------------------------------- subject deletion
  await call('subject.delete.s2', 'DELETE', `/subjects/${s2id}`, { token: owner.token });
  await call('subject.delete.s1-cascade', 'DELETE', `/subjects/${s1id}`, { token: owner.token });
  await call('subject.get.after-delete', 'GET', `/subjects/${s1id}`, { token: owner.token });
  await call('subjects.list.after-delete', 'GET', '/subjects', { token: owner.token });

  const summary = results.map((r) => ({
    label: r.label,
    method: r.request.method,
    path: r.request.path,
    status: r.status,
    durationMs: r.durationMs,
    errorCode: r.response && r.response.error ? r.response.error.code : undefined,
  }));
  fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify(results, null, 2));
  fs.writeFileSync(path.join(OUT, 'summary.json'), JSON.stringify(summary, null, 2));

  const lines = ['# Module 3 capture summary', '', '| # | Label | Method | Path | Status | Error code | ms |', '|---|---|---|---|---|---|---|'];
  summary.forEach((s, i) => {
    lines.push(`| ${i + 1} | ${s.label} | ${s.method} | ${s.path} | ${s.status} | ${s.errorCode || ''} | ${s.durationMs} |`);
  });
  fs.writeFileSync(path.join(OUT, 'summary.md'), lines.join('\n'));

  // extras used while writing the doc
  const extras = {
    ownerId: owner.user.id,
    subject1Id: s1id,
    subject2Id: s2id,
    chapterAId: cAid,
    chapterBId: cBid,
    chapterCId: cCid,
    topic1Id: t1id,
    topic2Id: t2id,
    topic3Id: t3id,
    details: {
      subjectDefaults: s1.response,
      subjectDetailAfterCreate: s1detail.response,
      chapterInsertA: cA.response?.data,
      chapterInsertB: cB.response?.data,
      chapterInsertC: cC.response?.data,
      treeAfterChapters: treeAfterChapters.response?.data,
      reorder: reorder.response?.data,
      treeAfterReorder: treeAfterReorder.response?.data,
      treeAfterClamp: treeAfterClamp.response?.data,
      progressTwoTopics: progressTwoTopics.response?.data,
      chapterAComplete: chapA1.response?.data,
      chapterBComplete: chapB1.response?.data,
      chapterAUncomplete: chapA2.response?.data,
      completeT1: completeT1.response?.data,
    },
  };
  fs.writeFileSync(path.join(OUT, 'extras.json'), JSON.stringify(extras, null, 2));

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
