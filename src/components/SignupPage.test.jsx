jest.mock('../services/api', () => ({
  registerUser: jest.fn(),
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
      onFeatures={noop}
      onHowItWorks={noop}
      onAboutUs={noop}
      {...props}
    />
  );

const goToStep2 = async () => {
  await userEvent.type(screen.getByLabelText(/Full Name/i), 'Jane Doe');
  await userEvent.click(screen.getByRole('button', { name: /Next/i }));
  await screen.findByLabelText(/Email Address/i);
};

const goToStep3 = async () => {
  await goToStep2();
  await userEvent.type(screen.getByLabelText(/Email Address/i), 'jane@example.com');
  await userEvent.type(screen.getByLabelText(/Phone Number/i), '+256700000000');
  await userEvent.click(screen.getByRole('button', { name: /Next/i }));
  await screen.findByLabelText(/^Password$/i);
};

beforeEach(() => {
  jest.clearAllMocks();
});

test('step 1 blocks advancing without a full name', async () => {
  renderSignupPage();

  await userEvent.click(screen.getByRole('button', { name: /Next/i }));

  expect(await screen.findByText(/Full name is required/i)).toBeInTheDocument();
  expect(screen.queryByLabelText(/Email Address/i)).not.toBeInTheDocument();
});

test('step 1 advances to step 2 once a full name is entered', async () => {
  renderSignupPage();
  await goToStep2();

  expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
});

test('step 2 rejects an invalid email and an invalid phone number', async () => {
  renderSignupPage();
  await goToStep2();

  await userEvent.type(screen.getByLabelText(/Email Address/i), 'not-an-email');
  await userEvent.type(screen.getByLabelText(/Phone Number/i), 'abc');
  await userEvent.click(screen.getByRole('button', { name: /Next/i }));

  expect(await screen.findByText(/Invalid email format/i)).toBeInTheDocument();
  expect(screen.getByText(/Invalid phone number format/i)).toBeInTheDocument();
});

test('the password-strength meter reflects the password entered on step 3', async () => {
  renderSignupPage();
  await goToStep3();

  const password = screen.getByLabelText(/^Password$/i);

  await userEvent.type(password, 'abc');
  expect(await screen.findByText(/Password strength: Weak/i)).toBeInTheDocument();

  await userEvent.clear(password);
  await userEvent.type(password, 'Abcdefgh1234');
  expect(await screen.findByText(/Password strength: Strong/i)).toBeInTheDocument();
});

test('step 3 requires matching passwords and agreement to terms before submitting', async () => {
  renderSignupPage();
  await goToStep3();

  await userEvent.type(screen.getByLabelText(/^Password$/i), 'Password1');
  await userEvent.type(screen.getByLabelText(/Confirm Password/i), 'Password2');
  await userEvent.click(screen.getByRole('button', { name: /Create Account/i }));

  expect(await screen.findByText(/Passwords do not match/i)).toBeInTheDocument();
  expect(await screen.findByText(/You must agree to the terms and conditions/i)).toBeInTheDocument();
  expect(api.registerUser).not.toHaveBeenCalled();
});

test('submits registration data once every step is valid', async () => {
  api.registerUser.mockResolvedValue({ user_id: 'u9' });
  const onSignup = jest.fn();
  renderSignupPage({ onSignup });
  await goToStep3();

  await userEvent.type(screen.getByLabelText(/^Password$/i), 'Password1');
  await userEvent.type(screen.getByLabelText(/Confirm Password/i), 'Password1');
  await userEvent.click(screen.getByRole('checkbox'));
  await userEvent.click(screen.getByRole('button', { name: /Create Account/i }));

  await waitFor(() => expect(api.registerUser).toHaveBeenCalled());
  expect(api.registerUser).toHaveBeenCalledWith({
    full_name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '+256700000000',
    password: 'Password1',
    language: 'en',
  });
  expect(onSignup).toHaveBeenCalledWith({ user_id: 'u9' });
});
