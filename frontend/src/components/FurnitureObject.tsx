'use client';

import { useRef, useState } from 'react';
import { RigidBody, RapierRigidBody } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import { useSimulationStore, FurnitureObjectData } from '@/store';
import { PrimitiveModels } from './models/PrimitiveModels';

interface FurnitureObjectProps {
  obj: FurnitureObjectData;
}

export function FurnitureObject({ obj }: FurnitureObjectProps) {
  const bodyRef = useRef<RapierRigidBody>(null);
  
  const handPosition = useSimulationStore((state) => state.handPosition);
  const pinchActive = useSimulationStore((state) => state.pinchActive);
  const handGesture = useSimulationStore((state) => state.handGesture);
  const updateFurnitureObject = useSimulationStore((state) => state.updateFurnitureObject);
  const removeFurnitureObject = useSimulationStore((state) => state.removeFurnitureObject);

  const [isHeld, setIsHeld] = useState(false);
  const isHeldRef = useRef(false);

  useFrame(() => {
    if (!bodyRef.current || !handPosition) return;

    const currentPos = bodyRef.current.translation();
    const distance2D = Math.hypot(
      currentPos.x - handPosition[0],
      currentPos.y - handPosition[1]
    );
    const zDistance = Math.abs(currentPos.z - handPosition[2]);

    // Grab logic
    if (pinchActive && !isHeldRef.current && distance2D < 2.5 && zDistance < 8.0) { // forgiving Z grab
      setIsHeld(true);
      isHeldRef.current = true;
    } else if (!pinchActive && isHeldRef.current) {
      setIsHeld(false);
      isHeldRef.current = false;
    }

    // Lock gesture logic
    if (isHeldRef.current && handGesture === 'Closed_Fist' && !obj.isLocked) {
      updateFurnitureObject(obj.id, { isLocked: true });
      setIsHeld(false);
      isHeldRef.current = false;
    }

    // Delete gesture logic
    if (isHeldRef.current && handGesture === 'Thumb_Down') {
      removeFurnitureObject(obj.id);
      setIsHeld(false);
      isHeldRef.current = false;
    }

    if (isHeldRef.current) {
      // Kinematic movement while held
      bodyRef.current.setTranslation(
        { x: handPosition[0], y: handPosition[1], z: handPosition[2] },
        true
      );
      bodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      bodyRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
    }
  });



  return (
    <RigidBody
      ref={bodyRef}
      position={obj.position}
      type={obj.isLocked ? 'fixed' : (isHeld ? 'kinematicPosition' : 'dynamic')}
      colliders="cuboid"
      restitution={0.2}
      friction={0.8}
      mass={5}
    >
      <group scale={isHeld ? 1.05 : 1}>
        <PrimitiveModels type={obj.type} />
        
        {/* Highlight when held */}
        {isHeld && (
          <mesh>
            <boxGeometry args={[0.1, 0.1, 0.1]} /> {/* Invisible box just to attach glowing wireframe around the group bounds */}
            <meshBasicMaterial color="#00ffff" wireframe />
          </mesh>
        )}
      </group>
    </RigidBody>
  );
}
