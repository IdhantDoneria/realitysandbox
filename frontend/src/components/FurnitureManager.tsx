'use client';

import { useState } from 'react';
import { useSimulationStore } from '@/store';

export function FurnitureManager() {
  const [prompt, setPrompt] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const addFurnitureObject = useSimulationStore((state) => state.addFurnitureObject);

  const handPosition = useSimulationStore((state) => state.handPosition);

  const handleSpawn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const id = `furn_${Date.now()}`;
    const type = prompt.toLowerCase();
    
    // Spawn item exactly above the user's hand if visible, otherwise default to top center
    const spawnPos = handPosition ? [handPosition[0], handPosition[1] + 1, handPosition[2]] : [0, 2, 0];

    addFurnitureObject({
      id,
      type,
      position: spawnPos as [number, number, number],
      isLocked: false,
    });
    
    setPrompt('');
    setIsOpen(false);
  };

  return (
    <div className="absolute top-1/2 left-4 -translate-y-1/2 z-20 flex flex-col items-center gap-2">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 transition-all shadow-lg flex items-center justify-center text-white"
        title="AI Furniture Spawner"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </button>

      {/* Menu */}
      <div 
        className={`transition-all duration-300 overflow-hidden ${
          isOpen ? 'max-w-md opacity-100' : 'max-w-0 opacity-0'
        }`}
      >
        <div className="bg-gray-900/90 backdrop-blur-md border border-white/20 p-4 rounded-xl flex flex-col gap-4 w-64 shadow-2xl">
          <h3 className="text-white font-bold text-lg">AI Furniture</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Type what you want to spawn (e.g. &quot;chair&quot;, &quot;laptop&quot;, &quot;bottle&quot;, &quot;keys&quot;, &quot;phone&quot;). Over 90+ everyday items supported! They will fall into the room, where you can grab and move them.
          </p>
          <form onSubmit={handleSpawn} className="flex flex-col gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g. chair"
              className="px-3 py-2 bg-black/50 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-purple-500"
              autoFocus={isOpen}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded font-medium transition-colors text-sm"
            >
              Spawn Object
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
