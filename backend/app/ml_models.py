import torch
import logging
import cv2
import numpy as np
from typing import Any, Dict, List
import base64

logger = logging.getLogger(__name__)

def get_device() -> torch.device:
    """Get the optimal PyTorch device for Apple Silicon."""
    if torch.backends.mps.is_available():
        return torch.device("mps")
    return torch.device("cpu")

class MLModelManager:
    """Manages ML models (YOLO segmentation) for the sandbox."""
    
    def __init__(self):
        self.device = get_device()
        self.yolo_model: Any = None
        logger.info(f"MLModelManager initialized with device: {self.device}")

    def load_models(self) -> None:
        """Load YOLO11 segmentation model."""
        logger.info("Loading YOLO11x-seg model...")
        try:
            from ultralytics import YOLO
            self.yolo_model = YOLO("yolo11x-seg.pt")
            self.yolo_model.to(self.device)
            logger.info("YOLO11x-seg loaded successfully.")
        except Exception as e:
            logger.error(f"Failed to load YOLO model: {e}")

    def detect_and_segment(self, image_bytes: bytes) -> Dict[str, Any]:
        """Process image, run YOLO tracking and segmentation, return contours."""
        if not self.yolo_model:
            return {"status": "error", "message": "Model not loaded", "detections": []}
            
        try:
            # Decode image
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if img is None:
                return {"status": "error", "message": "Failed to decode image", "detections": []}

            # Run YOLO inference with tracking
            # persist=True allows maintaining IDs across frames
            results = self.yolo_model.track(img, persist=True, verbose=False)
            
            detections = []
            if len(results) > 0 and results[0].boxes is not None and results[0].masks is not None:
                boxes = results[0].boxes
                masks = results[0].masks
                
                # Iterate through each detected object
                for i in range(len(boxes)):
                    box = boxes[i]
                    # Get tracker ID if available, else generate a random one for this frame
                    track_id = int(box.id[0].item()) if box.id is not None else np.random.randint(1000)
                    class_id = int(box.cls[0].item())
                    conf = float(box.conf[0].item())
                    label = self.yolo_model.names[class_id].upper()
                    
                    # Alphanumeric ID format: LABEL-ID
                    alpha_id = f"{label}-{track_id}"
                    
                    # Extract polygon from mask
                    # Ultralytics masks.xyn gives normalized polygon coordinates [[x,y], [x,y]...]
                    polygon = masks.xyn[i].tolist() if len(masks.xyn) > i else []
                    
                    if len(polygon) > 0:
                        detections.append({
                            "id": alpha_id,
                            "label": label,
                            "confidence": conf,
                            "polygon": polygon # Normalized coords 0.0-1.0
                        })
            
            return {"status": "success", "detections": detections}
            
        except Exception as e:
            logger.error(f"Inference error: {e}")
            return {"status": "error", "message": str(e), "detections": []}

model_manager = MLModelManager()
