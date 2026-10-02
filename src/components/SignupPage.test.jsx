jest.mock('../services/api', () => ({
  registerUser: jest.fn(),
  utils: { storeUserData: jest.fn() },
}));

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignupPage from './SignupPage';
import api from '../services/api';

const noop = () => {};

const renderSignupPage = (props = {}) =>
  render(
    <SignupPage
      onSignup={noop}
      onBack={noop}
      onSwitchToLogin={noop}
      onContinueAsGuest={noop}
      {...props}
    />
  );

const fillValidForm = async () => {
  await userEvent.type(screen.getByLabelText(/Full name/i), 'Jane Doe');
  await userEvent.type(screen.getByLabelText(/Email address/i), 'jane@example.com');
  await userEvent.type(screen.getByLabelText(/^Password$/i), 'password123');
  await userEvent.click(screen.getByRole('checkbox', { name: /agree to the terms/i }));
};

beforeEach(() => {
  jest.clearAllMocks();
});

test('blocks submission when required fields are empty', async () => {
  renderSignupPage();

  await userEvent.click(screen.getByRole('button', { name: /^Continue$/i }));

  expect(await screen.findByText(/Name is required/i)).toBeInTheDocument();
  expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
  expect(api.registerUser).not.toHaveBeenCalled();
});

test('rejects an invalid email address', async () => {
  renderSignupPage();

  await userEvent.type(screen.getByLabelText(/Full name/i), 'Jane Doe');
  await userEvent.type(screen.getByLabelText(/Email address/i), 'not-an-email');
  await userEvent.type(screen.getByLabelText(/^Password$/i), 'password123');
  await userEvent.click(screen.getByRole('checkbox', { name: /agree to the terms/i }));
  await userEvent.click(screen.getByRole('button', { name: /^Continue$/i }));

  expect(await screen.findByText(/Invalid email/i)).toBeInTheDocument();
  expect(api.registerUser).not.toHaveBeenCalled();
});

test('rejects a password shorter than 8 characters', async () => {
  renderSignupPage();

  await userEvent.type(screen.getByLabelText(/Full name/i), 'Jane Doe');
  await userEvent.type(screen.getByLabelText(/Email address/i), 'jane@example.com');
  await userEvent.type(screen.getByLabelText(/^Password$/i), 'short');
  await userEvent.click(screen.getByRole('checkbox', { name: /agree to the terms/i }));
  await userEvent.click(screen.getByRole('button', { name: /^Continue$/i }));

  expect(await screen.findByText(/At least 8 characters/i)).toBeInTheDocument();
  expect(api.registerUser).not.toHaveBeenCalled();
});

test('requires agreement to the terms before submitting', async () => {
  renderSignupPage();

  await userEvent.type(screen.getByLabelText(/Full name/i), 'Jane Doe');
  await userEvent.type(screen.getByLabelText(/Email address/i), 'jane@example.com');
  await userEvent.type(screen.getByLabelText(/^Password$/i), 'password123');
  await userEvent.click(screen.getByRole('button', { name: /^Continue$/i }));

  expect(await screen.findByText(/Please accept the terms/i)).toBeInTheDocument();
  expect(api.registerUser).not.toHaveBeenCalled();
});

test('the password visibility toggle switches the field between hidden and visible', async () => {
  renderSignupPage();

  const passwordField = screen.getByLabelText(/^Password$/i);
  expect(passwordField).toHaveAttribute('type', 'password');

  await userEvent.click(screen.getByRole('button', { name: /Show password/i }));
  expect(passwordField).toHaveAttribute('type', 'text');

  await userEvent.click(screen.getByRole('button', { name: /Hide password/i }));
  expect(passwordField).toHaveAttribute('type', 'password');
});

test('submits registration data once the form is valid, and signs the user in', async () => {
  api.registerUser.mockResolvedValue({ user: { user_id: 'u9' } });
  const onSignup = jest.fn();
  renderSignupPage({ onSignup });

  await fillValidForm();
  await userEvent.click(screen.getByRole('button', { name: /^Continue$/i }));

  await waitFor(() => expect(api.registerUser).toHaveBeenCalled());
  expect(api.registerUser).toHaveBeenCalledWith({
    full_name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'password123',
    preferred_language: 'english',
  });
  expect(api.utils.storeUserData).toHaveBeenCalledWith({ user_id: 'u9' });
  expect(onSignup).toHaveBeenCalledWith({ user_id: 'u9' });
});

test('shows a server-provided error message when registration fails', async () => {
  api.registerUser.mockRejectedValue({ response: { data: { detail: 'Email already registered' } } });
  renderSignupPage();

  await fillValidForm();
  await userEvent.click(screen.getByRole('button', { name: /^Continue$/i }));

  expect(await screen.findByText(/Email already registered/i)).toBeInTheDocument();
});

test('continue as guest calls onContinueAsGuest without registering', async () => {
  const onContinueAsGuest = jest.fn();
  renderSignupPage({ onContinueAsGuest });

  await userEvent.click(screen.getByRole('button', { name: /Continue as guest/i }));

  expect(onContinueAsGuest).toHaveBeenCalled();
  expect(api.registerUser).not.toHaveBeenCalled();
});
