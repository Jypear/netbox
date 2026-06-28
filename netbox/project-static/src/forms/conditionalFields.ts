import { getElements } from '../util';

const FORM_SELECTOR = 'form.object-edit';
const FIELD_WRAPPER_SELECTOR = '.row.mb-3';

type Conditions = Record<string, unknown>;

function getFieldValue(name: string): string | undefined {
  const field = document.querySelector<HTMLInputElement>(
    `${FORM_SELECTOR} [name="${name}"]:not([type="hidden"])`,
  );
  if (!field) return undefined;
  return field.type === 'checkbox' ? String(field.checked) : field.value;
}

function matchesCondition(actual: string | undefined, expected: unknown): boolean {
  if (expected === '*') return Boolean(actual);
  if (Array.isArray(expected)) return expected.includes(actual);
  return actual == expected;
}

function isVisible(conditions: Conditions): boolean {
  return Object.entries(conditions).every(([field, expected]) =>
    matchesCondition(getFieldValue(field), expected),
  );
}

function updateVisibility(): void {
  for (const el of getElements<HTMLElement>('[data-visible-when]')) {
    const conditions: Conditions = JSON.parse(el.dataset.visibleWhen!);
    const wrapper = el.closest<HTMLElement>(FIELD_WRAPPER_SELECTOR);
    wrapper?.classList.toggle('d-none', !isVisible(conditions));
  }
}

export function initConditionalFields(): void {
  const form = document.querySelector(FORM_SELECTOR);
  if (!form) return;
  updateVisibility();
  form.addEventListener('change', updateVisibility);
  form.addEventListener('input', updateVisibility);
}
