'use client';

import { Grid } from '@react-three/drei';

export function CoordinateGrid() {
  return (
    <Grid
      position={[0, -4.49, 0]}
      cellSize={1}
      cellThickness={1}
      cellColor="#00ff00"
      sectionSize={5}
      sectionThickness={1.5}
      sectionColor="#00ff00"
      fadeDistance={15}
      fadeStrength={1}
      followCamera={false}
      infiniteGrid={true}
    />
  );
}
