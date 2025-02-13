import { PaymanToolkit } from '@/lib/payman';

export async function verifyPayment(
  merchantId: string,
  expectedAmount: number,
  actualAmount: number,
  transactionId: string
) {
  // Verify the transaction status with Payman
  const transactionStatus = await PaymanToolkit.getTransactionStatus(transactionId);

  return {
    verified: transactionStatus.success && 
              transactionStatus.merchantId === merchantId &&
              Math.abs(actualAmount - expectedAmount) < 0.01,
    transactionId,
    status: transactionStatus.status
  };
} 