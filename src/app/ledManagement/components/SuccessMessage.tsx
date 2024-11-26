import React from 'react';
import { Sparkle } from 'lucide-react';

export function SuccessMessage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-4 animate-fade-in">
        <Sparkle className="w-16 h-16 mx-auto text-purple-400" />
        <h2 className="text-2xl font-bold">You're on the list! 🚀</h2>
        <p className="text-purple-200">
          We'll contact you soon with exclusive beta access. Meanwhile, prepare for a revolutionary Web3 experience.
        </p>
      </div>
    </div>
  );
}