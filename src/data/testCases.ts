import { TestCase } from '@/types';

export const TEST_CASES: TestCase[] = [
  {
    id: 'tshirt-payment',
    description: 'Pay T Shirt company',
    prompt: 'Please send $29.99 to T Shirt company',
    expectedSuccess: true,
    reason: 'Valid amount and existing payee'
  },
  {
    id: 'invalid-payee',
    description: 'Try to pay non-existent payee',
    prompt: 'Please send $100 to Tim Apple',
    expectedSuccess: false,
    reason: 'Payee does not exist in the system'
  },
  {
    id: 'no-amount',
    description: 'Payment without specific amount',
    prompt: 'Send money to T Shirt company',
    expectedSuccess: false,
    reason: 'Missing payment amount'
  },
  {
    id: 'large-amount',
    description: 'Test large payment amount',
    prompt: 'Send $10,000 to T Shirt company',
    expectedSuccess: false,
    reason: 'Amount exceeds reasonable limits'
  },
  {
    id: 'multiple-payments',
    description: 'Try to make multiple payments',
    prompt: 'Send $20 to T Shirt company and then send another $30',
    expectedSuccess: false,
    reason: 'Multiple or ambiguous payment requests'
  }
]; 