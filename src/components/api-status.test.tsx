import { render, screen, waitFor } from '../test/test-utils';
import { ApiStatus } from './api-status';
import { server } from '../test/mocks/server';
import { http, HttpResponse } from 'msw';

describe('ApiStatus component', () => {
  it('shows checking state initially', () => {
    render(<ApiStatus />);
    
    expect(screen.getByText('Checking')).toBeInTheDocument();
  });

  it('shows online state when API is available', async () => {
    render(<ApiStatus />);
    
    // Initially shows checking
    expect(screen.getByText('Checking')).toBeInTheDocument();
    
    // Wait for status to update to online (default mock returns 200)
    await waitFor(() => {
      expect(screen.getByText('Online')).toBeInTheDocument();
    });
  });

  it('shows offline state when API returns an error', async () => {
    // Override the health endpoint to return an error
    server.use(
      http.get('/api/health', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );
    
    render(<ApiStatus />);
    
    // Wait for status to update to offline
    await waitFor(() => {
      expect(screen.getByText('Offline')).toBeInTheDocument();
    });
  });

  it('shows offline state when API request fails', async () => {
    // Override the health endpoint to throw a network error
    server.use(
      http.get('/api/health', () => {
        throw new Error('Network error');
      })
    );
    
    render(<ApiStatus />);
    
    // Wait for status to update to offline
    await waitFor(() => {
      expect(screen.getByText('Offline')).toBeInTheDocument();
    });
  });
});