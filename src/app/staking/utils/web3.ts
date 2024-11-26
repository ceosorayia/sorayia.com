import { ethers } from 'ethers';
import { Web3Error } from '../types/ethereum';

export async function handleWeb3Error(error: unknown): Promise<string> {
  const web3Error = error as Web3Error;
  
  // Handle numeric error codes
  if (typeof web3Error.code === 'number') {
    if (web3Error.code === 4001) {
      return 'Transaction rejected by user';
    }
    
    if (web3Error.code === -32002) {
      return 'A connection request is already pending';
    }
  }
  
  // Handle string error codes
  if (typeof web3Error.code === 'string' && web3Error.code === 'CALL_EXCEPTION') {
    return 'Unable to interact with the staking contract. Please verify the contract address and network.';
  }
  
  if (web3Error.message?.includes('insufficient funds')) {
    return 'Insufficient funds for transaction';
  }
  
  console.error('Web3 Error:', error);
  return 'An error occurred during the transaction';
}
