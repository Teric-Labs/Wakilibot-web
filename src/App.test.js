jest.mock('./services/api', () => ({
  __esModule: true,
  default: {
    performBackgroundHealthCheck: () => Promise.resolve({}),
    utils: {
      getStoredUserData: () => null,
    },
  },
}));

import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the landing page on first load', async () => {
  render(<App />);

  expect(
    await screen.findByText(/Capture complaints\. Report fraud\. Protect your money\./i)
  ).toBeInTheDocument();
});
