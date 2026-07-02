'use client';

import dynamic from 'next/dynamic';
import { useSimulationStore } from '@/store';
import { useEffect } from 'react';
import { initializeVisionModels } from '@/lib/vision';
import { InstructionsModal } from '@/components/InstructionsModal';
import { ColorPalette } from '@/components/ColorPalette';
import { FurnitureManager } from '@/components/FurnitureManager';

const Scene = dynamic(() => import('@/components/Scene'), { ssr: false });

export default function Home() {
  const visionReady = useSimulationStore((state) => state.visionReady);
  const setVisionReady = useSimulationStore((state) => state.setVisionReady);
  const isMirrored = useSimulationStore((state) => state.isMirrored);
  const setIsMirrored = useSimulationStore((state) => state.setIsMirrored);
  const isDrawingMode = useSimulationStore((state) => state.isDrawingMode);
  const setIsDrawingMode = useSimulationStore((state) => state.setIsDrawingMode);
  const isFrozen = useSimulationStore((state) => state.isFrozen);
  const setIsFrozen = useSimulationStore((state) => state.setIsFrozen);
  const videoElement = useSimulationStore((state) => state.videoElement);
  const handGesture = useSimulationStore((state) => state.handGesture);

  // Handle freeze toggle side-effects
  const toggleFreeze = () => {
    if (!videoElement) return;
    if (isFrozen) {
      videoElement.play();
      setIsFrozen(false);
    } else {
      videoElement.pause();
      setIsFrozen(true);
      // Ensure drawing mode is off when freezing reality
      if (isDrawingMode) setIsDrawingMode(false);
    }
  };

  useEffect(() => {
    initializeVisionModels().then(() => {
      setVisionReady(true);
    });
  }, [setVisionReady]);

  return (
    <main className="w-screen h-screen bg-black overflow-hidden relative">
      {/* HUD UI Overlay */}
      <div className="absolute top-6 left-6 z-10 flex flex-col gap-3 font-sans tracking-wide">
        <div className={`px-5 py-3 rounded-xl backdrop-blur-xl shadow-2xl transition-all duration-500 ease-in-out border ${visionReady ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 shadow-emerald-500/10' : 'bg-white/5 text-white/70 border-white/10'}`}>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${visionReady ? 'bg-emerald-400 animate-pulse' : 'bg-white/50'}`}></div>
            <span className="font-semibold text-sm tracking-widest uppercase">{visionReady ? 'Vision Systems Active' : 'Initializing Tracking...'}</span>
          </div>
        </div>
        
        {visionReady && (
          <div className="px-5 py-3 bg-black/40 text-white/90 rounded-xl backdrop-blur-xl border border-white/10 shadow-2xl font-mono text-sm flex flex-col gap-1">
            <span className="text-white/40 uppercase tracking-widest text-xs">Gesture Engine</span>
            <span className="font-bold text-emerald-400 tracking-wider">{handGesture.replace('_', ' ')}</span>
          </div>
        )}
      </div>

      {/* Top UI Bar */}
      <div className="absolute top-6 right-6 z-50 flex gap-4 font-sans tracking-wide">
        {/* Freeze Reality Toggle */}
        <button
          onClick={toggleFreeze}
          className={`px-5 py-3 backdrop-blur-xl border rounded-xl text-sm font-semibold transition-all duration-300 shadow-2xl ${
            isFrozen 
              ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-200 shadow-cyan-500/20 animate-pulse' 
              : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/30 hover:text-white'
          }`}
        >
          {isFrozen ? '❄ REALITY FROZEN' : 'FREEZE (LASSO)'}
        </button>

        {/* Clear Scene Button */}
        <button
          onClick={() => useSimulationStore.getState().clearAllObjects()}
          className="px-5 py-3 backdrop-blur-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 rounded-xl text-sm font-semibold hover:bg-rose-500/20 hover:border-rose-500/50 transition-all duration-300 shadow-2xl shadow-rose-500/10"
          title="Clear the scene"
        >
          CLEAR SCENE
        </button>

        {/* Drawing Mode Toggle */}
        <button
          onClick={() => {
            setIsDrawingMode(!isDrawingMode);
            if (!isDrawingMode && isFrozen) toggleFreeze();
          }}
          className={`px-5 py-3 backdrop-blur-xl border rounded-xl text-sm font-semibold transition-all duration-300 shadow-2xl ${
            isDrawingMode 
              ? 'bg-fuchsia-500/20 border-fuchsia-400/50 text-fuchsia-200 shadow-fuchsia-500/20' 
              : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/30 hover:text-white'
          }`}
        >
          {isDrawingMode ? 'DRAWING: ON' : 'DRAWING: OFF'}
        </button>

        {/* Mirror Toggle */}
        <button
          onClick={() => setIsMirrored(!isMirrored)}
          className={`px-5 py-3 backdrop-blur-xl border rounded-xl text-sm font-semibold transition-all duration-300 shadow-2xl ${
            isMirrored 
              ? 'bg-blue-500/20 border-blue-400/50 text-blue-200 shadow-blue-500/20' 
              : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/30 hover:text-white'
          }`}
        >
          {isMirrored ? 'MIRROR: ON' : 'MIRROR: OFF'}
        </button>
      </div>

      {/* Instructions Modal */}
      <InstructionsModal />

      {/* Color Palette (Only visible in Drawing Mode) */}
      <ColorPalette />

      {/* AI Furniture Spawner */}
      <FurnitureManager />

      {/* Main 3D Canvas Context */}
      <Scene />
    </main>
  );
}
