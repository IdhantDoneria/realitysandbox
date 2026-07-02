import logging
from typing import List, Dict, Any
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from contextlib import asynccontextmanager

from .database import get_db, engine, Base
from . import models
from .ml_models import model_manager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize database tables
models.Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load ML models on startup
    logger.info("Starting up and loading ML models...")
    model_manager.load_models()
    yield
    # Clean up on shutdown
    logger.info("Shutting down...")

app = FastAPI(title="Reality Sandbox API", lifespan=lifespan)

import os

allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:4000").split(",")

# Add CORS middleware to allow frontend on different port
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket connected. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket disconnected. Total connections: {len(self.active_connections)}")

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@app.get("/")
async def read_root() -> Dict[str, str]:
    return {"message": "Welcome to the Reality Sandbox API"}

@app.get("/objects/", response_model=List[Dict[str, Any]])
def read_objects(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    objects = db.query(models.ObjectMemory).offset(skip).limit(limit).all()
    # Simple dictionary conversion for the stub
    return [
        {
            "id": obj.id,
            "category": obj.category,
            "position": {"x": obj.last_position_x, "y": obj.last_position_y, "z": obj.last_position_z},
            "updated_at": obj.updated_at
        }
        for obj in objects
    ]

@app.websocket("/ws/tracking")
async def tracking_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time tracking updates.
    The frontend can connect here to send frames or receive object updates.
    """
    import base64
    import json
    await manager.connect(websocket)
    try:
        while True:
            # Expecting raw base64 string or JSON with 'image' key
            data = await websocket.receive_text()
            
            try:
                # Handle both raw base64 and JSON wrapped base64
                if data.startswith('{'):
                    parsed = json.loads(data)
                    b64_str = parsed.get("image", "")
                else:
                    b64_str = data
                
                # Remove data URI prefix if present
                if ',' in b64_str:
                    b64_str = b64_str.split(',')[1]
                    
                image_bytes = base64.b64decode(b64_str)
                
                # Run inference
                results = model_manager.detect_and_segment(image_bytes)
                
                # Send back JSON
                await websocket.send_text(json.dumps(results))
                
            except Exception as process_err:
                logger.error(f"Error processing frame: {process_err}")
                await websocket.send_text(json.dumps({"status": "error", "message": str(process_err), "detections": []}))
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)
