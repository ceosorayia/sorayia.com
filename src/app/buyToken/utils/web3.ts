import { ethers } from 'ethers';
import { Web3Error } from '../types/ethereum';

export async function handleWeb3Error(error: unknown): Promise<string> {
  const web3Error = error as Web3Error;
  
  if (web3Error.code === 4001) {
    return 'Transaction refusée par l\'utilisateur';
  }
  
  if (web3Error.code === -32002) {
    return 'Une requête de connexion est déjà en cours';
  }
  
  if (web3Error.message?.includes('insufficient funds')) {
    return 'Fonds insuffisants pour effectuer la transaction';
  }
  
  console.error('Web3 Error:', error);
  return 'Une erreur est survenue lors de la transaction';
}