import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { LockIcon, UnlockIcon, CoinsIcon } from 'lucide-react';
import { STAKING_CONFIG } from '../config/staking';
import { TOKEN_CONFIG } from '../config/token';
import { handleWeb3Error } from '../utils/web3';
import { getStakingContract } from '../utils/contracts';
import { StakingStats } from './StakingStats';
import { StakingForm } from './StakingForm';

export function StakingDashboard() {
  const [loading, setLoading] = useState(false);
  const [contractError, setContractError] = useState(false);
  const [stakingStats, setStakingStats] = useState({
    stakedBalance: '0',
    earnedRewards: '0',
    totalStaked: '0',
    rewardRate: '0',
    lastStakeTime: 0
  });
  const [amount, setAmount] = useState('');

  const fetchStakingStats = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const stakingContract = await getStakingContract(signer);

      const [stakedBalance, earnedRewards, totalStaked, rewardRate, lastStakeTime] = await Promise.all([
        stakingContract.balanceOf(signer.address).catch(() => ethers.parseEther('0')),
        stakingContract.earned(signer.address).catch(() => ethers.parseEther('0')),
        stakingContract.totalSupply().catch(() => ethers.parseEther('0')),
        stakingContract.rewardRate().catch(() => ethers.parseEther('0')),
        stakingContract.lastStakeTime(signer.address).catch(() => 0)
      ]);

      setStakingStats({
        stakedBalance: ethers.formatEther(stakedBalance),
        earnedRewards: ethers.formatEther(earnedRewards),
        totalStaked: ethers.formatEther(totalStaked),
        rewardRate: ethers.formatEther(rewardRate),
        lastStakeTime: Number(lastStakeTime)
      });
      setContractError(false);
    } catch (error) {
      console.error('Error fetching staking stats:', error);
      setContractError(true);
      toast.error('Unable to connect to staking contract. Please verify your network connection.');
    }
  };

  useEffect(() => {
    fetchStakingStats();
    const interval = setInterval(fetchStakingStats, 15000);
    return () => clearInterval(interval);
  }, []);

  const canWithdraw = () => {
    if (!stakingStats.lastStakeTime) return true;
    const unlockTime = stakingStats.lastStakeTime + STAKING_CONFIG.lockPeriod;
    const now = Math.floor(Date.now() / 1000);
    return now >= unlockTime;
  };

  const handleStake = async () => {
    if (!amount) return;
    
    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // First approve the staking contract
      const tokenContract = new ethers.Contract(
        TOKEN_CONFIG.address,
        TOKEN_CONFIG.abi,
        signer
      );
      
      const approvalTx = await tokenContract.approve(
        STAKING_CONFIG.address,
        ethers.parseEther(amount)
      );
      await approvalTx.wait();
      
      // Then stake
      const stakingContract = await getStakingContract(signer);
      
      const tx = await stakingContract.stake(ethers.parseEther(amount));
      await tx.wait();
      
      toast.success(`Successfully staked ${amount} $SRA (locked for 9 days)`);
      setAmount('');
      fetchStakingStats();
    } catch (error) {
      const errorMessage = await handleWeb3Error(error);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!amount) return;
    
    if (!canWithdraw()) {
      toast.error('Tokens are still locked. Please wait until the lock period ends.');
      return;
    }
    
    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const stakingContract = await getStakingContract(signer);
      
      const tx = await stakingContract.withdraw(ethers.parseEther(amount));
      await tx.wait();
      
      toast.success(`Successfully withdrawn ${amount} $SRA`);
      setAmount('');
      fetchStakingStats();
    } catch (error) {
      const errorMessage = await handleWeb3Error(error);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimRewards = async () => {
    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const stakingContract = await getStakingContract(signer);
      
      const tx = await stakingContract.getReward();
      await tx.wait();
      
      toast.success('Successfully claimed rewards');
      fetchStakingStats();
    } catch (error) {
      const errorMessage = await handleWeb3Error(error);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (contractError) {
    return (
      <div className="bg-red-500/10 backdrop-blur-lg rounded-2xl p-8 border border-red-500/20 text-center">
        <h2 className="text-2xl font-bold text-red-400 mb-4">Contract Connection Error</h2>
        <p className="text-red-200 mb-4">
          Unable to connect to the staking contract. Please verify:
        </p>
        <ul className="text-red-200 list-disc list-inside mb-4">
          <li>You are connected to the correct network</li>
          <li>The contract address is correct</li>
          <li>The contract is deployed and active</li>
        </ul>
        <button
          onClick={fetchStakingStats}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-xl transition duration-200"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <StakingStats stats={stakingStats} onClaimRewards={handleClaimRewards} loading={loading} />
      <StakingForm
        amount={amount}
        onAmountChange={setAmount}
        onStake={handleStake}
        onWithdraw={handleWithdraw}
        loading={loading}
        stakedBalance={stakingStats.stakedBalance}
        canWithdraw={canWithdraw()}
      />
    </div>
  );
}