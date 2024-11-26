import React, { useState } from 'react';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';
import './index.css';

interface FormData {
  name: string;
  email: string;
  message: string;
}

interface FormState {
  status: 'idle' | 'submitting' | 'success' | 'error';
  error?: string;
}

export default function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: '',
  });
  const [formState, setFormState] = useState<FormState>({ status: 'idle' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState({ status: 'submitting' });

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In a real application, you would send the email using a backend service
      console.log('Sending email to contact@sorayia.com', formData);
      setFormState({ status: 'success' });
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      setFormState({ 
        status: 'error', 
        error: 'Failed to send message. Please try again.' 
      });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Get in Touch
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label 
              htmlFor="name" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="Your name"
            />
          </div>

          <div>
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label 
              htmlFor="message" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
              placeholder="Your message..."
            />
          </div>

          <button
            type="submit"
            disabled={formState.status === 'submitting'}
            className={`w-full py-3 px-4 flex items-center justify-center gap-2 rounded-lg text-white font-medium transition-colors ${
              formState.status === 'submitting'
                ? 'bg-indigo-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {formState.status === 'submitting' ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Send Message
              </>
            )}
          </button>

          {formState.status === 'success' && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
              <CheckCircle className="w-5 h-5" />
              <span>Message sent successfully!</span>
            </div>
          )}

          {formState.status === 'error' && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="w-5 h-5" />
              <span>{formState.error}</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}