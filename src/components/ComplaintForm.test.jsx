jest.mock('../services/api', () => ({
  submitComplaint: jest.fn(),
}));

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ComplaintForm from './ComplaintForm';
import api from '../services/api';

const noop = () => {};

// MUI's Collapse (used by StepContent) can leave a just-completed step's
// button in the DOM while it animates closed, so more than one "Next Step"
// button can transiently coexist. Steps render in order, so the active
// step's button is always the last one in the DOM.
const nextStepButton = async () => {
  const buttons = await screen.findAllByRole('button', { name: 'Next Step' });
  return buttons[buttons.length - 1];
};

const selectOption = async (combobox, optionNameRegex) => {
  await userEvent.click(combobox);
  await userEvent.click(await screen.findByRole('option', { name: optionNameRegex }));
};

const fillPersonalInfo = async () => {
  await userEvent.type(screen.getByLabelText(/Full Name/i), 'Jane Doe');
  await userEvent.type(screen.getByLabelText(/Email Address/i), 'jane@example.com');
  await userEvent.type(screen.getByLabelText(/Phone Number/i), '+256700000000');
  await userEvent.click(await nextStepButton());
};

beforeEach(() => {
  jest.clearAllMocks();
});

test('personal info step requires a valid full name, email, and phone', async () => {
  render(<ComplaintForm onBack={noop} onSuccess={noop} />);

  await userEvent.type(screen.getByLabelText(/Email Address/i), 'not-an-email');
  await userEvent.type(screen.getByLabelText(/Phone Number/i), 'abc');
  await userEvent.click(await nextStepButton());

  expect(await screen.findByText(/Full name is required/i)).toBeInTheDocument();
  expect(screen.getByText(/Invalid email format/i)).toBeInTheDocument();
  expect(screen.getByText(/Invalid phone number format/i)).toBeInTheDocument();
});

test('complaint-details step rejects a description shorter than 20 characters', async () => {
  render(<ComplaintForm onBack={noop} onSuccess={noop} />);
  await fillPersonalInfo();

  const boxes = await screen.findAllByRole('combobox');
  await selectOption(boxes[0], /Mobile Money Services/i);
  await selectOption(boxes[1], /Fraud\/Theft/i);
  await userEvent.type(screen.getByLabelText(/Company\/Service Provider/i), 'MTN Uganda');
  await userEvent.type(screen.getByLabelText(/Detailed Description/i), 'too short');

  await userEvent.click(await nextStepButton());

  expect(await screen.findByText(/Description must be at least 20 characters/i)).toBeInTheDocument();
  expect(api.submitComplaint).not.toHaveBeenCalled();
});

test('requires agreement to terms, then submits the complaint successfully', async () => {
  api.submitComplaint.mockResolvedValue({ complaint_id: 'CMP-1' });
  const onSuccess = jest.fn();
  render(<ComplaintForm onBack={noop} onSuccess={onSuccess} />);
  await fillPersonalInfo();

  const boxes = await screen.findAllByRole('combobox');
  await selectOption(boxes[0], /Mobile Money Services/i);
  await selectOption(boxes[1], /Fraud\/Theft/i);
  await userEvent.type(screen.getByLabelText(/Company\/Service Provider/i), 'MTN Uganda');
  await userEvent.type(
    screen.getByLabelText(/Detailed Description/i),
    'My mobile money transaction of 50000 UGX failed but I was still charged.'
  );
  await userEvent.click(await nextStepButton());

  // Additional Information step: try to advance without agreeing to terms
  await screen.findByRole('checkbox');
  await userEvent.click(await nextStepButton());
  expect(await screen.findByText(/You must agree to the terms/i)).toBeInTheDocument();
  expect(api.submitComplaint).not.toHaveBeenCalled();

  await userEvent.click(screen.getByRole('checkbox'));
  await userEvent.click(await nextStepButton());

  await userEvent.click(await screen.findByRole('button', { name: 'Submit Complaint' }));

  await waitFor(() => expect(api.submitComplaint).toHaveBeenCalled());
  expect(api.submitComplaint).toHaveBeenCalledWith({
    issue_type: 'fraud',
    description: 'My mobile money transaction of 50000 UGX failed but I was still charged.',
    company_name: 'MTN Uganda',
    contact_details: 'jane@example.com, +256700000000',
    transaction_id: null,
  });
  expect(onSuccess).toHaveBeenCalledWith({ complaint_id: 'CMP-1' });
});
