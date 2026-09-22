jest.mock('../services/api', () => ({
  loginUser: jest.fn(),
  utils: { storeUserData: jest.fn() },
}));

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from './LoginPage';
import api from '../services/api';

const noop = () => {};

const renderLoginPage = (props = {}) =>
  render(
    <LoginPage
      onLogin={noop}
      onBack={noop}
      onSwitchToSignup={noop}
      onFeatures={noop}
      onHowItWorks={noop}
      onAboutUs={noop}
      {...props}
    />
  );

beforeEach(() => {
  jest.clearAllMocks();
});

test('requires either an email or a phone number', async () => {
  renderLoginPage();

  await userEvent.type(screen.getByLabelText(/Password/i), 'secret1');
  await userEvent.click(screen.getByRole('button', { name: /Sign In/i }));

  expect(await screen.findAllByText(/Please provide either email or phone number/i)).toHaveLength(2);
  expect(api.loginUser).not.toHaveBeenCalled();
});

test('rejects a password shorter than 6 characters', async () => {
  renderLoginPage();

  await userEvent.type(screen.getByLabelText(/Email Address/i), 'a@b.com');
  await userEvent.type(screen.getByLabelText(/Password/i), '123');
  await userEvent.click(screen.getByRole('button', { name: /Sign In/i }));

  expect(await screen.findByText(/Password must be at least 6 characters long/i)).toBeInTheDocument();
  expect(api.loginUser).not.toHaveBeenCalled();
});

test('submits email + password and logs the user in on success', async () => {
  api.loginUser.mockResolvedValue({ user: { user_id: 'u1', email: 'a@b.com' } });
  const onLogin = jest.fn();
  renderLoginPage({ onLogin });

  await userEvent.type(screen.getByLabelText(/Email Address/i), 'a@b.com');
  await userEvent.type(screen.getByLabelText(/Password/i), 'secret1');
  await userEvent.click(screen.getByRole('button', { name: /Sign In/i }));

  await waitFor(() => expect(api.loginUser).toHaveBeenCalledWith({ email: 'a@b.com', password: 'secret1' }));
  expect(api.utils.storeUserData).toHaveBeenCalledWith({ user_id: 'u1', email: 'a@b.com' });
  expect(onLogin).toHaveBeenCalledWith({ user_id: 'u1', email: 'a@b.com' });
});

test('maps a 401 response to an invalid-credentials message', async () => {
  api.loginUser.mockRejectedValue({ response: { status: 401 } });
  renderLoginPage();

  await userEvent.type(screen.getByLabelText(/Email Address/i), 'a@b.com');
  await userEvent.type(screen.getByLabelText(/Password/i), 'secret1');
  await userEvent.click(screen.getByRole('button', { name: /Sign In/i }));

  expect(await screen.findByText(/Invalid credentials/i)).toBeInTheDocument();
});

test('maps a 400 response to the server-provided detail message', async () => {
  api.loginUser.mockRejectedValue({ response: { status: 400, data: { detail: 'Malformed request' } } });
  renderLoginPage();

  await userEvent.type(screen.getByLabelText(/Email Address/i), 'a@b.com');
  await userEvent.type(screen.getByLabelText(/Password/i), 'secret1');
  await userEvent.click(screen.getByRole('button', { name: /Sign In/i }));

  expect(await screen.findByText('Malformed request')).toBeInTheDocument();
});

test('falls back to a generic message for other errors', async () => {
  api.loginUser.mockRejectedValue(new Error('boom'));
  renderLoginPage();

  await userEvent.type(screen.getByLabelText(/Email Address/i), 'a@b.com');
  await userEvent.type(screen.getByLabelText(/Password/i), 'secret1');
  await userEvent.click(screen.getByRole('button', { name: /Sign In/i }));

  expect(await screen.findByText(/Login failed\. Please try again/i)).toBeInTheDocument();
});
