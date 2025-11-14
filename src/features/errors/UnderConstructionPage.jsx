import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function UnderConstruction() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Minimalist Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-gray-900 flex items-center justify-center">
              <div className="w-8 h-8 border-t-4 border-l-4 border-gray-900 transform rotate-45"></div>
            </div>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-light text-gray-900 text-center mb-4 tracking-tight">
          Under Construction
        </h1>

        {/* Divider */}
        <div className="w-16 h-px bg-gray-900 mx-auto mb-6"></div>

        {/* Description */}
        <p className="text-gray-600 text-center text-base mb-12 font-light leading-relaxed">
          We're working on something special.<br />This page will be ready soon.
        </p>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex justify-between text-xs text-gray-500 mb-3 font-light">
            <span>Progress</span>
            <span>45%</span>
          </div>
          <div className="w-full h-px bg-gray-200 relative overflow-hidden">
            <div 
              className="absolute left-0 top-0 h-full bg-gray-900 transition-all duration-700"
              style={{ width: '45%' }}
            ></div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center px-6 py-2 border border-gray-900 text-gray-900 text-sm font-light tracking-wide">
            <div className="w-1.5 h-1.5 bg-gray-900 rounded-full mr-3"></div>
            COMING SOON
          </div>
        </div>

        {/* Back Button */}
        <div className="flex justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-3 bg-gray-900 text-white text-sm font-light tracking-wide hover:bg-gray-800 transition-colors duration-200"
          >
            GO BACK
          </button>
        </div>
      </div>

      {/* Minimal Footer */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center space-x-2 text-gray-400 text-xs font-light">
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <span>Building</span>
        </div>
      </div>
    </div>
  );
}
