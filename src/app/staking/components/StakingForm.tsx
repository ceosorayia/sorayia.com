import React from 'react';
import { LockIcon, UnlockIcon, Coins } from 'lucide-react';
import { STAKING_CONFIG } from '../config/staking';

interface StakingFormProps {
  amount: string;
  onAmountChange: (value: string) => void;
  onStake: () => Promise<void>;
  onWithdraw: () => Promise<void>;
  loading: boolean;
  stakedBalance: string;
  canWithdraw: boolean;
}

export function StakingForm({
  amount,
  onAmountChange,
  onStake,
  onWithdraw,
  loading,
  stakedBalance,
  canWithdraw
}: StakingFormProps) {
  const calculateBNBValue = (sraAmount: string) => {
    const bnbValue = Number(sraAmount) * STAKING_CONFIG.bnbPrice;
    return bnbValue.toFixed(6);
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
      <h2 className="text-2xl font-bold mb-6">Stake or Withdraw</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Amount
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
            {amount && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-sm text-purple-300">
                <Coins className="w-4 h-4" />
                ≈ {calculateBNBValue(amount)} BNB
              </div>
            )}
          </div>
          <p className="mt-2 text-sm text-blue-200">
            Staked Balance: {Number(stakedBalance).toLocaleString()} $SRA
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={onStake}
            disabled={loading || !amount}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-xl transition duration-200 disabled:opacity-50"
          >
            <LockIcon className="w-5 h-5" />
            {loading ? 'Staking...' : 'Stake'}
          </button>
          
          <button
            onClick={onWithdraw}
            disabled={loading || !amount || Number(amount) > Number(stakedBalance) || !canWithdraw}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-red-600 hover:from-pink-600 hover:to-red-700 text-white font-bold py-4 px-6 rounded-xl transition duration-200 disabled:opacity-50"
          >
            <UnlockIcon className="w-5 h-5" />
            {loading ? 'Withdrawing...' : 'Withdraw'}
          </button>
        </div>

        <p className="text-sm text-center text-yellow-400">
          Note: Staked tokens are locked for 9 days
        </p>
      </div>
    </div>
  );
}