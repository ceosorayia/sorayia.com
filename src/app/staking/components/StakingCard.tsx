import React, { useState, useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import { ethers, BigNumber } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import { TOKEN_ADDRESS, STAKING_ADDRESS, TOKEN_DECIMALS } from '../contracts/config';
import ERC20ABI from '../contracts/abis/ERC20ABI.json';
import StakingABI from '../contracts/abis/StakingABI.json';
import { 
  isValidAmount, 
  checkTransactionThrottle, 
  sanitizeInput,
  validateTransaction,
  validateNetwork 
} from '../utils/security';
import { UserStake, TimeLeft, StakingCardProps } from '../types/staking';

const EXPECTED_CHAIN_ID = 56; // BSC Mainnet

// Utility function to format error messages
const formatErrorMessage = (error: any): string => {
  const errorMessage = error?.message || String(error);
  
  // Handle rejected transaction errors
  if (errorMessage.includes('user rejected transaction')) {
    return 'Transaction cancelled by user';
  }
  
  // Handle specific errors
  const errorMap: { [key: string]: string } = {
    'insufficient funds': 'Insufficient funds to complete the transaction',
    'execution reverted': 'Transaction failed - Please check your amounts',
    'nonce too high': 'Transaction error - Please refresh the page',
    'already pending': 'A transaction is already pending',
    'gas required exceeds allowance': 'Insufficient funds for transaction fees',
    'intrinsic gas too low': 'Gas error - Please try again',
    'replacement fee too low': 'Replacement fee too low',
    'cannot estimate gas': 'Unable to estimate gas - Please try a different amount',
    'transaction underpriced': 'Transaction underpriced - Please try again',
    'unpredictable gas limit': 'Unable to estimate gas limit - Please try a different amount',
    'network busy': 'Network is busy - Please try again later',
    'timeout': 'Transaction timeout - Please try again',
    'rejected': 'Transaction rejected - Please try again',
    'failed to fetch': 'Network connection error - Please check your connection'
  };

  // Check for matches in error messages
  for (const [key, value] of Object.entries(errorMap)) {
    if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }

  // Default message if no match is found
  return 'An error occurred. Please try again.';
};

const StakingCard: React.FC<StakingCardProps> = () => {
  const { active, account, library } = useWeb3React<Web3Provider>();
  const [tokenBalance, setTokenBalance] = useState<string>("0");
  const [stakedAmount, setStakedAmount] = useState<string>("0");
  const [pendingRewards, setPendingRewards] = useState<string>("0");
  const [stakeAmount, setStakeAmount] = useState<string>("");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [isStaking, setIsStaking] = useState<boolean>(false);
  const [isWithdrawing, setIsWithdrawing] = useState<boolean>(false);
  const [isClaiming, setIsClaiming] = useState<boolean>(false);
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [allowance, setAllowance] = useState<string>("0");
  const [lockEndTime, setLockEndTime] = useState<number>(0);
  const [minStakeAmount, setMinStakeAmount] = useState<string>("0");
  const [maxStakeAmount, setMaxStakeAmount] = useState<string>("0");
  const [lockPeriod, setLockPeriod] = useState<number>(0);
  const [totalStakedAmount, setTotalStakedAmount] = useState<string>("0");
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [error, setError] = useState<string>("");

  // Contract instances
  const tokenContract = React.useMemo(() => {
    if (library && active) {
      try {
        const contract = new ethers.Contract(TOKEN_ADDRESS, ERC20ABI, library.getSigner());
        if (!contract.address) throw new Error('Invalid token contract');
        return contract;
      } catch (error) {
        console.error('Error creating token contract:', error);
        setError(formatErrorMessage(error));
        return null;
      }
    }
    return null;
  }, [library, active]);

  const stakingContract = React.useMemo(() => {
    if (library && active) {
      try {
        const contract = new ethers.Contract(STAKING_ADDRESS, StakingABI, library.getSigner());
        if (!contract.address) throw new Error('Invalid staking contract');
        return contract;
      } catch (error) {
        console.error('Error creating staking contract:', error);
        setError(formatErrorMessage(error));
        return null;
      }
    }
    return null;
  }, [library, active]);

  // Input handlers and validation
  const handleStakeAmountChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const sanitizedValue = sanitizeInput(e.target.value);
    setStakeAmount(sanitizedValue);
    setError("");
  };

  const handleWithdrawAmountChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const sanitizedValue = sanitizeInput(e.target.value);
    setWithdrawAmount(sanitizedValue);
    setError("");
  };

  // Validation functions
  const validateStakeAmount = (): void => {
    if (!isValidAmount(stakeAmount, tokenBalance, minStakeAmount, maxStakeAmount)) {
      throw new Error('Invalid stake amount');
    }
  };

  const validateWithdrawAmount = (): void => {
    if (!isValidAmount(withdrawAmount, stakedAmount, "0", stakedAmount)) {
      throw new Error('Invalid withdraw amount');
    }
  };

  // Check if enough allowance is given
  const checkAndApproveToken = async (amount: BigNumber): Promise<boolean> => {
    try {
      if (!tokenContract || !account) return false;
      
      const currentAllowance = await tokenContract.allowance(account, STAKING_ADDRESS);
      if (currentAllowance.lt(amount)) {
        const approveTx = await tokenContract.approve(STAKING_ADDRESS, ethers.constants.MaxUint256);
        await approveTx.wait();
        return true;
      }
      return true;
    } catch (error) {
      console.error('Approval error:', error);
      throw new Error('Failed to approve tokens');
    }
  };

  // Fetch user rewards
  const fetchUserRewards = async () => {
    if (!active || !stakingContract || !account) return;
    
    try {
      const pendingRewards = await stakingContract.calculatePendingRewards(account);
      setPendingRewards(ethers.utils.formatUnits(pendingRewards, TOKEN_DECIMALS));
    } catch (error) {
      console.error("Error fetching pending rewards:", error);
      setError(formatErrorMessage(error));
    }
  };

  // Fetch total staked amount
  const fetchTotalStaked = async () => {
    if (!stakingContract) return;
    try {
      const total = await stakingContract.totalStaked();
      const formatted = ethers.utils.formatUnits(total, TOKEN_DECIMALS);
      setTotalStakedAmount(formatted);
    } catch (error) {
      console.error('Error fetching total staked:', error);
      setError(formatErrorMessage(error));
    }
  };

  // Utility functions
  const formatDisplayNumber = (value: string | number): string => {
    try {
      if (!value || value === "0" || value === "0.0") return "0.0000";
      const num = typeof value === 'string' ? parseFloat(value) : value;
      return num.toFixed(4);
    } catch (error) {
      console.error("Error formatting display number:", error);
      setError(formatErrorMessage(error));
      return "0.0000";
    }
  };

  const formatAmount = (amount: BigNumber | string): string => {
    try {
      if (!amount || amount === "0" || amount === "0.0") return "0.0000";
      return ethers.utils.formatUnits(BigNumber.from(amount), TOKEN_DECIMALS);
    } catch (error) {
      console.error("Error formatting amount:", error);
      setError(formatErrorMessage(error));
      return "0.0000";
    }
  };

  const parseAmount = (amount: string): BigNumber => {
    try {
      return ethers.utils.parseUnits(amount.toString(), TOKEN_DECIMALS);
    } catch (error) {
      console.error("Error parsing amount:", error);
      setError(formatErrorMessage(error));
      return BigNumber.from(0);
    }
  };

  // Main data fetching effect
  useEffect(() => {
    const fetchData = async () => {
      if (!active || !account || !tokenContract || !stakingContract) return;

      try {
        console.log('Fetching staking data...');
        
        // Fetch contract data
        const [
          balance,
          currentAllowance,
          minStake,
          maxStake,
          lockPeriodValue,
          userStake
        ] = await Promise.all([
          tokenContract.balanceOf(account),
          tokenContract.allowance(account, STAKING_ADDRESS),
          stakingContract.minStakeAmount(),
          stakingContract.maxStakeAmount(),
          stakingContract.lockPeriod(),
          stakingContract.getUserStake(account)
        ]);

        console.log('Raw values from contract:', {
          minStake: minStake.toString(),
          maxStake: maxStake.toString(),
          balance: balance.toString()
        });

        // Format values with proper decimal places
        const formattedBalance = ethers.utils.formatUnits(balance, TOKEN_DECIMALS);
        const formattedAllowance = ethers.utils.formatUnits(currentAllowance, TOKEN_DECIMALS);
        const formattedMinStake = ethers.utils.formatUnits(minStake, TOKEN_DECIMALS);
        const formattedMaxStake = ethers.utils.formatUnits(maxStake, TOKEN_DECIMALS);
        const formattedStakedAmount = ethers.utils.formatUnits(userStake.stakedAmount, TOKEN_DECIMALS);

        console.log('Formatted values:', {
          min: formattedMinStake,
          max: formattedMaxStake,
          balance: formattedBalance
        });

        setTokenBalance(formattedBalance);
        setStakedAmount(formattedStakedAmount);
        setLockEndTime(userStake.lockEndTime.toNumber());
        setAllowance(formattedAllowance);
        setMinStakeAmount(formattedMinStake);
        setMaxStakeAmount(formattedMaxStake);
        setLockPeriod(lockPeriodValue.toNumber());

        // Fetch total staked amount
        await fetchTotalStaked();
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(formatErrorMessage(error));
      }
    };

    fetchData();
    // Update data every 10 seconds instead of 5
    const dataInterval = setInterval(fetchData, 10000);
    return () => clearInterval(dataInterval);
  }, [active, account, tokenContract, stakingContract]);

  // More frequent updates for pending rewards
  useEffect(() => {
    if (!active || !stakingContract || !account) return;

    fetchUserRewards();
    // Update rewards every second for more accurate display
    const rewardsInterval = setInterval(fetchUserRewards, 1000);
    return () => clearInterval(rewardsInterval);
  }, [active, stakingContract, account]);

  // After successful transactions, refresh all data
  const refreshAllData = async () => {
    try {
      await Promise.all([
        fetchUserRewards(),
        fetchTotalStaked()
      ]);
    } catch (error) {
      console.error("Error refreshing data:", error);
      setError(formatErrorMessage(error));
    }
  };

  // Main actions
  const stake = async (): Promise<void> => {
    try {
      setError("");
      if (!active || !account) throw new Error('Please connect your wallet');
      if (!stakingContract) throw new Error('Contract not initialized');
      if (!library) throw new Error('Library not initialized');
      if (!stakeAmount || stakeAmount === '0') throw new Error('Please enter a valid amount');
      
      // Security: Network validation
      const isCorrectNetwork = await validateNetwork(library, EXPECTED_CHAIN_ID);
      if (!isCorrectNetwork) throw new Error('Please connect to BSC Mainnet');

      // Security: Rate limiting
      checkTransactionThrottle(account, 'stake');
      
      // Amount validation
      const minStake = await stakingContract.minStakeAmount();
      const maxStake = await stakingContract.maxStakeAmount();
      if (!tokenContract) throw new Error('Token contract not initialized');
      const balance = await tokenContract.balanceOf(account);
      
      if (!isValidAmount(stakeAmount, balance, minStake, maxStake, TOKEN_DECIMALS)) {
        const minDisplay = ethers.utils.formatUnits(minStake, TOKEN_DECIMALS);
        const maxDisplay = ethers.utils.formatUnits(maxStake, TOKEN_DECIMALS);
        throw new Error(`Amount must be between ${minDisplay} and ${maxDisplay} $SRA`);
      }

      setIsStaking(true);
      
      // Parse amount with proper decimals
      const amount = parseAmount(stakeAmount);
      
      // Check and approve if needed
      await checkAndApproveToken(amount);
      
      // Security: Transaction parameter validation
      const tx = await stakingContract.stake(amount);
      await validateTransaction(tx);
      
      await tx.wait();
      
      // Clear input and refresh data
      setStakeAmount("");
      
      // Refresh all data after staking
      await refreshAllData();
    } catch (error: any) {
      console.error('Staking error:', error);
      setError(formatErrorMessage(error));
    } finally {
      setIsStaking(false);
    }
  };

  const withdraw = async (): Promise<void> => {
    try {
      setError("");
      setIsWithdrawing(true);

      if (!stakingContract || !withdrawAmount) {
        throw new Error("Please enter an amount to withdraw");
      }

      // Convert the withdraw amount to the correct format with decimals
      const amount = parseAmount(withdrawAmount);
      
      // Call the withdraw function on the contract
      const tx = await stakingContract.withdraw(amount);
      await tx.wait();

      // Clear input and refresh data
      setWithdrawAmount("");
      await Promise.all([
        fetchUserRewards(),
        fetchTotalStaked()
      ]);

    } catch (error: any) {
      console.error('Withdraw error:', error);
      setError(formatErrorMessage(error));
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleClaim = async (): Promise<void> => {
    try {
      setError("");
      if (!active || !account) throw new Error('Please connect your wallet');
      if (!stakingContract) throw new Error('Contract not initialized');
      if (!library) throw new Error('Library not initialized');
      
      // Security: Network validation
      const isCorrectNetwork = await validateNetwork(library, EXPECTED_CHAIN_ID);
      if (!isCorrectNetwork) throw new Error('Please connect to BSC Mainnet');

      // Security: Rate limiting
      checkTransactionThrottle(account, 'claim');
      
      setIsClaiming(true);
      
      // Security: Transaction parameter validation
      const tx = await stakingContract.claimRewards();
      await validateTransaction(tx);
      
      await tx.wait();
      
      // Refresh all data after claiming
      await refreshAllData();
    } catch (error: any) {
      console.error('Claim error:', error);
      setError(formatErrorMessage(error));
    } finally {
      setIsClaiming(false);
    }
  };

  const handleApprove = async (): Promise<void> => {
    if (!active || !tokenContract || !account) return;
    setIsApproving(true);
    try {
      const tx = await tokenContract.approve(
        STAKING_ADDRESS,
        ethers.constants.MaxUint256
      );
      await tx.wait();
      const newAllowance = await tokenContract.allowance(account, STAKING_ADDRESS);
      setAllowance(formatAmount(newAllowance));
    } catch (error) {
      console.error("Approval failed:", error);
      setError(formatErrorMessage(error));
    }
    setIsApproving(false);
  };

  const needsApproval = parseFloat(allowance) === 0 || parseFloat(allowance) < parseFloat(stakeAmount || "0");

  // Utility function to format numbers with proper decimals
  const formatTimeLeft = (endTime: number): string => {
    if (!endTime) return "No lock";
    const now = Math.floor(Date.now() / 1000);
    const timeLeft = endTime - now;
    if (timeLeft <= 0) return "Unlocked";
    
    const days = Math.floor(timeLeft / 86400);
    const hours = Math.floor((timeLeft % 86400) / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    
    return `${days}d ${hours}h ${minutes}m`;
  };

  const calculateTimeLeft = (endTime: number): TimeLeft => {
    const now = Math.floor(Date.now() / 1000);
    const difference = endTime - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(difference / 86400),
      hours: Math.floor((difference % 86400) / 3600),
      minutes: Math.floor((difference % 3600) / 60),
      seconds: Math.floor(difference % 60)
    };
  };

  useEffect(() => {
    if (!lockEndTime) return;

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(lockEndTime));
    }, 1000);

    return () => clearInterval(timer);
  }, [lockEndTime]);

  return (
    <div className="card relative overflow-hidden bg-gray-800 rounded-xl p-6 shadow-xl">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mt-2">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-red-500 text-sm font-medium">{error}</p>
        </div>
      </div>
      )}
      <div className="grid gap-6">
        {/* Lock Period Info */}
        <div className="text-center">
          <div className="font-medium">
            <span className="text-white">contract: </span>
            <a 
              href="https://bscscan.com/address/0x037c24C4A032f2f274b87f7426c90f808A061603" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              0x037c24...A061603
            </a>
          </div>
          <div className="grid grid-cols-4 gap-2 max-w-sm mx-auto mb-4">
            <div className="bg-gray-700/50 rounded-lg p-2">
              <div className="text-2xl font-bold text-gray-300">{timeLeft.days}</div>
              <div className="text-xs text-gray-400">Days</div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-2">
              <div className="text-2xl font-bold text-gray-300">{timeLeft.hours}</div>
              <div className="text-xs text-gray-400">Hours</div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-2">
              <div className="text-2xl font-bold text-gray-300">{timeLeft.minutes}</div>
              <div className="text-xs text-gray-400">Minutes</div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-2">
              <div className="text-2xl font-bold text-gray-300">{timeLeft.seconds}</div>
              <div className="text-xs text-gray-400">Seconds</div>
            </div>
          </div>
          <p className="text-gray-400">{timeLeft.days > 0 || timeLeft.hours > 0 || timeLeft.minutes > 0 || timeLeft.seconds > 0 ? "Time remaining until unlock..." : "Unlocked!"}</p>
        </div>

        {/* Balance */}
        <div className="bg-gray-700/50 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">Your Balance</p>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-white">{formatDisplayNumber(tokenBalance)}</span>
            <span className="text-sm text-gray-400">$SRA</span>
          </div>
        </div>
        
        {/* Staking Section */}
        <div className="bg-gray-700/50 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-2">Stake $SRA</p>
          <p className="text-xs text-gray-500 mb-2">
            Min: {minStakeAmount} | Max: {maxStakeAmount} | Balance: {tokenBalance}
          </p>
          <div className="flex gap-2 mb-2">
            <input
              type="number"
              placeholder="Amount to stake"
              className="flex-1 bg-gray-800 rounded px-3 py-2 text-white"
              value={stakeAmount}
              onChange={(e) => {
                const value = e.target.value;
                setStakeAmount(value);
                setError(""); // Clear error when input changes
              }}
              min={parseFloat(minStakeAmount)}
              max={Math.min(parseFloat(maxStakeAmount), parseFloat(tokenBalance))}
              step="1"
            />
            <button
              onClick={stake}
              disabled={
                !active || 
                !stakeAmount || 
                isStaking || 
                parseFloat(stakeAmount) <= 0 ||
                parseFloat(stakeAmount) > parseFloat(tokenBalance)
              }
              className="bg-gradient-to-br from-[#7609b5] to-[#5a0789] text-white px-4 py-2 rounded disabled:opacity-50 hover:from-[#6508a4] hover:to-[#4a0670]"
            >
              {isStaking ? 'Staking...' : (stakeAmount && parseFloat(stakeAmount) > 0 ? 'Approve' : 'Stake')}
            </button>
          </div>
        </div>

        {/* Total Staked */}
        <div className="bg-gray-700/50 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">Total Staked</p>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-white">{formatDisplayNumber(stakedAmount)}</span>
          </div>
        </div>
        
        {/* Withdraw Section */}
        <div className="bg-gray-700/50 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-2">Withdraw $SRA</p>
          <div className="flex gap-2 mb-2">
            <input
              type="number"
              placeholder="Amount to withdraw"
              className="flex-1 bg-gray-800 rounded px-3 py-2 text-white"
              min="0"
              step="0.0001"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
            />
            <button
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
              disabled={!active || isWithdrawing || !withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > parseFloat(formatDisplayNumber(stakedAmount))}
              onClick={withdraw}
            >
              {isWithdrawing ? 'Withdrawing...' : 'Withdraw'}
            </button>
          </div>
        </div>
        
        {/* Rewards Section */}
        <div className="bg-gray-700/50 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">Pending Rewards</p>
          <div className="flex items-end gap-2 mb-3">
            <span className="text-2xl font-bold text-white">{formatDisplayNumber(pendingRewards)}</span>
            <span className="text-sm text-gray-400">$SRA</span>
          </div>
          <button
            className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded mt-2 disabled:opacity-50"
            onClick={handleClaim}
            disabled={!active || isClaiming || parseFloat(pendingRewards) === 0}
          >
            {isClaiming ? 'Claiming...' : 'Claim Rewards'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StakingCard;
