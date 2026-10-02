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
      onContinueAsGuest={noop}
      {...props}
    />
  );

const fillValidForm = async () => {
  await userEvent.type(screen.getByLabelText(/Email address/i), 'a@b.com');
  await userEvent.type(screen.getByLabelText(/^Password$/i), 'secret1');
};

beforeEach(() => {
  jest.clearAllMocks();
});

test('requires an email', async () => {
  renderLoginPage();

  await userEvent.type(screen.getByLabelText(/^Password$/i), 'secret1');
  await userEvent.click(screen.getByRole('button', { name: /^Continue$/i }));

  expect(await screen.findByText(/Email is required/i)).toBeInTheDocument();
  expect(api.loginUser).not.toHaveBeenCalled();
});

test('rejects a malformed email address', async () => {
  renderLoginPage();

  await userEvent.type(screen.getByLabelText(/Email address/i), 'not-an-email');
  await userEvent.type(screen.getByLabelText(/^Password$/i), 'secret1');
  await userEvent.click(screen.getByRole('button', { name: /^Continue$/i }));

  expect(await screen.findByText(/Enter a valid email/i)).toBeInTheDocument();
  expect(api.loginUser).not.toHaveBeenCalled();
});

test('requires a password', async () => {
  renderLoginPage();

  await userEvent.type(screen.getByLabelText(/Email address/i), 'a@b.com');
  await userEvent.click(screen.getByRole('button', { name: /^Continue$/i }));

  expect(await screen.findByText(/Password is required/i)).toBeInTheDocument();
  expect(api.loginUser).not.toHaveBeenCalled();
});

test('the password visibility toggle switches the field between hidden and visible', async () => {
  renderLoginPage();

  const passwordField = screen.getByLabelText(/^Password$/i);
  expect(passwordField).toHaveAttribute('type', 'password');

  await userEvent.click(screen.getByRole('button', { name: /Show password/i }));
  expect(passwordField).toHaveAttribute('type', 'text');

  await userEvent.click(screen.getByRole('button', { name: /Hide password/i }));
  expect(passwordField).toHaveAttribute('type', 'password');
});

test('submits email + password and logs the user in on success', async () => {
  api.loginUser.mockResolvedValue({ user: { user_id: 'u1', email: 'a@b.com' } });
  const onLogin = jest.fn();
  renderLoginPage({ onLogin });

  await fillValidForm();
  await userEvent.click(screen.getByRole('button', { name: /^Continue$/i }));

  await waitFor(() => expect(api.loginUser).toHaveBeenCalledWith({ email: 'a@b.com', password: 'secret1' }));
  expect(api.utils.storeUserData).toHaveBeenCalledWith({ user_id: 'u1', email: 'a@b.com' });
  expect(onLogin).toHaveBeenCalledWith({ user_id: 'u1', email: 'a@b.com' });
});

test('maps a 401 response to an invalid-credentials message', async () => {
  api.loginUser.mockRejectedValue({ response: { status: 401 } });
  renderLoginPage();

  await fillValidForm();
  await userEvent.click(screen.getByRole('button', { name: /^Continue$/i }));

  expect(await screen.findByText(/Incorrect email or password/i)).toBeInTheDocument();
});

test('maps a non-401 response to the server-provided detail message', async () => {
  api.loginUser.mockRejectedValue({ response: { status: 400, data: { detail: 'Malformed request' } } });
  renderLoginPage();

  await fillValidForm();
  await userEvent.click(screen.getByRole('button', { name: /^Continue$/i }));

  expect(await screen.findByText('Malformed request')).toBeInTheDocument();
});

test('falls back to a generic message for other errors', async () => {
  api.loginUser.mockRejectedValue(new Error('boom'));
  renderLoginPage();

  await fillValidForm();
  await userEvent.click(screen.getByRole('button', { name: /^Continue$/i }));

  expect(await screen.findByText(/Sign-in failed\. Try again\./i)).toBeInTheDocument();
});

test('continue as guest calls onContinueAsGuest without logging in', async () => {
  const onContinueAsGuest = jest.fn();
  renderLoginPage({ onContinueAsGuest });

  await userEvent.click(screen.getByRole('button', { name: /Continue as guest/i }));

  expect(onContinueAsGuest).toHaveBeenCalled();
  expect(api.loginUser).not.toHaveBeenCalled();
});
