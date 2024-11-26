import React from 'react';
import { Coins } from 'lucide-react';
import { TokenPrice } from '../types/ethereum';
import { PriceDisplay } from './PriceDisplay';

interface TokenPurchaseFormProps {
  amount: string;
  price: TokenPrice;
  onAmountChange: (amount: string) => void;
  onPurchase: () => Promise<void>;
  loading: boolean;
  tokenName: string;
}

export function TokenPurchaseForm({
  amount,
  price,
  onAmountChange,
  onPurchase,
  loading,
  tokenName,
}: TokenPurchaseFormProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">
        Amount of {tokenName} to buy
        </label>
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            placeholder="0.0"
            min="0"
            step="0.000000000000000001"
            className="w-full bg-white/5 border border-purple-300/30 rounded-xl py-3 px-4 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Coins className="w-6 h-6 text-purple-300" />
          </div>
        </div>
        
        <PriceDisplay price={price} />
      </div>

      <button
        onClick={onPurchase}
        disabled={loading || !amount}
        className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-xl transition duration-200 disabled:opacity-50 shadow-lg"
      >
        {loading ? 'Transaction en cours...' : `Acheter ${tokenName}`}
      </button>
    </div>
  );
}