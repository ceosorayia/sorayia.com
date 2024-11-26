import React from 'react';
import { Trophy, Coins } from 'lucide-react';
import { STAKING_CONFIG } from '../config/staking';

interface StakingStatsProps {
  stats: {
    stakedBalance: string;
    earnedRewards: string;
    totalStaked: string;
    rewardRate: string;
    lastStakeTime: number;
  };
  onClaimRewards: () => Promise<void>;
  loading: boolean;
}

export function StakingStats({ stats, onClaimRewards, loading }: StakingStatsProps) {
  const calculateBNBValue = (sraAmount: string) => {
    const bnbValue = Number(sraAmount) * STAKING_CONFIG.bnbPrice;
    return bnbValue.toFixed(6);
  };

  const calculateTimeRemaining = () => {
    if (!stats.lastStakeTime) return 0;
    const unlockTime = stats.lastStakeTime + STAKING_CONFIG.lockPeriod;
    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, unlockTime - now);
  };

  const formatTimeRemaining = (seconds: number) => {
    if (seconds === 0) return 'Unlocked';
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    return `${days}d ${hours}h until unlock`;
  };

  const timeRemaining = calculateTimeRemaining();

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
      <h2 className="text-2xl font-bold mb-6">Staking Overview</h2>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatCard
            label="Your Staked Balance"
            value={`${Number(stats.stakedBalance).toLocaleString()} $SRA`}
            subValue={`≈ ${calculateBNBValue(stats.stakedBalance)} BNB`}
            lockStatus={formatTimeRemaining(timeRemaining)}
          />
          <StatCard
            label="Total Value Locked"
            value={`${Number(stats.totalStaked).toLocaleString()} $SRA`}
            subValue={`≈ ${calculateBNBValue(stats.totalStaked)} BNB`}
          />
          <StatCard
            label="Earned Rewards"
            value={`${Number(stats.earnedRewards).toLocaleString()} $SRA`}
            subValue={`≈ ${calculateBNBValue(stats.earnedRewards)} BNB`}
          />
          <StatCard
            label="Reward Rate"
            value={`${Number(stats.rewardRate).toLocaleString()} $SRA/block`}
            subValue={`≈ ${calculateBNBValue(stats.rewardRate)} BNB/block`}
          />
        </div>

        {Number(stats.earnedRewards) > 0 && (
          <button
            onClick={onClaimRewards}
            disabled={loading}
            className="w-full mt-6 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold py-4 px-6 rounded-xl transition duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Trophy className="w-5 h-5" />
            {loading ? 'Claiming...' : 'Claim Rewards'}
          </button>
        )}
      </div>
    </div>
  );
}

function StatCard({ 
  label, 
  value, 
  subValue, 
  lockStatus 
}: { 
  label: string; 
  value: string; 
  subValue?: string;
  lockStatus?: string;
}) {
  return (
    <div className="bg-white/5 rounded-xl p-4">
      <p className="text-sm text-blue-200">{label}</p>
      <p className="text-lg font-bold mt-1">{value}</p>
      {subValue && (
        <p className="text-sm text-purple-300 mt-1 flex items-center gap-1">
          <Coins className="w-4 h-4" />
          {subValue}
        </p>
      )}
      {lockStatus && (
        <p className={`text-sm mt-2 ${
          lockStatus === 'Unlocked' ? 'text-green-400' : 'text-yellow-400'
        }`}>
          {lockStatus}
        </p>
      )}
    </div>
  );
}