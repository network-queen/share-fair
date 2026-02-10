import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test/testUtils';
import SearchPage from '../SearchPage';
import { mockListing } from '../../test/fixtures';

const mockPerformSearch = vi.fn();
const mockLoadNextPage = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => {
      const translations: Record<string, string> = {
        'search.title': 'Search',
        'search.placeholder': 'Search items...',
        'search.neighborhood': 'Neighborhood',
        'search.allNeighborhoods': 'All Neighborhoods',
        'search.category': 'Category',
        'search.allCategories': 'All Categories',
        'search.sortBy': 'Sort By',
        'search.relevance': 'Relevance',
        'search.distance': 'Distance',
        'search.price': 'Price',
        'search.date': 'Date',
        'search.searchButton': 'Search',
        'search.resultsFound': `${opts?.count || 0} results found`,
        'search.noResults': 'No results found',
        'search.loadMore': 'Load More',
        'common.loading': 'Loading...',
        'common.error': 'Error',
      };
      return translations[key] || key;
    },
  }),
}));

vi.mock('../../hooks/useSearch', () => ({
  useSearch: () => ({
    results: mockResults,
    isLoading: mockIsLoading,
    error: mockError,
    neighborhoods: mockNeighborhoods,
    categories: mockCategories,
    total: mockTotal,
    hasMore: mockHasMore,
    performSearch: mockPerformSearch,
    loadNextPage: mockLoadNextPage,
  }),
}));

let mockResults: typeof mockListing[] = [];
let mockIsLoading = false;
let mockError: string | null = null;
let mockNeighborhoods: Array<{ id: string; name: string }> = [];
let mockCategories: string[] = [];
let mockTotal = 0;
let mockHasMore = false;

describe('SearchPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockResults = [];
    mockIsLoading = false;
    mockError = null;
    mockNeighborhoods = [
      { id: '1', name: 'Brooklyn' },
      { id: '2', name: 'Manhattan' },
    ];
    mockCategories = ['Sports', 'Tools', 'Electronics'];
    mockTotal = 0;
    mockHasMore = false;
  });

  it('renders search input and filters', () => {
    renderWithProviders(<SearchPage />);

    expect(screen.getByPlaceholderText('Search items...')).toBeInTheDocument();
    expect(screen.getByText('Neighborhood')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Sort By')).toBeInTheDocument();
  });

  it('renders neighborhood options', () => {
    renderWithProviders(<SearchPage />);

    expect(screen.getByText('All Neighborhoods')).toBeInTheDocument();
    expect(screen.getByText('Brooklyn')).toBeInTheDocument();
    expect(screen.getByText('Manhattan')).toBeInTheDocument();
  });

  it('renders category options', () => {
    renderWithProviders(<SearchPage />);

    expect(screen.getByText('All Categories')).toBeInTheDocument();
    expect(screen.getByText('Sports')).toBeInTheDocument();
    expect(screen.getByText('Tools')).toBeInTheDocument();
    expect(screen.getByText('Electronics')).toBeInTheDocument();
  });

  it('shows no results message when empty', () => {
    renderWithProviders(<SearchPage />);

    expect(screen.getByText('No results found')).toBeInTheDocument();
  });

  it('displays search results', () => {
    mockResults = [mockListing];
    mockTotal = 1;

    renderWithProviders(<SearchPage />);

    expect(screen.getByText('Electric Drill')).toBeInTheDocument();
    expect(screen.getByText('$15')).toBeInTheDocument();
    expect(screen.getByText('Downtown')).toBeInTheDocument();
  });

  it('shows results count when results exist', () => {
    mockResults = [mockListing];
    mockTotal = 1;

    renderWithProviders(<SearchPage />);

    expect(screen.getByText('1 results found')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockIsLoading = true;

    renderWithProviders(<SearchPage />);

    const loadingElements = screen.getAllByText('Loading...');
    expect(loadingElements.length).toBeGreaterThanOrEqual(1);
    // Loading indicator in results area
    expect(loadingElements.some((el) => el.tagName === 'P')).toBe(true);
  });

  it('shows error message', () => {
    mockError = 'Search failed';

    renderWithProviders(<SearchPage />);

    expect(screen.getByText(/Search failed/)).toBeInTheDocument();
  });

  it('shows Load More button when hasMore is true', () => {
    mockResults = [mockListing];
    mockHasMore = true;

    renderWithProviders(<SearchPage />);

    expect(screen.getByText('Load More')).toBeInTheDocument();
  });

  it('does not show Load More button when hasMore is false', () => {
    mockResults = [mockListing];
    mockHasMore = false;

    renderWithProviders(<SearchPage />);

    expect(screen.queryByText('Load More')).not.toBeInTheDocument();
  });

  it('calls performSearch on search button click', async () => {
    const user = userEvent.setup();

    renderWithProviders(<SearchPage />);

    const searchButtons = screen.getAllByText('Search');
    // Find the button (not the heading)
    const searchButton = searchButtons.find((el) => el.tagName === 'BUTTON');
    expect(searchButton).toBeDefined();

    await user.click(searchButton!);
    expect(mockPerformSearch).toHaveBeenCalled();
  });

  it('calls performSearch on Enter key in search input', async () => {
    const user = userEvent.setup();

    renderWithProviders(<SearchPage />);

    const input = screen.getByPlaceholderText('Search items...');
    await user.type(input, 'bike{Enter}');

    expect(mockPerformSearch).toHaveBeenCalled();
  });

  it('calls loadNextPage on Load More click', async () => {
    const user = userEvent.setup();
    mockResults = [mockListing];
    mockHasMore = true;

    renderWithProviders(<SearchPage />);

    await user.click(screen.getByText('Load More'));
    expect(mockLoadNextPage).toHaveBeenCalled();
  });

  it('disables search button while loading', () => {
    mockIsLoading = true;

    renderWithProviders(<SearchPage />);

    const loadingElements = screen.getAllByText('Loading...');
    const loadingButton = loadingElements.find((el) => el.tagName === 'BUTTON');
    expect(loadingButton).toBeDefined();
    expect(loadingButton).toBeDisabled();
  });
});
