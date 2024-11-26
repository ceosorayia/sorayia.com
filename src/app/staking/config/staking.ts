export const STAKING_CONFIG = {
  address: '0x1D86d4a3E08A254A54739Bc15E44240F01815A1C',
  abi: [
    'function stake(uint256 amount) external',
    'function withdraw(uint256 amount) external',
    'function getReward() external',
    'function balanceOf(address account) external view returns (uint256)',
    'function earned(address account) external view returns (uint256)',
    'function totalSupply() external view returns (uint256)',
    'function rewardRate() external view returns (uint256)',
    'function lastStakeTime(address account) external view returns (uint256)'
  ],
  lockPeriod: 9 * 24 * 60 * 60, // 9 days in seconds
  bnbPrice: 0.001 // 1 $SRA = 0.001 BNB
} as const;