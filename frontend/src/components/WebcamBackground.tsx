'use client';

import { useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';

import { useSimulationStore } from '@/store';
import { useAIWebSocket } from '@/lib/useAIWebSocket';

export function WebcamBackground() {
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  useAIWebSocket(videoElement);

  const isMirrored = useSimulationStore((state) => state.isMirrored);

  useEffect(() => {
    const video = document.createElement('video');
    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn('Webcam not supported or no permissions');
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user' } })
      .then((stream) => {
        video.srcObject = stream;
        video.play();
        setVideoElement(video);
      })
      .catch((error) => {
        console.warn('Warning accessing webcam:', error);
      });

    return () => {
      if (video.srcObject) {
        const stream = video.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const texture = useMemo(() => {
    if (!videoElement) return null;
    
    const newTexture = new THREE.VideoTexture(videoElement);
    newTexture.colorSpace = THREE.SRGBColorSpace;
    
    if (isMirrored) {
      newTexture.center.set(0.5, 0.5);
      newTexture.repeat.x = -1;
    }
    
    return newTexture;
  }, [videoElement, isMirrored]);

  if (!texture) return null;

  return <primitive attach="background" object={texture} />;
}
