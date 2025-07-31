import React from 'react';

export default function UnderConstruction() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f59e0b' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Main Content */}
      <div className="relative w-full max-w-md mx-auto">
        {/* Glassmorphism Card */}
        <div className="backdrop-blur-sm bg-white/70 rounded-3xl shadow-2xl border border-white/30 p-8 text-center">
          
          {/* Construction Icon */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              {/* Hard Hat */}
              <div className="w-16 h-16 bg-gradient-to-b from-yellow-400 to-amber-500 rounded-t-full relative shadow-lg">
                <div className="absolute inset-x-2 top-1 h-2 bg-gradient-to-r from-yellow-300 to-amber-400 rounded-full"></div>
                <div className="absolute bottom-0 inset-x-0 h-2 bg-amber-600 rounded-b-sm"></div>
              </div>
              
              {/* Tools Animation */}
              <div className="absolute -right-3 -top-2 animate-bounce">
                <div className="w-3 h-8 bg-gray-600 rounded-sm transform rotate-45 shadow-sm"></div>
                <div className="w-3 h-3 bg-gray-800 rounded-full absolute -top-1 left-0"></div>
              </div>
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 tracking-tight">
            Under Construction
          </h1>

          {/* Construction Barrier */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-4 h-6 bg-gradient-to-b from-orange-400 to-orange-600 transform rotate-12 shadow-sm"></div>
              ))}
            </div>
          </div>

          {/* Subtext */}
          <p className="text-gray-600 text-lg mb-8 leading-relaxed">
            This page is currently under construction. Stay tuned!
          </p>

          {/* Progress Indicator */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Progress</span>
              <span>45%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-400 to-amber-500 h-2 rounded-full transition-all duration-1000 ease-out animate-pulse" style={{width: '45%'}}></div>
            </div>
          </div>

          {/* Construction Elements */}
          <div className="flex justify-center space-x-4 mb-6 opacity-60">
            {/* Cone */}
            <div className="w-6 h-8 bg-gradient-to-b from-orange-400 to-orange-600 clip-triangle relative">
              <div className="absolute bottom-0 w-8 h-2 bg-gray-800 rounded-sm -left-1"></div>
            </div>
            
            {/* Warning Sign */}
            <div className="w-8 h-8 bg-yellow-400 transform rotate-45 flex items-center justify-center shadow-sm">
              <span className="text-black font-bold text-xs transform -rotate-45">!</span>
            </div>
            
            {/* Barrier */}
            <div className="flex flex-col space-y-1">
              <div className="w-8 h-1 bg-red-500"></div>
              <div className="w-8 h-1 bg-white"></div>
              <div className="w-8 h-1 bg-red-500"></div>
              <div className="w-8 h-1 bg-white"></div>
            </div>
          </div>

          {/* Coming Soon Badge */}
          <div className="inline-flex  items-center px-4 py-2 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 rounded-full text-sm font-medium border border-amber-200">
            <div className="w-2 h-2 bg-amber-500 rounded-full mr-2 animate-pulse"></div>
            Coming Soon
          </div>
          <button className=' bg-green-500 w-full flex justify-center mt-4 rounded-lg'>          <a href="/" className='text-xl font-bold block w-full '>Go Back</a>
 </button>
        </div>

        {/* Floating Construction Elements */}
        <div className="absolute -top-4 -left-4 w-8 h-8 bg-yellow-400 rounded-full animate-bounce opacity-60" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute -bottom-2 -right-6 w-6 h-6 bg-orange-400 rounded-full animate-bounce opacity-60" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 -right-8 w-4 h-4 bg-amber-400 rounded-full animate-bounce opacity-40" style={{animationDelay: '1.5s'}}></div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-gray-500 text-sm">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" style={{animationDelay: '0.3s'}}></div>
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{animationDelay: '0.6s'}}></div>
          </div>
          <span>Building something amazing...</span>
        </div>
      </div>
    </div>
  );
}