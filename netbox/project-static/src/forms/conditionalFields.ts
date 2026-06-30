import { getElements } from '../util';

const FORM_SELECTOR = 'form.object-edit';
const FIELD_WRAPPER_SELECTOR = '.row.mb-3';

type Conditions = Record<string, unknown>;
type FormField = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

function isFormField(el: Element): el is FormField {
  return (
    el instanceof HTMLInputElement ||
    el instanceof HTMLSelectElement ||
    el instanceof HTMLTextAreaElement
  );
}

function getFieldValue(name: string): string | undefined {
  const radios = document.querySelectorAll<HTMLInputElement>(
    `${FORM_SELECTOR} input[type="radio"][name="${name}"]`,
  );
  if (radios.length > 0) {
    return Array.from(radios).find(r => r.checked)?.value;
  }

  const field = document.querySelector<FormField>(
    `${FORM_SELECTOR} [name="${name}"]:not([type="hidden"])`,
  );
  if (!field) return undefined;
  if (field instanceof HTMLInputElement && field.type === 'checkbox') {
    return String(field.checked);
  }
  return field.value;
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

function applyVisibility(el: HTMLElement): void {
  const conditions: Conditions = JSON.parse(el.dataset.visibleWhen!);
  const wrapper = el.closest<HTMLElement>(FIELD_WRAPPER_SELECTOR);
  const visible = isVisible(conditions);

  wrapper?.classList.toggle('d-none', !visible);

  if (!isFormField(el)) return;

  const required = visible && el.dataset.requiredWhenVisible === 'true';
  el.required = required;
  wrapper
    ?.querySelector<HTMLElement>(`label[for="${el.id}"]`)
    ?.classList.toggle('required', required);
}

function updateVisibility(): void {
  for (const el of getElements<HTMLElement>('[data-visible-when]')) {
    applyVisibility(el);
  }
}

export function initConditionalFields(): void {
  const form = document.querySelector(FORM_SELECTOR);
  if (!form) return;
  updateVisibility();
  for (const event of ['change', 'input']) {
    form.addEventListener(event, updateVisibility);
  }
}
