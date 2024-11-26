import React from 'react';
import { ChevronRight } from 'lucide-react';

interface FormData {
  email: string;
  walletAddress: string;
  businessType: string;
}

interface SignupFormProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function SignupForm({ formData, setFormData, onSubmit }: SignupFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-purple-200">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          required
          className="mt-1 block w-full px-4 py-3 bg-white/10 border border-purple-400/20 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent backdrop-blur-sm transition-all"
          placeholder="you@example.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>

      <div>
        <label htmlFor="wallet" className="block text-sm font-medium text-purple-200">
          Wallet Address (optional)
        </label>
        <input
          type="text"
          id="wallet"
          className="mt-1 block w-full px-4 py-3 bg-white/10 border border-purple-400/20 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent backdrop-blur-sm transition-all"
          placeholder="0x..."
          value={formData.walletAddress}
          onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
        />
      </div>

      <div>
        <label htmlFor="businessType" className="block text-sm font-medium text-purple-200">
          Web3 Business Type
        </label>
        <select
          id="businessType"
          className="mt-1 block w-full px-4 py-3 bg-white/10 border border-purple-400/20 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent backdrop-blur-sm transition-all"
          value={formData.businessType}
          onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
        >
          <option value="defi">DeFi</option>
          <option value="game">Game</option>
          <option value="dapp">Dapp</option>
          <option value="metaverse">Metaverse</option>
          <option value="education">Education</option>
        </select>
      </div>

      <button
        type="submit"
        className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-150 ease-in-out"
      >
        Get Early Access
        <ChevronRight className="ml-2 w-5 h-5" />
      </button>
    </form>
  );
}