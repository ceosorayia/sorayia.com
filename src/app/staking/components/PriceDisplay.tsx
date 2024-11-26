import React from 'react';
import { TokenPrice } from '../types/ethereum';

interface PriceDisplayProps {
  price: TokenPrice;
}

export function PriceDisplay({ price }: PriceDisplayProps) {
  if (!price.amount || price.amount === '0') return null;

  return (
    <div className="mt-4 p-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg border border-white/5">
      <div className="flex justify-between items-center">
        <span className="text-purple-200">Coût en BNB:</span>
        <span className="font-mono text-lg text-white">
          {price.bnbEquivalent} BNB
        </span>
      </div>
    </div>
  );
}