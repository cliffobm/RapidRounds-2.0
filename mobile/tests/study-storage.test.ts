import { describe, expect, it } from 'vitest';
import { BACKUP_KEY, LEGACY_KEY, STUDY_KEY, loadStudy, resetStudy, saveStudy, StudyResetError, type ResetStorageAdapter } from '../lib/study-storage';
import { beginSession, initialLearningState, migrateLegacy, restoreLearning, type LearningState } from '../lib/learning';
import { begin, emptyState } from '../lib/mobile';
import { CARDIAC_ITEMS } from '../content/cardiac-pack';
import { catalogItems } from '../content/catalog';

const START = Date.UTC(2026, 8, 11, 12);
const initial = (): LearningState => structuredClone(initialLearningState);
const activeStudy = () => beginSession(initial(), 'learn', catalogItems[0].scenarioId, START, true);

function memoryStorage(values: Record<string, string> = {}) {
  const data = new Map(Object.entries(values));
  const writes: { key: string; value: string }[] = [];
  const removals: string[] = [];
  const failures = new Set<string>();
  const adapter: ResetStorageAdapter = {
    getItem: async key => data.get(key) ?? null,
    setItem: async (key, value) => {
      if (failures.has(key)) throw new Error(`Unable to write ${key}`);
      writes.push({ key, value });
      data.set(key, value);
    },
    removeItem: async key => {
      if(failures.has(key))throw new Error(`Unable to remove ${key}`);
      removals.push(key);
      data.delete(key);
    },
  };
  return { data, writes, removals, failures, adapter };
}

describe('reset durability', () => {
  function priorStorage(){
    const old=JSON.stringify(activeStudy());
    const legacy=JSON.stringify(begin(emptyState,CARDIAC_ITEMS[0].scenarioId,START,[CARDIAC_ITEMS[0]]));
    return {old,legacy,storage:memoryStorage({[STUDY_KEY]:old,[BACKUP_KEY]:old,[LEGACY_KEY]:legacy})};
  }

  it('commits empty primary and backup before removing legacy data, then reloads empty', async () => {
    const {storage}=priorStorage();
    const state=await resetStudy(storage.adapter);
    expect(state).toEqual(initialLearningState);
    expect(storage.writes.map(write=>write.key)).toEqual([STUDY_KEY,BACKUP_KEY]);
    expect(storage.removals).toEqual([LEGACY_KEY]);
    expect(storage.data.has(LEGACY_KEY)).toBe(false);
    expect(JSON.parse(storage.data.get(STUDY_KEY)!)).toEqual(state);
    expect(JSON.parse(storage.data.get(BACKUP_KEY)!)).toEqual(state);
    await expect(loadStudy(storage.adapter,true)).resolves.toEqual({state,recovered:false});
    storage.data.delete(STUDY_KEY);
    await expect(loadStudy(storage.adapter,true)).resolves.toEqual({state,recovered:true});
  });

  it('preserves the prior copies when the primary reset cannot be committed', async () => {
    const {old,legacy,storage}=priorStorage();
    storage.failures.add(STUDY_KEY);
    await expect(resetStudy(storage.adapter)).rejects.toMatchObject({name:'StudyResetError',stage:'primary',committedState:null});
    expect(storage.data.get(STUDY_KEY)).toBe(old);
    expect(storage.data.get(BACKUP_KEY)).toBe(old);
    expect(storage.data.get(LEGACY_KEY)).toBe(legacy);
    expect(storage.removals).toEqual([]);
    expect((await loadStudy(storage.adapter,true)).state.active).toEqual(JSON.parse(old).active);
  });

  it('keeps the empty primary authoritative after a backup-cleanup failure and can finish on retry', async () => {
    const {old,storage}=priorStorage();
    storage.failures.add(BACKUP_KEY);
    let failure:unknown;
    try{await resetStudy(storage.adapter);}catch(error){failure=error;}
    expect(failure).toBeInstanceOf(StudyResetError);
    expect(failure).toMatchObject({stage:'backup',committedState:initialLearningState});
    expect(storage.data.get(BACKUP_KEY)).toBe(old);
    expect(storage.data.has(LEGACY_KEY)).toBe(true);
    await expect(loadStudy(storage.adapter,true)).resolves.toEqual({state:initialLearningState,recovered:false});
    storage.failures.delete(BACKUP_KEY);
    await expect(resetStudy(storage.adapter)).resolves.toEqual(initialLearningState);
    expect(JSON.parse(storage.data.get(BACKUP_KEY)!)).toEqual(initialLearningState);
    expect(storage.data.has(LEGACY_KEY)).toBe(false);
  });

  it('cannot revive legacy data after legacy cleanup fails because both v2 copies are already empty', async () => {
    const {legacy,storage}=priorStorage();
    storage.failures.add(LEGACY_KEY);
    await expect(resetStudy(storage.adapter)).rejects.toMatchObject({stage:'legacy',committedState:initialLearningState});
    expect(storage.data.get(LEGACY_KEY)).toBe(legacy);
    await expect(loadStudy(storage.adapter,true)).resolves.toEqual({state:initialLearningState,recovered:false});
    storage.data.set(STUDY_KEY,'{broken');
    await expect(loadStudy(storage.adapter,true)).resolves.toEqual({state:initialLearningState,recovered:true});
    storage.failures.delete(LEGACY_KEY);
    await resetStudy(storage.adapter);
    expect(storage.data.has(LEGACY_KEY)).toBe(false);
  });

  it('is idempotent and returns fresh state containers on repeated resets', async () => {
    const {storage}=priorStorage();
    const first=await resetStudy(storage.adapter);
    const second=await resetStudy(storage.adapter);
    expect(second).toEqual(first);
    expect(second).not.toBe(first);
    expect(second.history).not.toBe(first.history);
    expect(storage.data.get(STUDY_KEY)).toBe(storage.data.get(BACKUP_KEY));
    await expect(loadStudy(storage.adapter,true)).resolves.toEqual({state:initialLearningState,recovered:false});
  });
});

describe('study storage durability', () => {
  it('keeps withheld preview snapshots through production autosaves and backup rotation', async () => {
    const original = activeStudy();
    const storage = memoryStorage({ [STUDY_KEY]: JSON.stringify(original) });
    const production = await loadStudy(storage.adapter, false);
    expect(production.state.active).toBeNull();
    expect(production.state.history).toEqual([]);
    expect(production.state.withheldSessions).toHaveLength(1);
    for (let i = 0; i < 3; i++) await saveStudy(storage.adapter, production.state);
    for (const key of [STUDY_KEY, BACKUP_KEY]) {
      expect(restoreLearning(storage.data.get(key)!, false).active).toBeNull();
      expect(restoreLearning(storage.data.get(key)!, true).active).toEqual(original.active);
    }
    expect((await loadStudy(storage.adapter, true)).state.active).toEqual(original.active);
  });

  it('loads an empty installation without writing anything', async () => {
    const storage = memoryStorage();
    await expect(loadStudy(storage.adapter, true)).resolves.toEqual({ state: initial(), recovered: false });
    expect(storage.writes).toEqual([]);
  });

  it('migrates a legacy session in memory and keeps the original unchanged after saving v2', async () => {
    const legacy = JSON.stringify(begin(emptyState, CARDIAC_ITEMS[0].scenarioId, START, [CARDIAC_ITEMS[0]]));
    const storage = memoryStorage({ [LEGACY_KEY]: legacy });
    const loaded = await loadStudy(storage.adapter, true);
    expect(loaded).toEqual({ state: migrateLegacy(legacy, true), recovered: false });
    expect(storage.writes).toEqual([]);
    expect(storage.data.get(LEGACY_KEY)).toBe(legacy);
    await saveStudy(storage.adapter, loaded.state);
    expect(storage.data.get(LEGACY_KEY)).toBe(legacy);
    expect(restoreLearning(storage.data.get(STUDY_KEY)!, true).active).toEqual(loaded.state.active);
  });

  it('backs up the previous valid commit before saving a newer state', async () => {
    const old = JSON.stringify({ ...initial(), lastSavedAt: START });
    const next = activeStudy();
    const storage = memoryStorage({ [STUDY_KEY]: old });
    await saveStudy(storage.adapter, next);
    expect(storage.writes.map(write => write.key)).toEqual([BACKUP_KEY, STUDY_KEY]);
    expect(storage.data.get(BACKUP_KEY)).toBe(old);
    expect(restoreLearning(storage.data.get(BACKUP_KEY)!, true)).toEqual(JSON.parse(old));
    const saved = restoreLearning(storage.data.get(STUDY_KEY)!, true);
    expect(saved.active).toEqual(next.active);
    expect(saved.lastSavedAt).toBeGreaterThan(0);
    expect(next.lastSavedAt).toBe(0);
    await expect(loadStudy(storage.adapter, true)).resolves.toEqual({ state: saved, recovered: false });
  });

  it('recovers a corrupt primary from a valid backup without overwriting either copy on load', async () => {
    const backup = JSON.stringify(activeStudy());
    const storage = memoryStorage({ [STUDY_KEY]: '{broken', [BACKUP_KEY]: backup });
    await expect(loadStudy(storage.adapter, true)).resolves.toEqual({ state: JSON.parse(backup), recovered: true });
    expect(storage.data.get(STUDY_KEY)).toBe('{broken');
    expect(storage.data.get(BACKUP_KEY)).toBe(backup);
    expect(storage.writes).toEqual([]);
  });

  it('recovers a missing primary from its valid backup before considering legacy data', async () => {
    const backupState = activeStudy();
    const backup = JSON.stringify(backupState);
    const storage = memoryStorage({ [BACKUP_KEY]: backup, [LEGACY_KEY]: JSON.stringify(emptyState) });
    await expect(loadStudy(storage.adapter, true)).resolves.toEqual({ state: backupState, recovered: true });
    expect(storage.data.has(STUDY_KEY)).toBe(false);
    expect(storage.data.get(BACKUP_KEY)).toBe(backup);
    expect(storage.writes).toEqual([]);
  });

  it('retains the old state and a usable backup when the primary write fails', async () => {
    const old = JSON.stringify(activeStudy());
    const storage = memoryStorage({ [STUDY_KEY]: old });
    storage.failures.add(STUDY_KEY);
    await expect(saveStudy(storage.adapter, { ...initial(), lastSavedAt: START + 1000 })).rejects.toThrow('Unable to write');
    expect(storage.data.get(STUDY_KEY)).toBe(old);
    expect(storage.data.get(BACKUP_KEY)).toBe(old);
    await expect(loadStudy(storage.adapter, true)).resolves.toEqual({ state: JSON.parse(old), recovered: false });
  });

  it('does not replace a valid backup with corrupt primary data when saving after recovery', async () => {
    const backup = JSON.stringify(activeStudy());
    const storage = memoryStorage({ [STUDY_KEY]: '{broken', [BACKUP_KEY]: backup });
    const recovered = await loadStudy(storage.adapter, true);
    await saveStudy(storage.adapter, recovered.state);
    expect(storage.writes.map(write => write.key)).toEqual([STUDY_KEY]);
    expect(storage.data.get(BACKUP_KEY)).toBe(backup);
    expect(restoreLearning(storage.data.get(STUDY_KEY)!, true).active).toEqual(recovered.state.active);
  });

  it('keeps the recovery backup when both the old primary and its replacement fail', async () => {
    const backup = JSON.stringify(activeStudy());
    const storage = memoryStorage({ [STUDY_KEY]: '{broken', [BACKUP_KEY]: backup });
    storage.failures.add(STUDY_KEY);
    await expect(saveStudy(storage.adapter, initial())).rejects.toThrow();
    expect(storage.data.get(BACKUP_KEY)).toBe(backup);
    await expect(loadStudy(storage.adapter, true)).resolves.toEqual({ state: JSON.parse(backup), recovered: true });
  });

  it('aborts a save when the backup write fails so the current state is preserved', async () => {
    const old = JSON.stringify(activeStudy());
    const storage = memoryStorage({ [STUDY_KEY]: old });
    storage.failures.add(BACKUP_KEY);
    await expect(saveStudy(storage.adapter, initial())).rejects.toThrow('Unable to write');
    expect(storage.data.get(STUDY_KEY)).toBe(old);
    expect(storage.writes).toEqual([]);
  });

  it('rejects unreadable current and backup copies instead of silently resetting data', async () => {
    const storage = memoryStorage({ [STUDY_KEY]: '{broken', [BACKUP_KEY]: '{also-broken' });
    await expect(loadStudy(storage.adapter)).rejects.toThrow();
    expect(storage.writes).toEqual([]);
    const noBackup = memoryStorage({ [STUDY_KEY]: '{broken' });
    await expect(loadStudy(noBackup.adapter)).rejects.toThrow('Saved study data could not be read');
  });
});
