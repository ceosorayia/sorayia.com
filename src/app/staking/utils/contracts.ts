import { ethers } from 'ethers';
import { STAKING_CONFIG } from '../config/staking';

export async function verifyContract(address: string): Promise<boolean> {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const code = await provider.getCode(address);
    return code !== '0x';
  } catch {
    return false;
  }
}

export async function getStakingContract(signer: ethers.Signer) {
  const isValid = await verifyContract(STAKING_CONFIG.address);
  if (!isValid) {
    throw new Error('Invalid staking contract address');
  }
  
  return new ethers.Contract(
    STAKING_CONFIG.address,
    STAKING_CONFIG.abi,
    signer
  );
}