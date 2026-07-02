import {
  FilesetResolver,
  GestureRecognizer,
  ObjectDetector
} from '@mediapipe/tasks-vision';

let gestureRecognizer: GestureRecognizer | null = null;
let objectDetector: ObjectDetector | null = null;

export async function initializeVisionModels() {
  if (gestureRecognizer && objectDetector) return;

  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );

  console.log("Loading MediaPipe Models...");

  if (!gestureRecognizer) {
    gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: '/models/gesture_recognizer.task',
        delegate: 'GPU'
      },
      runningMode: 'VIDEO',
      numHands: 2
    });
  }

  if (!objectDetector) {
    objectDetector = await ObjectDetector.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: '/models/efficientdet_lite0.tflite',
        delegate: 'GPU'
      },
      runningMode: 'VIDEO',
      scoreThreshold: 0.5
    });
  }



  console.log("All Vision Models Loaded!");
}

export function getGestureRecognizer() {
  return gestureRecognizer;
}

export function getObjectDetector() {
  return objectDetector;
}


