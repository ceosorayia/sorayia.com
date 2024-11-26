import { TokenPrice } from '../types/ethereum';
import { TOKEN_CONFIG } from '../config/token';

export function calculateBNBPrice(tokenAmount: string): TokenPrice {
  if (!tokenAmount || isNaN(Number(tokenAmount))) {
    return { amount: '0', bnbEquivalent: '0' };
  }

  const bnbAmount = Number(tokenAmount) * TOKEN_CONFIG.priceInBNB;
  
  return {
    amount: tokenAmount,
    bnbEquivalent: bnbAmount.toFixed(8),
  };
}