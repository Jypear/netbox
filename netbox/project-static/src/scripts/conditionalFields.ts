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
  document.querySelectorAll<HTMLElement>('[data-visible-when]').forEach(el => {
    const conditions: Conditions = JSON.parse(el.dataset.visibleWhen!);
    const wrapper = el.closest<HTMLElement>(FIELD_WRAPPER_SELECTOR);
    wrapper?.classList.toggle('d-none', !isVisible(conditions));
  });
}

document.addEventListener('DOMContentLoaded', () => {
  updateVisibility();
  const form = document.querySelector(FORM_SELECTOR);
  form?.addEventListener('change', updateVisibility);
  form?.addEventListener('input', updateVisibility);
});
