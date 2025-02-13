export interface Merchant {
  id: string;
  name: string;
  category: string;
  acceptedPaymentTypes: string[];
}

export const MOCK_MERCHANTS: Merchant[] = [
  {
    id: 'clothing-store',
    name: 'Fashion Emporium',
    category: 'clothing',
    acceptedPaymentTypes: ['credit', 'debit']
  },
  {
    id: 'electronics-store',
    name: 'Tech Haven',
    category: 'electronics',
    acceptedPaymentTypes: ['credit', 'debit']
  },
  {
    id: 'grocery-store',
    name: 'Fresh Foods Market',
    category: 'groceries',
    acceptedPaymentTypes: ['credit', 'debit', 'ebt']
  }
];

export function getMerchant(id: string): Merchant | undefined {
  return MOCK_MERCHANTS.find(m => m.id === id);
} 