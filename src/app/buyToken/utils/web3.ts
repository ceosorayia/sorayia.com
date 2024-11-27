// utils/web3.ts
export const handleWeb3Error = async (error: any): Promise<string> => {
  console.error('Transaction error:', error);

  if (error.code === 'ACTION_REJECTED') {
    return 'Transaction rejected by user';
  }

  if (error.code === -32603) {
    return 'Insufficient funds for transaction';
  }

  if (error.data?.message) {
    return error.data.message;
  }

  return error.message || 'Transaction failed. Please try again.';
};
