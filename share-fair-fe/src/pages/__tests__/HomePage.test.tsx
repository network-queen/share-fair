import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../test/testUtils';
import HomePage from '../HomePage';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, string>) => {
      const translations: Record<string, string> = {
        'common.appName': 'Share Fair',
        'home.tagline': 'Share more, waste less',
        'search.title': 'Search',
        'home.whyChoose': `Why choose ${opts?.appName || 'Share Fair'}`,
        'home.savePlanet': 'Save the Planet',
        'home.savePlanetDesc': 'Reduce waste by sharing',
        'home.buildTrust': 'Build Trust',
        'home.buildTrustDesc': 'Neighborhood trust system',
        'home.saveMoney': 'Save Money',
        'home.saveMoneyDesc': 'Rent instead of buying',
        'home.readyToStart': 'Ready to Start?',
        'home.readyToStartDesc': 'Join your community today',
      };
      return translations[key] || key;
    },
  }),
}));

describe('HomePage', () => {
  it('renders the hero section with app name and tagline', () => {
    renderWithProviders(<HomePage />);

    expect(screen.getByText('Share Fair')).toBeInTheDocument();
    expect(screen.getByText('Share more, waste less')).toBeInTheDocument();
  });

  it('renders three feature cards', () => {
    renderWithProviders(<HomePage />);

    expect(screen.getByText('Save the Planet')).toBeInTheDocument();
    expect(screen.getByText('Build Trust')).toBeInTheDocument();
    expect(screen.getByText('Save Money')).toBeInTheDocument();

    expect(screen.getByText('Reduce waste by sharing')).toBeInTheDocument();
    expect(screen.getByText('Neighborhood trust system')).toBeInTheDocument();
    expect(screen.getByText('Rent instead of buying')).toBeInTheDocument();
  });

  it('renders the CTA section', () => {
    renderWithProviders(<HomePage />);

    expect(screen.getByText('Ready to Start?')).toBeInTheDocument();
    expect(screen.getByText('Join your community today')).toBeInTheDocument();
  });

  it('renders links to the search page', () => {
    renderWithProviders(<HomePage />);

    const searchLinks = screen.getAllByRole('link', { name: 'Search' });
    expect(searchLinks).toHaveLength(2); // hero + CTA
    searchLinks.forEach((link) => {
      expect(link).toHaveAttribute('href', '/search');
    });
  });
});
