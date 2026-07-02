import { create } from 'zustand';
import type { Detection } from '@mediapipe/tasks-vision';

type Vector3 = [number, number, number];

export interface ExtractedObjectData {
  id: string;
  texture: HTMLCanvasElement; // the extracted mask texture
  width: number;
  height: number;
  position: Vector3;
  rotation: Vector3;
  velocity: Vector3;
  isLocked?: boolean;
}

export interface DrawnObjectData {
  id: string;
  points: Vector3[];
  color: string;
  position: Vector3;
  isLocked: boolean;
}

export interface FurnitureObjectData {
  id: string;
  type: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  color?: string;
  isLocked: boolean;
}

export interface AIDetection {
  id: string;
  label: string;
  confidence: number;
  polygon: [number, number][]; // normalized [x, y] coordinates
}

interface SimulationState {
  visionReady: boolean;
  setVisionReady: (ready: boolean) => void;
  
  isMirrored: boolean;
  setIsMirrored: (mirrored: boolean) => void;

  isDrawingMode: boolean;
  setIsDrawingMode: (mode: boolean) => void;

  isFrozen: boolean;
  setIsFrozen: (frozen: boolean) => void;
  
  drawColor: string;
  setDrawColor: (color: string) => void;
  
  handPosition: Vector3 | null;
  setHandPosition: (pos: Vector3 | null) => void;
  
  handGesture: string;
  setHandGesture: (gesture: string) => void;
  
  pinchActive: boolean;
  setPinchActive: (active: boolean) => void;

  detections: Detection[];
  setDetections: (detections: Detection[]) => void;

  videoElement: HTMLVideoElement | null;
  setVideoElement: (el: HTMLVideoElement | null) => void;

  extractedObjects: ExtractedObjectData[];
  addExtractedObject: (obj: ExtractedObjectData) => void;
  updateExtractedObject: (id: string, updates: Partial<ExtractedObjectData>) => void;
  removeExtractedObject: (id: string) => void;

  drawnObjects: DrawnObjectData[];
  addDrawnObject: (obj: DrawnObjectData) => void;
  updateDrawnObject: (id: string, updates: Partial<DrawnObjectData>) => void;
  removeDrawnObject: (id: string) => void;

  furnitureObjects: FurnitureObjectData[];
  addFurnitureObject: (obj: FurnitureObjectData) => void;
  updateFurnitureObject: (id: string, updates: Partial<FurnitureObjectData>) => void;
  removeFurnitureObject: (id: string) => void;

  aiDetections: AIDetection[];
  setAIDetections: (detections: AIDetection[]) => void;
  removeAIDetection: (id: string) => void;

  clearAllObjects: () => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
  visionReady: false,
  setVisionReady: (visionReady) => set({ visionReady }),
  
  isMirrored: false,
  setIsMirrored: (isMirrored) => set({ isMirrored }),

  isDrawingMode: false,
  setIsDrawingMode: (isDrawingMode) => set({ isDrawingMode }),

  isFrozen: false,
  setIsFrozen: (isFrozen) => set({ isFrozen }),

  drawColor: '#ff00ff', // Neon Pink default
  setDrawColor: (drawColor) => set({ drawColor }),
  
  handPosition: null,
  setHandPosition: (handPosition) => set({ handPosition }),
  
  handGesture: 'None',
  setHandGesture: (handGesture) => set({ handGesture }),
  
  pinchActive: false,
  setPinchActive: (pinchActive) => set({ pinchActive }),

  detections: [],
  setDetections: (detections) => set({ detections }),

  videoElement: null,
  setVideoElement: (videoElement) => set({ videoElement }),
  
  extractedObjects: [],
  addExtractedObject: (obj) => set((state) => ({
    extractedObjects: [...state.extractedObjects, obj]
  })),
  updateExtractedObject: (id, updates) => set((state) => ({
    extractedObjects: state.extractedObjects.map(o => o.id === id ? { ...o, ...updates } : o)
  })),
  removeExtractedObject: (id) => set((state) => ({
    extractedObjects: state.extractedObjects.filter(o => o.id !== id)
  })),

  drawnObjects: [],
  addDrawnObject: (obj) => set((state) => ({
    drawnObjects: [...state.drawnObjects, obj]
  })),
  updateDrawnObject: (id, updates) => set((state) => ({
    drawnObjects: state.drawnObjects.map(o => o.id === id ? { ...o, ...updates } : o)
  })),
  removeDrawnObject: (id) => set((state) => ({
    drawnObjects: state.drawnObjects.filter(o => o.id !== id)
  })),

  furnitureObjects: [],
  addFurnitureObject: (obj) => set((state) => ({
    furnitureObjects: [...state.furnitureObjects, obj]
  })),
  updateFurnitureObject: (id, updates) => set((state) => ({
    furnitureObjects: state.furnitureObjects.map(o => o.id === id ? { ...o, ...updates } : o)
  })),
  removeFurnitureObject: (id) => set((state) => ({
    furnitureObjects: state.furnitureObjects.filter(o => o.id !== id)
  })),

  aiDetections: [],
  setAIDetections: (detections) => set({ aiDetections: detections }),
  removeAIDetection: (id) => set((state) => ({ 
    aiDetections: state.aiDetections.filter(d => d.id !== id) 
  })),

  clearAllObjects: () => set({ 
    extractedObjects: [], 
    drawnObjects: [], 
    furnitureObjects: [],
    aiDetections: []
  }),
}));
