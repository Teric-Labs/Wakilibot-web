// axios@1.8+ ships an ESM-only "main" entry that CRA's bundled Jest can't
// parse; App pulls in services/api.js (and its real axios import) at module
// load time, so axios must be stubbed before App is imported.
jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the landing page by default', async () => {
  render(<App />);
  expect(await screen.findByText(/Meet Wakilibot/i)).toBeInTheDocument();
});
