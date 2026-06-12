import React from 'react';

export default function MasonrySkeleton() {
  // Common aspect ratios in Pinterest-like grids (in pixels just for mimicking height)
  const heights = [320, 240, 480, 280, 360, 400, 260, 340, 420, 300, 380, 200];
  
  return (
    <div className="columns-1 sm:columns-2 md:columns-3 xl:columns-4 gap-6">
      {heights.map((height, i) => (
        <div 
          key={i} 
          className="break-inside-avoid mb-6 flex flex-col group animate-pulse"
        >
          {/* Image skeleton */}
          <div 
            className="rounded-[20px] bg-gray-150/50 border border-gray-150 shadow-sm shadow-red-500/5 w-full"
            style={{ height: `${height}px` }}
          />
          
          {/* Metadata skeleton */}
          <div className="flex items-center justify-between mt-3 px-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-150/50" />
              <div className="w-24 h-3 rounded-full bg-gray-150/50" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-3 rounded-full bg-gray-150/50" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
