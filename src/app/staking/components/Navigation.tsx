import React from 'react';
import { Wallet, CoinsIcon, LayersIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { handleWeb3Error } from '../utils/web3';

interface NavigationProps {
  connected: boolean;
  setConnected: (connected: boolean) => void;
  currentView: 'buy' | 'stake';
  onViewChange: (view: 'buy' | 'stake') => void;
}

export function Navigation({ connected, setConnected, currentView, onViewChange }: NavigationProps) {
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        toast.error('Please install MetaMask!');
        return;
      }

      await window.ethereum.request({ method: 'eth_requestAccounts' });
      setConnected(true);
      toast.success('Wallet connected!');
    } catch (error) {
      const errorMessage = await handleWeb3Error(error);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/10">
      <div className="flex items-center gap-4">
        <button
          onClick={() => onViewChange('buy')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
            currentView === 'buy'
              ? 'bg-purple-500 text-white'
              : 'text-purple-200 hover:bg-white/5'
          }`}
        >
          <CoinsIcon className="w-5 h-5" />
          Buy
        </button>
        <button
          onClick={() => onViewChange('stake')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
            currentView === 'stake'
              ? 'bg-purple-500 text-white'
              : 'text-purple-200 hover:bg-white/5'
          }`}
        >
          <LayersIcon className="w-5 h-5" />
          Stake
        </button>
      </div>

      {!connected && (
        <button
          onClick={connectWallet}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl transition duration-200"
        >
          <Wallet className="w-5 h-5" />
          Connect Wallet
        </button>
      )}
    </div>
  );
}