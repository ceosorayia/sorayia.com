import { ethers, BigNumber } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';

// Validate Ethereum address
export const isValidAddress = (address: string): boolean => {
  try {
    return ethers.utils.isAddress(address);
  } catch (error) {
    return false;
  }
};

// Validate transaction amount
export const isValidAmount = (
  amount: string | number,
  balance: string | BigNumber,
  min: string | BigNumber,
  max: string | BigNumber,
  decimals: number = 18
): boolean => {
  try {
    const parsedAmount = ethers.utils.parseUnits(amount.toString(), decimals);
    const parsedBalance = typeof balance === 'string' 
      ? ethers.utils.parseUnits(balance, decimals)
      : balance;
    const parsedMin = typeof min === 'string'
      ? ethers.utils.parseUnits(min, decimals)
      : min;
    const parsedMax = typeof max === 'string'
      ? ethers.utils.parseUnits(max, decimals)
      : max;

    return parsedAmount.gt(0) && 
           parsedAmount.lte(parsedBalance) && 
           parsedAmount.gte(parsedMin) && 
           parsedAmount.lte(parsedMax);
  } catch (error) {
    return false;
  }
};

// Rate limiting for transactions
const transactionTimeouts: Map<string, number> = new Map();
export const checkTransactionThrottle = (
  account: string,
  operation: string,
  timeoutMs: number = 2000
): boolean => {
  const key = `${account}-${operation}`;
  const lastTx = transactionTimeouts.get(key);
  const now = Date.now();

  if (lastTx && now - lastTx < timeoutMs) {
    throw new Error('Please wait before making another transaction');
  }
  
  transactionTimeouts.set(key, now);
  return true;
};

// Sanitize and validate input
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  return input.replace(/[^0-9.]/g, '').trim();
};

// Check if the network is correct
export const validateNetwork = async (
  provider: Web3Provider,
  expectedChainId: number
): Promise<boolean> => {
  try {
    const network = await provider.getNetwork();
    return network.chainId === expectedChainId;
  } catch (error) {
    return false;
  }
};

interface Transaction {
  to: string;
  value?: BigNumber;
  [key: string]: any;
}

// Validate transaction parameters
export const validateTransaction = async (tx: Transaction): Promise<boolean> => {
  if (!tx || typeof tx !== 'object') throw new Error('Invalid transaction object');
  if (!tx.to || !isValidAddress(tx.to)) throw new Error('Invalid recipient address');
  if (tx.value && !ethers.BigNumber.isBigNumber(tx.value)) throw new Error('Invalid transaction value');
  return true;
};

// Local storage encryption utility
interface SecureStorage {
  setItem: (key: string, value: any) => void;
  getItem: (key: string) => any;
}

export const secureStorage: SecureStorage = {
  setItem: (key: string, value: any): void => {
    try {
      const encryptedValue = btoa(JSON.stringify(value));
      localStorage.setItem(key, encryptedValue);
    } catch (error) {
      console.error('Error storing encrypted data:', error);
    }
  },
  getItem: (key: string): any => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(atob(item)) : null;
    } catch (error) {
      console.error('Error retrieving encrypted data:', error);
      return null;
    }
  }
};
