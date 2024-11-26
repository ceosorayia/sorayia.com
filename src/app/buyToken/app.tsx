import React, { useState, useMemo } from 'react';
import { ethers } from 'ethers';
import toast, { Toaster } from 'react-hot-toast';
import { Sparkles } from 'lucide-react';
import { ConnectWallet } from './components/ConnectWallet';
import { TokenPurchaseForm } from './components/TokenPurchaseForm';
import { TOKEN_CONFIG } from './config/token';
import { handleWeb3Error } from './utils/web3';
import { calculateBNBPrice } from './utils/price';

function App() {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);

  const price = useMemo(() => calculateBNBPrice(amount), [amount]);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        toast.error('Veuillez installer MetaMask!');
        return;
      }

      setLoading(true);
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      setConnected(true);
      toast.success('Portefeuille connecté!');
    } catch (error) {
      const errorMessage = await handleWeb3Error(error);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const buyTokens = async () => {
    if (!amount || !window.ethereum) return;

    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        TOKEN_CONFIG.address,
        TOKEN_CONFIG.abi,
        signer
      );

      const tx = await contract.transfer(
        signer.address, 
        ethers.parseEther(amount),
        {
          value: ethers.parseEther(price.bnbEquivalent)
        }
      );
      await tx.wait();

      toast.success(`Achat de ${amount} ${TOKEN_CONFIG.name} réussi!`);
      setAmount('');
    } catch (error) {
      const errorMessage = await handleWeb3Error(error);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white">
      <Toaster position="top-right" />
      
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          {/* <div className="flex items-center justify-center gap-3 mb-6">
            <Sparkles className="w-12 h-12 text-yellow-400" />
            <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-purple-400 to-blue-400">
              {TOKEN_CONFIG.name}
            </h1>
          </div> */}
          <p className="text-xl text-blue-200">Buy your tokens with ease</p>
          {/* <p className="text-xl text-blue-200">Achetez vos tokens en toute simplicité</p> */}
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/10">
          {!connected ? (
            <ConnectWallet onConnect={connectWallet} loading={loading} />
          ) : (
            <TokenPurchaseForm
              amount={amount}
              price={price}
              onAmountChange={setAmount}
              onPurchase={buyTokens}
              loading={loading}
              tokenName={TOKEN_CONFIG.name}
            />
          )}
        </div>

        <div className="mt-8 text-center space-y-2">
          <div className="inline-block px-4 py-2 bg-white/5 rounded-lg backdrop-blur-sm">
            <p className="text-sm text-blue-200">
            Contract Address: <span className="font-mono text-white">{TOKEN_CONFIG.address}</span>
              {/* Adresse du contrat: <span className="font-mono text-white">{TOKEN_CONFIG.address}</span> */}
            </p>
            <p className="mt-2 text-sm font-medium text-yellow-400">
              1 {TOKEN_CONFIG.name} = {TOKEN_CONFIG.priceInBNB} BNB
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;