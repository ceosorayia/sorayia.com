import React, { useState } from 'react';
import { Box, ShieldCheck, Zap } from 'lucide-react';
import { SignupForm } from './components/SignupForm';
import { FeatureCard } from './components/FeatureCard';
import { SuccessMessage } from './components/SuccessMessage';

function App() {
  const [formData, setFormData] = useState({
    email: '',
    walletAddress: '',
    businessType: 'defi',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Send form data to specified email
      await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_key: 'YOUR_WEB3FORMS_KEY', // Replace with your Web3Forms key
          from_name: 'Web3 Beta Signup',
          to: 'contact@sorayia.com',
          subject: 'New Web3 Beta Signup',
          message: `
            New signup for Web3 Beta:
            Email: ${formData.email}
            Wallet Address: ${formData.walletAddress || 'Not provided'}
            Business Type: ${formData.businessType}
          `,
        }),
      });
      
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error submitting the form. Please try again.');
    }
  };

  const features = [
    { icon: ShieldCheck, text: "Enterprise-grade security" },
    { icon: Box, text: "Zero-knowledge proofs" },
    { icon: Zap, text: "A solution tailored to your business" },
  ];

  if (isSubmitted) {
    return <SuccessMessage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="flex items-center space-x-2">
              <Box className="w-8 h-8 text-purple-400" />
              <span className="text-sm font-medium bg-purple-400/10 px-3 py-1 rounded-full">
                Beta Access
              </span>
            </div>
            
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
              Join the Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Web3</span> Development
            </h1>
            
            <p className="text-lg text-purple-200">
              Be among the first to experience our revolutionary Web3 development platform. Limited spots available.
            </p>

            <SignupForm 
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleSubmit}
            />
          </div>

          <div className="lg:pl-12">
            <FeatureCard features={features} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;