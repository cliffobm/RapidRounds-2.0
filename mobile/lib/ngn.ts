/** Practice-item scoring. This is not a simulation of NCLEX ability scoring. */
export type NgnOption = { id: string; text: string };
export type NgnRow = { id: string; label: string; correctOptionId: string };
type ChoiceItem = { options: NgnOption[]; correctIds: string[] };
type RowItem = { options: NgnOption[]; rows: NgnRow[] };

export type NgnItem =
  | (ChoiceItem & { format: 'single' })
  | (ChoiceItem & { format: 'multiple' })
  | (ChoiceItem & { format: 'selectN'; selectCount: number })
  | (RowItem & { format: 'matrix' })
  | (RowItem & { format: 'cloze' });
export type NgnRubric = NgnItem;
export type NgnResponse = {
  selectedIds: string[];
  rowAnswers: Record<string, string>;
};
export type NgnScore = {
  valid: boolean;
  error?: string;
  earned: number;
  max: number;
  correct: boolean;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);
const isId = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
const uniqueIds = (values: unknown): values is string[] =>
  Array.isArray(values) && values.every(isId) && new Set(values).size === values.length;
const reject = (error: string, max = 0): NgnScore => ({ valid: false, error, earned: 0, max, correct: false });

/**
 * Scores only complete, structurally valid submissions against a valid rubric.
 * Multiple-response uses +1 for a correct selection and -1 for an incorrect
 * selection, floored at zero. Select-N awards one point per correct selection
 * with no deductions. Matrix and cloze award one point per correct row/blank.
 * Selection limits and answer completeness are enforced here, not only in UI.
 */
export function scoreNgn(item: NgnItem, response: NgnResponse): NgnScore {
  // Runtime checks protect against malformed authored content and restored state.
  if (!isRecord(item) || !Array.isArray(item.options) || item.options.length < 2 ||
      !item.options.every(option => isRecord(option) && isId(option.id) && typeof option.text === 'string') ||
      !uniqueIds(item.options.map(option => option.id))) {
    return reject('This item has an invalid option list.');
  }
  const optionIds = new Set(item.options.map(option => option.id));
  let max: number;
  switch (item.format) {
    case 'single':
    case 'multiple':
    case 'selectN': {
      if (!uniqueIds(item.correctIds) || !item.correctIds.length || !item.correctIds.every(id => optionIds.has(id))) {
        return reject('This item has an invalid answer key.');
      }
      if (item.format === 'single' && item.correctIds.length !== 1) {
        return reject('A single-choice item must have exactly one correct answer.');
      }
      if (item.format === 'selectN' && (!Number.isInteger(item.selectCount) || item.selectCount < 1 ||
          item.selectCount > item.options.length || item.selectCount !== item.correctIds.length)) {
        return reject('A select-N item must define an answer key matching its selection count.');
      }
      max = item.correctIds.length;
      break;
    }
    case 'matrix':
    case 'cloze': {
      if (!Array.isArray(item.rows) || !item.rows.length ||
          !item.rows.every(row => isRecord(row) && isId(row.id) && typeof row.label === 'string' && optionIds.has(row.correctOptionId)) ||
          !uniqueIds(item.rows.map(row => row.id))) {
        return reject('This item has an invalid row or blank answer key.');
      }
      max = item.rows.length;
      break;
    }
    default:
      return reject('This item format is not supported.');
  }

  if (!isRecord(response) || !uniqueIds(response.selectedIds) || !isRecord(response.rowAnswers)) {
    return reject('The response is incomplete or contains duplicate selections.', max);
  }
  let earned = 0;
  if (item.format === 'matrix' || item.format === 'cloze') {
    if (response.selectedIds.length) return reject('Answer each row or blank using its available choices.', max);
    const rowIds = new Set(item.rows.map(row => row.id));
    if (Object.keys(response.rowAnswers).some(id => !rowIds.has(id))) {
      return reject('The response contains an unknown row or blank.', max);
    }
    if (item.rows.some(row => !Object.prototype.hasOwnProperty.call(response.rowAnswers, row.id) || !isId(response.rowAnswers[row.id]))) {
      return reject('Complete every row or blank before checking your answer.', max);
    }
    if (Object.values(response.rowAnswers).some(id => !optionIds.has(id))) {
      return reject('Choose only the available options for each row or blank.', max);
    }
    earned = item.rows.filter(row => response.rowAnswers[row.id] === row.correctOptionId).length;
  } else {
    if (Object.keys(response.rowAnswers).length) return reject('This item does not accept row or blank answers.', max);
    if (!response.selectedIds.every(id => optionIds.has(id))) return reject('Choose only the available options.', max);
    if (item.format === 'single' && response.selectedIds.length !== 1) return reject('Select one answer before checking.', max);
    if (item.format === 'multiple' && response.selectedIds.length === 0) return reject('Select at least one answer before checking.', max);
    if (item.format === 'selectN' && response.selectedIds.length !== item.selectCount) {
      return reject(`Select exactly ${item.selectCount} answers before checking.`, max);
    }
    const correctIds = new Set(item.correctIds);
    const correctSelections = response.selectedIds.filter(id => correctIds.has(id)).length;
    const incorrectSelections = response.selectedIds.length - correctSelections;
    earned = item.format === 'multiple' ? Math.max(0, correctSelections - incorrectSelections) : correctSelections;
  }
  return { valid: true, earned, max, correct: earned === max };
}
