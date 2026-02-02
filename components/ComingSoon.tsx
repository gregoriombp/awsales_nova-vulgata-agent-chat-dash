"use client";

export default function ComingSoon() {
  return (
    <div className="flex items-center justify-center min-h-[600px]">
      <div className="text-center">
        {/* Animated geometric shapes */}
        <div className="relative w-48 h-48 mx-auto mb-8">
          {/* Outer rotating square */}
          <div className="absolute inset-0 border-4 border-gray-300 rounded-lg animate-spin-slow" 
               style={{ animationDuration: '8s' }}
          />
          
          {/* Middle rotating square */}
          <div className="absolute inset-4 border-4 border-gray-400 rounded-lg animate-spin-slow" 
               style={{ animationDuration: '6s', animationDirection: 'reverse' }}
          />
          
          {/* Inner rotating square */}
          <div className="absolute inset-8 border-4 border-gray-500 rounded-lg animate-spin-slow" 
               style={{ animationDuration: '4s' }}
          />
          
          {/* Center circle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-gray-400 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Text */}
        <h2 className="text-4xl font-heading font-bold text-gray-700 mb-3">
          Em breve
        </h2>
        <p className="text-gray-500 text-lg">
          Esta funcionalidade está em desenvolvimento
        </p>
      </div>
    </div>
  );
}
