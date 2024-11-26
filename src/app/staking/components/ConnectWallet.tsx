import React from 'react';
import { Wallet } from 'lucide-react';

interface ConnectWalletProps {
  onConnect: () => Promise<void>;
  loading: boolean;
}

export function ConnectWallet({ onConnect, loading }: ConnectWalletProps) {
  return (
    <button
      onClick={onConnect}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition duration-200 disabled:opacity-50"
    >
      <Wallet className="w-6 h-6" />
      {loading ? 'Connexion...' : 'Connecter le Portefeuille'}
    </button>
  );
}