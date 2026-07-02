'use client';

import { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useSimulationStore } from '@/store';
import type { Detection } from '@mediapipe/tasks-vision';

export function BackgroundRenderer() {
  const setVideoElement = useSimulationStore((state) => state.setVideoElement);
  const isMirrored = useSimulationStore((state) => state.isMirrored);
  const extractedObjects = useSimulationStore((state) => state.extractedObjects);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const bgBufferRef = useRef<HTMLCanvasElement | null>(null);
  const bgCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const processedCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const processedCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const frameCountRef = useRef(0);
  
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const setAIDetections = useSimulationStore((state) => state.setAIDetections);

  useEffect(() => {
    // Connect to WebSocket (with resilience)
    let ws: WebSocket | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout>;

    const connectWS = () => {
      try {
        ws = new WebSocket('ws://localhost:8000/ws/tracking');
        wsRef.current = ws;

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.status === 'success' && data.detections) {
              setAIDetections(data.detections);
            }
          } catch (e) {
            // Silently ignore parse errors
          }
        };

        ws.onerror = () => {
          // Silently handle — backend may not be running
        };

        ws.onclose = () => {
          wsRef.current = null;
          // Attempt reconnect after 3 seconds
          reconnectTimeout = setTimeout(connectWS, 3000);
        };
      } catch {
        // Backend not available — retry later
        reconnectTimeout = setTimeout(connectWS, 3000);
      }
    };

    connectWS();

    const video = document.createElement('video');
    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;
    videoRef.current = video;

    const bgBuffer = document.createElement('canvas');
    bgBufferRef.current = bgBuffer;
    bgCtxRef.current = bgBuffer.getContext('2d', { willReadFrequently: true });

    const processedCanvas = document.createElement('canvas');
    processedCanvasRef.current = processedCanvas;
    processedCtxRef.current = processedCanvas.getContext('2d', { willReadFrequently: true });

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } })
        .then((stream) => {
          video.srcObject = stream;
          video.play();
          video.onloadedmetadata = () => {
            bgBuffer.width = video.videoWidth;
            bgBuffer.height = video.videoHeight;
            processedCanvas.width = video.videoWidth;
            processedCanvas.height = video.videoHeight;
            
            const tex = new THREE.CanvasTexture(processedCanvas);
            tex.colorSpace = THREE.SRGBColorSpace;
            textureRef.current = tex;
            setTexture(tex);
            
            setVideoElement(video);
          };
        })
        .catch(console.error);
    }

    return () => {
      // Clean up camera
      if (video.srcObject) {
        const stream = video.srcObject as MediaStream;
        stream.getTracks().forEach(t => t.stop());
      }
      // Clean up WebSocket
      clearTimeout(reconnectTimeout);
      if (ws) {
        ws.onclose = null; // Prevent reconnect on intentional close
        ws.close();
      }
      wsRef.current = null;
    };
  }, [setVideoElement, setAIDetections]);

  useFrame(() => {
    const video = videoRef.current;
    const bgCtx = bgCtxRef.current;
    const pCtx = processedCtxRef.current;
    const bgBuffer = bgBufferRef.current;
    const pCanvas = processedCanvasRef.current;

    const texRef = textureRef.current;

    if (!video || !bgCtx || !pCtx || !texRef || !bgBuffer || !pCanvas || video.videoWidth === 0) return;

    // 1. Accumulate background (temporal blending to blur out moving objects)
    bgCtx.globalAlpha = 0.05; // extremely slow learning rate for static background
    bgCtx.drawImage(video, 0, 0, bgBuffer.width, bgBuffer.height);
    bgCtx.globalAlpha = 1.0;

    // 2. Draw current video frame to processed canvas
    pCtx.globalCompositeOperation = 'source-over';
    pCtx.globalAlpha = 1.0;
    pCtx.drawImage(video, 0, 0, pCanvas.width, pCanvas.height);

    // 3. Inpaint missing objects
    // DISABLING THIS FIXES THE VISUAL SMEARING AND SHABBY LOOK.
    // Instead of erasing objects, we let the real-world video persist in the background
    // extractedObjects.forEach(obj => {
    //   pCtx.globalCompositeOperation = 'destination-out';
    //   pCtx.drawImage(obj.texture, 0, 0, pCanvas.width, pCanvas.height); 
    //   
    //   pCtx.globalCompositeOperation = 'destination-over';
    //   pCtx.drawImage(bgBuffer, 0, 0, pCanvas.width, pCanvas.height);
    // });
    // pCtx.globalCompositeOperation = 'source-over'; // Reset

    // 4. Draw Detections
    const detections = useSimulationStore.getState().detections;
    if (detections && detections.length > 0) {
      pCtx.lineWidth = 4;
      pCtx.strokeStyle = '#00ff00';
      pCtx.fillStyle = '#00ff00';
      pCtx.font = '16px Arial';
      
      detections.forEach((det: Detection) => {
        if (!det.boundingBox) return;
        const { originX, originY, width, height } = det.boundingBox;
        pCtx.strokeRect(originX, originY, width, height);
        
        if (det.categories && det.categories.length > 0) {
          const categoryName = det.categories[0].categoryName;
          const score = Math.round(parseFloat(String(det.categories[0].score)) * 100);
          const text = `${categoryName} - ${score}%`;
          pCtx.fillText(text, originX, originY - 10);
        }
      });
    }

    if (textureRef.current) {
      textureRef.current.needsUpdate = true;
    }

    // Send frame to backend at ~10 FPS
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && bgCtx) {
      frameCountRef.current += 1;
      if (frameCountRef.current % 6 === 0) { // Assuming 60FPS target, 60/6 = 10 FPS
        const base64Img = pCanvas.toDataURL('image/jpeg', 0.5);
        wsRef.current.send(JSON.stringify({ image: base64Img }));
      }
    }
    
    // Calculate aspect ratio for object-fit: cover
    const imageAspect = video.videoWidth / video.videoHeight;
    const screenAspect = window.innerWidth / window.innerHeight;

    let repeatX = 1;
    let repeatY = 1;
    let offsetX = 0;
    let offsetY = 0;

    if (screenAspect > imageAspect) {
      repeatY = imageAspect / screenAspect;
      offsetY = (1 - repeatY) / 2;
    } else {
      repeatX = screenAspect / imageAspect;
      offsetX = (1 - repeatX) / 2;
    }
    
    if (isMirrored) {
      texRef.repeat.set(-repeatX, repeatY);
      texRef.offset.set(offsetX + repeatX, offsetY);
    } else {
      texRef.repeat.set(repeatX, repeatY);
      texRef.offset.set(offsetX, offsetY);
    }
  });

  if (!texture) return null;

  return <primitive attach="background" object={texture} />;
}
