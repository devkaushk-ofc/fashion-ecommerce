/**
 * components/LanguageSwitcher.test.jsx
 * Tests for the language dropdown component.
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LanguageSwitcher from '../../components/LanguageSwitcher';

// useTranslation is already mocked in setup.js, but we need i18n.changeLanguage
// to be spyable — override just for these tests.
const mockChangeLanguage = jest.fn().mockResolvedValue(undefined);

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k) => k,
    i18n: {
      resolvedLanguage: 'en',
      language: 'en',
      changeLanguage: mockChangeLanguage,
    },
  }),
}));

describe('LanguageSwitcher', () => {
  beforeEach(() => mockChangeLanguage.mockClear());

  it('renders a select element', () => {
    render(<LanguageSwitcher />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('shows all three language options', () => {
    render(<LanguageSwitcher />);
    expect(screen.getByRole('option', { name: 'English' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'हिन्दी' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Deutsch' })).toBeInTheDocument();
  });

  it('selects English by default when resolvedLanguage is "en"', () => {
    render(<LanguageSwitcher />);
    expect(screen.getByRole('combobox')).toHaveValue('en');
  });

  it('calls i18n.changeLanguage with "hi" when Hindi is selected', async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher />);
    await user.selectOptions(screen.getByRole('combobox'), 'hi');
    expect(mockChangeLanguage).toHaveBeenCalledWith('hi');
  });

  it('calls i18n.changeLanguage with "de" when Deutsch is selected', async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher />);
    await user.selectOptions(screen.getByRole('combobox'), 'de');
    expect(mockChangeLanguage).toHaveBeenCalledWith('de');
  });

  it('calls i18n.changeLanguage with "en" when English is selected', async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher />);
    await user.selectOptions(screen.getByRole('combobox'), 'en');
    expect(mockChangeLanguage).toHaveBeenCalledWith('en');
  });

  it('has an accessible aria-label', () => {
    render(<LanguageSwitcher />);
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-label');
  });
});
