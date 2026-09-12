import test from 'node:test';
import assert from 'node:assert/strict';
import Database from 'better-sqlite3';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { initDb, closeDb, insertClassroomSessionNote, getClassroomSessionNotes } from '../teacher-dashboard/db.mjs';

test('migració conserva notes antigues i diferencia grups de la mateixa sessió', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'dwes-notes-'));
  const file = path.join(dir, 'test.db');
  try {
    const old = new Database(file);
    old.exec("CREATE TABLE classroom_session_notes (id INTEGER PRIMARY KEY, session_id TEXT NOT NULL, session_date TEXT NOT NULL, comment TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP)");
    old.prepare('INSERT INTO classroom_session_notes (session_id, session_date, comment) VALUES (?, ?, ?)').run('R1S1', '2026-09-01', 'Nota anterior');
    old.close();
    initDb(file);
    insertClassroomSessionNote('R1S1', '2026-09-07', 'Bon ritme', '2DAW-A');
    insertClassroomSessionNote('R1S1', '2026-09-07', 'Cal reforç', '2DAW-C');
    let notes = getClassroomSessionNotes('R1S1');
    assert.equal(notes.length, 3);
    assert.equal(notes.find(n => n.comment === 'Nota anterior').group_name, null);
    assert.equal(notes.find(n => n.comment === 'Bon ritme').group_name, '2DAW-A');
    assert.equal(notes.find(n => n.comment === 'Cal reforç').group_name, '2DAW-C');
    assert.throws(() => insertClassroomSessionNote('R1S1', '2026-09-07', 'Sense grup', ''));
    closeDb(); initDb(file);
    assert.equal(getClassroomSessionNotes('R1S1').length, 3);
  } finally { closeDb(); rmSync(dir, { recursive: true, force: true }); }
});
