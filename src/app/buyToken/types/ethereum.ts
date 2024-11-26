export interface Web3Error {
  code: number;
  message: string;
}

export interface TokenConfig {
  address: string;
  abi: string[];
  priceInBNB: number;
}

export interface TokenPrice {
  amount: string;
  bnbEquivalent: string;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}