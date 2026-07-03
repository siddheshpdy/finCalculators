import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

vi.mock('./components/WealthChart', () => ({
  default: ({ data = [] }) => <div data-testid="wealth-chart">Chart points: {data.length}</div>,
}));

const mockFundList = [{ schemeCode: '1001', schemeName: 'Alpha Fund' }];
const mockNavPayload = {
  data: [
    { date: '01-01-2020', nav: '10' },
    { date: '01-02-2020', nav: '11' },
    { date: '01-03-2020', nav: '12' },
  ],
};

const createTrackerFetchMock = () =>
  vi.fn(async (url) => {
    if (url === 'https://api.mfapi.in/mf') {
      return { ok: true, json: async () => mockFundList };
    }

    if (url === 'https://api.mfapi.in/mf/1001') {
      return { ok: true, json: async () => mockNavPayload };
    }

    throw new Error(`Unexpected fetch URL: ${url}`);
  });

describe('App integration', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    globalThis.alert = vi.fn();
    window.history.replaceState({}, '', '/');
  });

  it('renders the default SIP flow and switches to the normal view', async () => {
    render(<App />);

    expect(screen.getByText('SIP Details')).toBeTruthy();
    expect(screen.getByText('STEP-UP MATURITY')).toBeTruthy();
    expect(await screen.findByText('Step-Up Wealth Projection')).toBeTruthy();
    expect(screen.getByTestId('wealth-chart').textContent).toContain('10');
    expect(screen.getByText('SIP Calculator')).toBeTruthy();

    fireEvent.click(screen.getByText('NORMAL MATURITY'));

    await waitFor(() => {
      expect(screen.getByText('Normal Wealth Projection')).toBeTruthy();
      expect(screen.getByText('SIP Normal Breakdown Schedule')).toBeTruthy();
    });
  });

  it('switches between calculator modes and updates the strategy panel and content', async () => {
    render(<App />);

    fireEvent.click(screen.getByText('Loan'));
    expect(screen.getByText('Loan Planner')).toBeTruthy();
    expect(window.location.pathname).toBe('/loan');
    expect(screen.getByText('Prepayment Strategy')).toBeTruthy();
    fireEvent.click(screen.getByText('Monthly'));

    await waitFor(() => {
      expect(
        screen.getByText('This extra amount is paid every month with your EMI.'),
      ).toBeTruthy();
    });
    expect(screen.getByText('MONTHLY EMI')).toBeTruthy();

    fireEvent.click(screen.getByText('Goal'));
    await waitFor(() => {
      expect(screen.getByText('Goal Planner')).toBeTruthy();
      expect(screen.getByText('Goal Details')).toBeTruthy();
      expect(screen.getByText('REQUIRED MONTHLY SIP')).toBeTruthy();
    });
    expect(window.location.pathname).toBe('/goal');

    fireEvent.click(screen.getByText('Help'));
    await waitFor(() => {
      expect(screen.getByText('Financial Calculators Guide')).toBeTruthy();
    });
    expect(window.location.pathname).toBe('/help');
  });

  it('supports direct calculator URLs on initial load', async () => {
    window.history.replaceState({}, '', '/tracker');
    globalThis.fetch = createTrackerFetchMock();

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Portfolio Tracker')).toBeTruthy();
      expect(globalThis.fetch).toHaveBeenCalledWith('https://api.mfapi.in/mf');
    });
  });

  it('shows tracker suggestions and supports selecting a fund from the custom search list', async () => {
    globalThis.fetch = createTrackerFetchMock();

    render(<App />);

    fireEvent.click(screen.getByText('Tracker'));

    const searchInput = await screen.findByPlaceholderText('Start typing fund name...');
    fireEvent.change(searchInput, {
      target: { value: 'Alpha' },
    });

    const suggestion = await screen.findByRole('option', { name: /Alpha Fund/i });
    fireEvent.click(suggestion);

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith('https://api.mfapi.in/mf/1001');
      expect(screen.getByText('Alpha Fund')).toBeTruthy();
    });
  });

  it('adds a fund to the tracker and supports drilldown into the selected portfolio item', async () => {
    globalThis.fetch = createTrackerFetchMock();

    render(<App />);

    fireEvent.click(screen.getByText('Tracker'));

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith('https://api.mfapi.in/mf');
    });

    const searchInput = await screen.findByPlaceholderText('Start typing fund name...');
    fireEvent.change(searchInput, {
      target: { value: 'Alpha Fund' },
    });

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith('https://api.mfapi.in/mf/1001');
      expect(screen.getByText('Alpha Fund')).toBeTruthy();
    });

    const addButton = screen.getByRole('button', { name: 'Add to Portfolio' });
    await waitFor(() => {
      expect(addButton.disabled).toBe(false);
    });

    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Portfolio Growth (Actual)')).toBeTruthy();
      expect(screen.getAllByText('Alpha Fund').length).toBeGreaterThan(0);
      expect(screen.getByText('Total')).toBeTruthy();
    });

    fireEvent.click(screen.getByText('Alpha Fund'));

    await waitFor(() => {
      expect(screen.getByText('Back to Full Portfolio')).toBeTruthy();
      expect(screen.getByText('Units')).toBeTruthy();
    });
  });

  it('supports editing, removing, and undoing tracker entries', async () => {
    globalThis.fetch = createTrackerFetchMock();

    render(<App />);

    fireEvent.click(screen.getByText('Tracker'));

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith('https://api.mfapi.in/mf');
    });

    const searchInput = await screen.findByPlaceholderText('Start typing fund name...');
    fireEvent.change(searchInput, {
      target: { value: 'Alpha Fund' },
    });

    await waitFor(() => {
      expect(screen.getByText('Alpha Fund')).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Add to Portfolio' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit fund' })).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Edit fund' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Update Portfolio' })).toBeTruthy();
    });

    const monthlySipInput = screen
      .getAllByDisplayValue('5000')
      .find((element) => element.getAttribute('type') === 'number');
    fireEvent.change(monthlySipInput, { target: { value: '6500' } });
    fireEvent.click(screen.getByRole('button', { name: 'Update Portfolio' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit fund' })).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Edit fund' }));

    await waitFor(() => {
      const updatedSipInput = screen
        .getAllByDisplayValue('6500')
        .find((element) => element.getAttribute('type') === 'number');
      expect(updatedSipInput).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    fireEvent.click(screen.getByRole('button', { name: 'Remove fund' }));

    await waitFor(() => {
      expect(screen.getByText('Remove Fund?')).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Remove' }));

    await waitFor(() => {
      expect(screen.getByText('Fund removed')).toBeTruthy();
      expect(screen.queryByRole('button', { name: 'Edit fund' })).toBeNull();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit fund' })).toBeTruthy();
    });
  });

  it('imports tracker holdings from CSV and surfaces invalid file errors', async () => {
    globalThis.fetch = createTrackerFetchMock();
    const { container } = render(<App />);

    fireEvent.click(screen.getByText('Tracker'));

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith('https://api.mfapi.in/mf');
    });

    const fileInput = container.querySelector('input[type="file"]');
    const validFile = new File(
      ['Scheme Code,Start Date,SIP Amount\n1001,2020-01-01,5000'],
      'portfolio.csv',
      { type: 'text/csv' },
    );
    Object.defineProperty(validFile, 'text', {
      value: async () => 'Scheme Code,Start Date,SIP Amount\n1001,2020-01-01,5000',
    });

    fireEvent.change(fileInput, { target: { files: [validFile] } });

    await waitFor(() => {
      expect(globalThis.alert).toHaveBeenCalledWith('Successfully imported 1 funds.');
      expect(screen.getAllByText('Alpha Fund').length).toBeGreaterThan(0);
    });

    const invalidFile = new File(['invalid'], 'broken.csv', { type: 'text/csv' });
    Object.defineProperty(invalidFile, 'text', {
      value: async () => 'invalid',
    });
    fireEvent.change(fileInput, { target: { files: [invalidFile] } });

    await waitFor(() => {
      expect(globalThis.alert).toHaveBeenCalledWith(
        'Failed to import CSV. Please check the file format.',
      );
    });
  });

  it('opens and closes the mobile navigation menu', async () => {
    render(<App />);

    const toggleButton = screen.getByRole('button', { name: 'Toggle calculator menu' });
    expect(toggleButton.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(toggleButton.getAttribute('aria-expanded')).toBe('true');
      expect(screen.getByTestId('sidebar-menu').className).toContain('mobileMenuOpen');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Goal' }));

    await waitFor(() => {
      expect(toggleButton.getAttribute('aria-expanded')).toBe('false');
    });
  });
});
