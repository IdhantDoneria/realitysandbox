'use client';

import { useFrame } from '@react-three/fiber';
import { useSimulationStore } from '@/store';
import { getGestureRecognizer, getObjectDetector } from '@/lib/vision';
import { useRef } from 'react';

export function TelekinesisManager() {
  const videoElement = useSimulationStore((state) => state.videoElement);
  const setHandPosition = useSimulationStore((state) => state.setHandPosition);
  const setHandGesture = useSimulationStore((state) => state.setHandGesture);
  const pinchActive = useSimulationStore((state) => state.pinchActive);
  const setPinchActive = useSimulationStore((state) => state.setPinchActive);

  const setDetections = useSimulationStore((state) => state.setDetections);
  const isMirrored = useSimulationStore((state) => state.isMirrored);
  const lastVideoTime = useRef(-1);
  const smoothedPos = useRef<[number, number, number] | null>(null);

  useFrame(() => {
    if (!videoElement || videoElement.videoWidth === 0) return;

    const recognizer = getGestureRecognizer();
    const objectDetector = getObjectDetector();
    if (!recognizer || !objectDetector) return;

    // Run gesture recognition if there's a new video frame
    const currentTime = videoElement.currentTime;
    if (currentTime !== lastVideoTime.current) {
      lastVideoTime.current = currentTime;
      
      // 1. Run Object Detector
      const detResults = objectDetector.detectForVideo(videoElement, performance.now());
      if (detResults.detections) {
        setDetections(detResults.detections);
      }

      // 2. Run Gesture Recognizer
      const results = recognizer.recognizeForVideo(videoElement, performance.now());
      
      if (results.landmarks && results.landmarks.length > 0) {
        const hand = results.landmarks[0]; // Primary hand
        const indexTip = hand[8];
        const thumbTip = hand[4];
        
        // Map 0-1 coordinates to world coordinates (rough estimation)
        const rawX = isMirrored ? 1 - indexTip.x : indexTip.x;
        const targetX = (rawX - 0.5) * 10;
        const targetY = -(indexTip.y - 0.5) * 10;
        const targetZ = -indexTip.z * 10; // Depth heuristic

        if (!smoothedPos.current) {
          smoothedPos.current = [targetX, targetY, targetZ];
        } else {
          const lerpFactor = 0.3; // Lower = smoother but more lag
          smoothedPos.current[0] += (targetX - smoothedPos.current[0]) * lerpFactor;
          smoothedPos.current[1] += (targetY - smoothedPos.current[1]) * lerpFactor;
          smoothedPos.current[2] += (targetZ - smoothedPos.current[2]) * lerpFactor;
        }
        
        setHandPosition([...smoothedPos.current]);

        if (results.gestures && results.gestures.length > 0) {
          const gestureName = results.gestures[0][0].categoryName;
          setHandGesture(gestureName);

          const distance = Math.hypot(indexTip.x - thumbTip.x, indexTip.y - thumbTip.y);
          const isPinching = distance < 0.05; // Threshold for pinch

          if (isPinching && !pinchActive) {
            setPinchActive(true);
            // Extraction is now fully handled by AISegmentationOverlay.tsx
          } else if (!isPinching && pinchActive) {
            setPinchActive(false);
          }
        }
      } else {
        setHandPosition(null);
        setHandGesture('None');
        smoothedPos.current = null;
      }
    }
  });

  return null;
}
