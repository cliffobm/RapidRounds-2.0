import { describe, expect, it } from 'vitest';
import { scoreNgn, type NgnItem, type NgnResponse } from '../lib/ngn';

const options = ['a', 'b', 'c', 'd'].map(id => ({ id, text: id.toUpperCase() }));
const selected = (...selectedIds: string[]): NgnResponse => ({ selectedIds, rowAnswers: {} });
const single: NgnItem = { format: 'single', options, correctIds: ['b'] };
const multiple: NgnItem = { format: 'multiple', options, correctIds: ['a', 'b'] };
const selectN: NgnItem = { format: 'selectN', options, correctIds: ['a', 'b'], selectCount: 2 };
const matrix: NgnItem = {
  format: 'matrix', options: options.slice(0, 2), rows: [
    { id: 'row1', label: 'First observation', correctOptionId: 'a' },
    { id: 'row2', label: 'Second observation', correctOptionId: 'b' },
  ],
};
const cloze: NgnItem = { ...matrix, format: 'cloze' };
const rows = (rowAnswers: Record<string, string>): NgnResponse => ({ selectedIds: [], rowAnswers });

describe('practice item scoring', () => {
  it('scores a single choice as zero or one without credit for omission', () => {
    expect(scoreNgn(single, selected('b'))).toEqual({ valid: true, earned: 1, max: 1, correct: true });
    expect(scoreNgn(single, selected('a'))).toEqual({ valid: true, earned: 0, max: 1, correct: false });
    expect(scoreNgn(single, selected()).valid).toBe(false);
    expect(scoreNgn(single, selected('a', 'b')).valid).toBe(false);
  });

  it('deducts incorrect multiple-response selections but never creates a negative score', () => {
    expect(scoreNgn(multiple, selected('a', 'b'))).toMatchObject({ earned: 2, max: 2, correct: true });
    expect(scoreNgn(multiple, selected('a'))).toMatchObject({ earned: 1, max: 2, correct: false });
    expect(scoreNgn(multiple, selected('a', 'b', 'c'))).toMatchObject({ earned: 1, correct: false });
    expect(scoreNgn(multiple, selected('a', 'c', 'd'))).toMatchObject({ valid: true, earned: 0, correct: false });
    expect(scoreNgn(multiple, selected('a', 'b', 'c', 'd')).earned).toBe(0);
    expect(scoreNgn(multiple, selected()).valid).toBe(false);
  });

  it('awards select-N partial credit without deductions and requires the exact count', () => {
    expect(scoreNgn(selectN, selected('a', 'c'))).toEqual({ valid: true, earned: 1, max: 2, correct: false });
    expect(scoreNgn(selectN, selected('a', 'b')).correct).toBe(true);
    expect(scoreNgn(selectN, selected('c', 'd')).earned).toBe(0);
    expect(scoreNgn(selectN, selected('a')).valid).toBe(false);
    expect(scoreNgn(selectN, selected('a', 'b', 'c')).valid).toBe(false);
  });

  it.each([matrix, cloze])('scores every $format row or blank independently', item => {
    expect(scoreNgn(item, rows({ row1: 'a', row2: 'b' }))).toEqual({ valid: true, earned: 2, max: 2, correct: true });
    expect(scoreNgn(item, rows({ row1: 'a', row2: 'a' }))).toEqual({ valid: true, earned: 1, max: 2, correct: false });
    expect(scoreNgn(item, rows({ row1: 'b', row2: 'a' })).earned).toBe(0);
  });

  it.each([matrix, cloze])('rejects incomplete or unknown $format responses before awarding any credit', item => {
    for (const response of [
      rows({ row1: 'a' }), rows({ row1: 'a', row2: '' }),
      rows({ row1: 'a', row2: 'unknown' }), rows({ row1: 'a', row2: 'b', extra: 'a' }),
      { selectedIds: ['a'], rowAnswers: { row1: 'a', row2: 'b' } },
    ]) {
      expect(scoreNgn(item, response)).toMatchObject({ valid: false, earned: 0, max: 2, correct: false });
    }
  });

  it('rejects unknown and duplicate choices rather than overcounting', () => {
    for (const item of [single, multiple, selectN]) {
      expect(scoreNgn(item, selected('unknown')).valid).toBe(false);
      expect(scoreNgn(item, selected('a', 'a')).valid).toBe(false);
      expect(scoreNgn(item, { selectedIds: ['a'], rowAnswers: { extra: 'a' } }).valid).toBe(false);
    }
  });

  it('rejects malformed persisted responses without throwing', () => {
    for (const value of [null, {}, { selectedIds: null, rowAnswers: {} }, { selectedIds: ['a'], rowAnswers: [] }]) {
      expect(scoreNgn(single, value as unknown as NgnResponse)).toMatchObject({ valid: false, earned: 0, correct: false });
    }
    const inherited = Object.create({ row2: 'b' }) as Record<string, string>;
    inherited.row1 = 'a';
    expect(scoreNgn(matrix, rows(inherited)).valid).toBe(false);
  });

  it('rejects invalid authored rubrics rather than reporting misleading perfect scores', () => {
    const invalidItems = [
      null, {}, { ...single, options: [options[0], options[0]] },
      { ...single, correctIds: [] }, { ...single, correctIds: ['a', 'b'] },
      { ...multiple, correctIds: ['a', 'a'] }, { ...multiple, correctIds: ['unknown'] },
      { ...selectN, selectCount: 1 }, { ...selectN, selectCount: 2.5 },
      { ...matrix, rows: [] }, { ...matrix, rows: [matrix.rows[0], matrix.rows[0]] },
      { ...matrix, rows: [{ id: 'r1', label: 'Test', correctOptionId: 'unknown' }] },
      { ...single, format: 'unsupported' },
    ];
    for (const item of invalidItems) {
      expect(scoreNgn(item as NgnItem, selected('a'))).toMatchObject({ valid: false, earned: 0, max: 0, correct: false });
    }
  });

  it('does not mutate the response or answer key while scoring', () => {
    const item = structuredClone(multiple);
    const response = selected('b', 'a');
    const before = JSON.stringify({ item, response });
    scoreNgn(item, response);
    expect(JSON.stringify({ item, response })).toBe(before);
  });
});
