// Организация, за которую действует вошедший пользователь. Бэкенд читает её
// из заголовка X-Organization-Id и сверяет с местами работы аккаунта.
export const ORGANIZATION_KEY = 'organizationId';
export const ORGANIZATION_HEADER = 'X-Organization-Id';

export function getOrganizationId() {
  try {
    return localStorage.getItem(ORGANIZATION_KEY);
  } catch {
    return null;
  }
}

export function setOrganizationId(id) {
  try {
    if (id === null || id === undefined || id === '') {
      localStorage.removeItem(ORGANIZATION_KEY);
    } else {
      localStorage.setItem(ORGANIZATION_KEY, String(id));
    }
  } catch {
    // без хранилища выбор просто не запоминается
  }
}

/**
 * Приводит сохранённый выбор в соответствие со списком доступных организаций.
 * Учителю нескольких организаций по умолчанию выбирается первая; супер-админ
 * без выбора видит все организации сразу.
 */
export function reconcileOrganization(organizations, isSuperAdmin) {
  const ids = (organizations ?? []).map((o) => String(o.id));
  const stored = getOrganizationId();

  if (stored && ids.includes(stored)) {
    return stored;
  }

  const fallback = !isSuperAdmin && ids.length > 1 ? ids[0] : null;
  setOrganizationId(fallback);

  return fallback;
}
