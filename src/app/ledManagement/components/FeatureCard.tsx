import React from 'react';
import { LucideIcon } from 'lucide-react';

interface Feature {
  icon: LucideIcon;
  text: string;
}

interface FeatureCardProps {
  features: Feature[];
}

export function FeatureCard({ features }: FeatureCardProps) {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-transparent rounded-3xl filter blur-xl" />
      <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-purple-400/20">
        <h3 className="text-xl font-semibold mb-6">Why Join Our Beta?</h3>
        
        <div className="space-y-6">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <feature.icon className="w-6 h-6 text-purple-400" />
              </div>
              <p className="text-purple-200">{feature.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-purple-400/20">
          <div className="flex items-center space-x-2">
            <img
              src="https://images.unsplash.com/photo-1557853197-aefb550b6fdc?ixlib=rb-4.0.3&auto=format&fit=crop&w=48&h=48&q=80"
              alt="User"
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="text-sm font-medium">"Revolutionize your user interaction before everyone"</p>
              <p className="text-xs text-purple-300">Developer @Sorayia.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}