'use client';

import { useState } from 'react';
import { useSimulationStore } from '@/store';

const COLORS = [
  '#ff00ff', // Neon Pink
  '#00ffff', // Cyan
  '#00ff00', // Neon Green
  '#ffff00', // Yellow
  '#ff0000', // Red
  '#0000ff', // Blue
  '#ffffff', // White
  '#000000', // Black
];

export function ColorPalette() {
  const [isExpanded, setIsExpanded] = useState(false);
  const drawColor = useSimulationStore((state) => state.drawColor);
  const setDrawColor = useSimulationStore((state) => state.setDrawColor);

  return (
    <div className="absolute top-1/2 right-4 -translate-y-1/2 z-20 flex flex-col items-center gap-2">
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-12 h-12 rounded-full backdrop-blur-md border-2 transition-all shadow-lg flex items-center justify-center text-white"
        style={{ 
          backgroundColor: `${drawColor}40`, // 40 is hex for 25% opacity
          borderColor: drawColor 
        }}
        aria-label="Toggle Color Palette"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      </button>

      {/* Palette */}
      <div 
        className={`flex flex-col gap-3 transition-all duration-300 overflow-hidden ${
          isExpanded ? 'max-h-96 opacity-100 py-3' : 'max-h-0 opacity-0 py-0'
        }`}
      >
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-full flex flex-col gap-2">
          {COLORS.map((color) => (
            <button
              key={color}
              onClick={() => {
                setDrawColor(color);
                setIsExpanded(false);
              }}
              className={`w-8 h-8 rounded-full transition-transform ${
                drawColor === color ? 'scale-125 ring-2 ring-white' : 'hover:scale-110'
              }`}
              style={{ backgroundColor: color }}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
