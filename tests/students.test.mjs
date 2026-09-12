import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  closeDb,
  getStudents,
  initDb,
  upsertStudent
} from '../teacher-dashboard/db.mjs';

test('importar un repositori sense nom conserva el nom existent', t => {
  const fixture = mkdtempSync(path.join(tmpdir(), 'dwes-students-'));
  const dbPath = path.join(fixture, 'dashboard.db');

  t.after(() => {
    closeDb();
    rmSync(fixture, { recursive: true, force: true });
  });

  initDb(dbPath);
  upsertStudent('centre/alumna-01', '2DAW-A', 'Anna Garcia');

  // La importació des de course només aporta repositori i grup.
  upsertStudent('centre/alumna-01', '2DAW-B', null);

  const [student] = getStudents();
  assert.equal(student.student_name, 'Anna Garcia');
  assert.equal(student.group_name, '2DAW-B');
});

test('importar un nom nou actualitza el nom existent', t => {
  const fixture = mkdtempSync(path.join(tmpdir(), 'dwes-students-'));
  const dbPath = path.join(fixture, 'dashboard.db');

  t.after(() => {
    closeDb();
    rmSync(fixture, { recursive: true, force: true });
  });

  initDb(dbPath);
  upsertStudent('centre/alumna-01', '2DAW-A', 'Nom anterior');
  upsertStudent('centre/alumna-01', '2DAW-A', 'Nom corregit');

  const [student] = getStudents();
  assert.equal(student.student_name, 'Nom corregit');
});
