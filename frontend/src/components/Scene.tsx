'use client';

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics, RigidBody } from '@react-three/rapier';
import { BackgroundRenderer } from './BackgroundRenderer';
import { TelekinesisManager } from './TelekinesisManager';
import { DrawingManager } from './DrawingManager';
import { LassoManager } from './LassoManager';
import { AISegmentationOverlay } from './AISegmentationOverlay';
import { CoordinateGrid } from './CoordinateGrid';
import { ExtractedObject } from './ExtractedObject';
import { DrawnObject } from './DrawnObject';
import { FurnitureObject } from './FurnitureObject';
import { EmojiOutburst } from './EmojiOutburst';
import { PersonOcclusionMask } from './PersonOcclusionMask';
import { useSimulationStore } from '@/store';

export default function Scene() {
  const extractedObjects = useSimulationStore((state) => state.extractedObjects);
  const drawnObjects = useSimulationStore((state) => state.drawnObjects);
  const furnitureObjects = useSimulationStore((state) => state.furnitureObjects);

  return (
    <div className="absolute inset-0 w-full h-full bg-black">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ preserveDrawingBuffer: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} castShadow />

        <React.Suspense fallback={null}>
          <Physics gravity={[0, -9.81, 0]}>
            <BackgroundRenderer />
            <TelekinesisManager />
            <DrawingManager />
            <LassoManager />
            <AISegmentationOverlay />
            <CoordinateGrid />
            <EmojiOutburst />
            <PersonOcclusionMask />

            {/* Render real-world extracted objects */}
            {extractedObjects.map((obj) => (
              <ExtractedObject key={obj.id} obj={obj} />
            ))}

            {/* Render drawn 3D objects */}
            {drawnObjects.map((obj) => (
              <DrawnObject key={obj.id} obj={obj} />
            ))}

            {/* Render spawned AI furniture */}
            {furnitureObjects.map((obj) => (
              <FurnitureObject key={obj.id} obj={obj} />
            ))}
            
            {/* Invisible Floor for physics objects to land on (bottom of screen) */}
            <RigidBody type="fixed" position={[0, -4.5, 0]} friction={1}>
              <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial transparent opacity={0} />
              </mesh>
            </RigidBody>
          </Physics>
        </React.Suspense>
      </Canvas>
    </div>
  );
}
