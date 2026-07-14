// ── Global test setup ──────────────────────────────────────────────────────
// 1. Extend Jest matchers with @testing-library/jest-dom
import '@testing-library/jest-dom';

// 2. Silence noisy console.error output from expected error paths in tests
//    (uncomment if you want clean output; keep it on to see unexpected errors)
// const originalError = console.error;
// beforeAll(() => {
//   console.error = (...args) => {
//     if (typeof args[0] === 'string' && args[0].includes('Warning:')) return;
//     originalError(...args);
//   };
// });

// 3. Mock window.matchMedia (not available in jsdom)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// 4. Mock window.scrollTo
window.scrollTo = jest.fn();

// 5. Provide a minimal i18n setup so t() calls return the key path
jest.mock('react-i18next', () => {
  const useMock = [(k, opts) => {
    // Return the last segment of the key, with interpolation placeholders replaced
    let val = k.split('.').pop();
    if (opts) {
      Object.entries(opts).forEach(([key, v]) => {
        val = val.replace(new RegExp(`{{${key}}}`, 'g'), String(v));
      });
    }
    return val;
  }, {}];
  useMock[1].changeLanguage = jest.fn().mockResolvedValue(undefined);
  useMock[1].resolvedLanguage = 'en';
  useMock[1].language = 'en';
  return {
    useTranslation: () => ({ t: useMock[0], i18n: useMock[1] }),
    Trans: ({ children }) => children,
    initReactI18next: { type: '3rdParty', init: jest.fn() },
  };
});

// 6. Mock react-toastify so tests don't render toast infrastructure
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error:   jest.fn(),
    info:    jest.fn(),
    warning: jest.fn(),
  },
  ToastContainer: () => null,
}));
