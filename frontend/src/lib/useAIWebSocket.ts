import { useEffect, useState } from 'react';
import { useSimulationStore } from '@/store';

export function useAIWebSocket(videoElement: HTMLVideoElement | null) {
  const setAIDetections = useSimulationStore((state) => state.setAIDetections);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    // In a real app, you would use an environment variable for the backend URL
    const socket = new WebSocket('ws://localhost:8000/ws/tracking');
    
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.detections) {
          setAIDetections(data.detections);
        }
      } catch (e) {
        console.error('Error parsing WebSocket message:', e);
      }
    };

    socket.onopen = () => {
      console.log('Connected to AI Tracking WebSocket');
    };

    socket.onerror = (e) => {
      console.error('WebSocket error:', e);
    };
    
    setWs(socket);
    
    return () => {
      socket.close();
    };
  }, [setAIDetections]);

  useEffect(() => {
    if (!ws || ws.readyState !== WebSocket.OPEN || !videoElement) return;
    
    const canvas = document.createElement('canvas');
    // Downscale for lower latency and less bandwidth
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext('2d');
    
    const interval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN && videoElement.readyState >= 2) {
        ctx?.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        // Compress as highly-optimized JPEG (0.5 quality is fine for ML)
        const b64 = canvas.toDataURL('image/jpeg', 0.5);
        ws.send(JSON.stringify({ image: b64 }));
      }
    }, 200); // 5 FPS
    
    return () => clearInterval(interval);
  }, [ws, videoElement]);
}
