import React from 'react';
import { Landmark } from 'lucide-react';

export default function Logo({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Outer Diamond Shape */}
      <div className="absolute inset-0 border border-gold-500/40 rotate-45 scale-110 pointer-events-none" />
      
      {/* Small dots on diamond corners */}
      <div className="absolute -top-[10%] left-1/2 -translate-x-1/2 w-1 h-1 bg-gold-500/60 rounded-full" />
      <div className="absolute -bottom-[10%] left-1/2 -translate-x-1/2 w-1 h-1 bg-gold-500/60 rounded-full" />
      <div className="absolute top-1/2 -left-[10%] -translate-y-1/2 w-1 h-1 bg-gold-500/60 rounded-full" />
      <div className="absolute top-1/2 -right-[10%] -translate-y-1/2 w-1 h-1 bg-gold-500/60 rounded-full" />

      {/* Main Circular Emblem Container */}
      <div className="relative w-full h-full rounded-full border-2 border-gold-500 overflow-hidden bg-masonic-blue shadow-[0_0_30px_rgba(230,176,0,0.2)] flex items-center justify-center p-2">
        {/* We attempt to load the official logo from public/logo-arca.png */}
        <img 
          src="/logo-arca.png" 
          alt="Logo Arca 34" 
          className="relative z-10 w-full h-full object-contain"
          onError={(e) => {
            // If logo-arca.png is not found, hide the img tag to show the SVG below
            e.currentTarget.style.display = 'none';
          }}
        />

        {/* Fallback SVG Emblem (Visible only if the image above fails to load) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-4/5 h-4/5 text-gold-500 drop-shadow-[0_0_10px_rgba(230,176,0,0.5)]">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 2" className="opacity-30" />
            <path 
              d="M20 70 L80 70 L80 50 L70 50 L70 40 L30 40 L30 50 L20 50 Z" 
              fill="currentColor" 
              className="opacity-90"
            />
            <path 
              d="M35 40 Q50 20 65 40" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            />
            <circle cx="50" cy="55" r="5" fill="none" stroke="currentColor" strokeWidth="1" />
            <text x="50" y="85" textAnchor="middle" fontSize="6" className="font-serif font-bold fill-gold-300">ARCA 34</text>
          </svg>
        </div>
        
        {/* Divine Ray Effect */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-masonic-dark/40" />
      </div>
    </div>
  );
}
