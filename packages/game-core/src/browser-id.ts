const storageKey = 'eoe:browserId';

const fallbackId = () => `anon-${Math.random().toString(36).slice(2, 10)}`;

export const getBrowserId = (): string => {
  if (typeof window === 'undefined') {
    return 'server';
  }
  const existing = window.localStorage?.getItem(storageKey);
  if (existing) {
    return existing;
  }
  const generated = window.crypto?.randomUUID?.() ?? fallbackId();
  window.localStorage?.setItem(storageKey, generated);
  return generated;
};
