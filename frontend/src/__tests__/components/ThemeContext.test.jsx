/**
 * context/ThemeContext.test.jsx
 * Tests for ThemeProvider and useTheme hook.
 */
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, useTheme } from '../../context/ThemeContext';

// Consumer component used in tests
const ThemeConsumer = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  );
};

const renderWithProvider = (ui = <ThemeConsumer />) =>
  render(<ThemeProvider>{ui}</ThemeProvider>);

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('defaults to light when no preference is saved and matchMedia returns false', () => {
    window.matchMedia.mockImplementation((q) => ({
      matches: false, media: q,
      addEventListener: jest.fn(), removeEventListener: jest.fn(),
      addListener: jest.fn(), removeListener: jest.fn(), dispatchEvent: jest.fn(),
    }));
    renderWithProvider();
    expect(screen.getByTestId('theme').textContent).toBe('light');
  });

  it('defaults to dark when matchMedia prefers dark and no saved preference', () => {
    window.matchMedia.mockImplementation((q) => ({
      matches: true, media: q,
      addEventListener: jest.fn(), removeEventListener: jest.fn(),
      addListener: jest.fn(), removeListener: jest.fn(), dispatchEvent: jest.fn(),
    }));
    renderWithProvider();
    expect(screen.getByTestId('theme').textContent).toBe('dark');
  });

  it('reads saved theme from localStorage', () => {
    localStorage.setItem('theme', 'dark');
    renderWithProvider();
    expect(screen.getByTestId('theme').textContent).toBe('dark');
  });

  it('ignores invalid localStorage values', () => {
    localStorage.setItem('theme', 'invalid-value');
    window.matchMedia.mockImplementation((q) => ({
      matches: false, media: q,
      addEventListener: jest.fn(), removeEventListener: jest.fn(),
      addListener: jest.fn(), removeListener: jest.fn(), dispatchEvent: jest.fn(),
    }));
    renderWithProvider();
    expect(screen.getByTestId('theme').textContent).toBe('light');
  });

  it('toggleTheme switches from light to dark', async () => {
    localStorage.setItem('theme', 'light');
    const user = userEvent.setup();
    renderWithProvider();
    await user.click(screen.getByRole('button', { name: /toggle/i }));
    expect(screen.getByTestId('theme').textContent).toBe('dark');
  });

  it('toggleTheme switches from dark to light', async () => {
    localStorage.setItem('theme', 'dark');
    const user = userEvent.setup();
    renderWithProvider();
    await user.click(screen.getByRole('button', { name: /toggle/i }));
    expect(screen.getByTestId('theme').textContent).toBe('light');
  });

  it('persists the toggled theme to localStorage', async () => {
    localStorage.setItem('theme', 'light');
    const user = userEvent.setup();
    renderWithProvider();
    await user.click(screen.getByRole('button', { name: /toggle/i }));
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('sets data-theme attribute on <html> element', () => {
    localStorage.setItem('theme', 'dark');
    renderWithProvider();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('useTheme throws when used outside provider', () => {
    // Suppress the React error boundary console output for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<ThemeConsumer />)).toThrow('useTheme must be used inside ThemeProvider');
    consoleSpy.mockRestore();
  });

  it('responds to OS preference change when no saved preference', async () => {
    let mqChangeHandler;
    const mockMq = {
      matches: false, media: '(prefers-color-scheme: dark)',
      addEventListener: jest.fn((_, fn) => { mqChangeHandler = fn; }),
      removeEventListener: jest.fn(),
      addListener: jest.fn(), removeListener: jest.fn(), dispatchEvent: jest.fn(),
    };
    window.matchMedia.mockReturnValue(mockMq);
    renderWithProvider();

    // Ensure handler was registered before firing it
    expect(mockMq.addEventListener).toHaveBeenCalled();
    await act(async () => { mqChangeHandler({ matches: true }); });
    expect(screen.getByTestId('theme').textContent).toBe('dark');
  });
});
