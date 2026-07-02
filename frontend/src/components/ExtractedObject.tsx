'use client';

import { useFrame } from '@react-three/fiber';
import { useSimulationStore, ExtractedObjectData } from '@/store';
import { RigidBody, RapierRigidBody } from '@react-three/rapier';
import { useRef, useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';

export function ExtractedObject({ obj }: { obj: ExtractedObjectData }) {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const handPosition = useSimulationStore((state) => state.handPosition);
  const pinchActive = useSimulationStore((state) => state.pinchActive);
  const handGesture = useSimulationStore((state) => state.handGesture);
  const updateExtractedObject = useSimulationStore((state) => state.updateExtractedObject);
  const removeExtractedObject = useSimulationStore((state) => state.removeExtractedObject);
  
  const [isHeld, setIsHeld] = useState(false);
  const isHeldRef = useRef(false);

  const texture = useMemo(() => {
    const tex = new THREE.CanvasTexture(obj.texture);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [obj.texture]);

  // Dropping logic is now handled in useFrame with handGesture

  useFrame(() => {
    if (!rigidBodyRef.current || !handPosition) return;

    const currentPos = rigidBodyRef.current.translation();
    const distance2D = Math.hypot(
      currentPos.x - handPosition[0],
      currentPos.y - handPosition[1]
    );
    const zDistance = Math.abs(currentPos.z - handPosition[2]);

    // Grab logic
    if (handGesture === 'Closed_Fist' && !isHeldRef.current && distance2D < 2.5 && zDistance < 8.0) { // forgiving Z grab
      setIsHeld(true);
      isHeldRef.current = true;
    } else if (handGesture !== 'Closed_Fist' && isHeldRef.current) {
      setIsHeld(false);
      isHeldRef.current = false;
      if (rigidBodyRef.current) {
        rigidBodyRef.current.setBodyType(0, true);
        rigidBodyRef.current.wakeUp();
      }
    }

    // Lock gesture logic
    if (isHeldRef.current && handGesture === 'Pointing_Up' && !obj.isLocked) {
      updateExtractedObject(obj.id, { isLocked: true });
      setIsHeld(false);
      isHeldRef.current = false;
    }

    // Delete gesture logic
    if (isHeldRef.current && handGesture === 'Thumb_Down') {
      removeExtractedObject(obj.id);
      setIsHeld(false);
      isHeldRef.current = false;
    }

    if (isHeldRef.current && rigidBodyRef.current) {
      rigidBodyRef.current.setTranslation({ x: handPosition[0], y: handPosition[1], z: handPosition[2] }, true);
      rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      rigidBodyRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
    }
  });

  return (
    <RigidBody 
      ref={rigidBodyRef} 
      type="kinematicPosition"
      colliders="cuboid"
      restitution={0.5}
      position={obj.position}
    >
      <mesh castShadow receiveShadow scale={isHeld ? 1.05 : 1}>
        <planeGeometry args={[obj.width / 100, obj.height / 100]} />
        <meshStandardMaterial 
          map={texture} 
          transparent 
          alphaTest={0.5} 
          side={THREE.DoubleSide} 
          roughness={0.5} 
          metalness={0.1}
        />
      </mesh>
    </RigidBody>
  );
}
