# Reality Sandbox

A production-grade, Apple Silicon optimized Reality Sandbox application that leverages YOLOv8, MobileSAM, and MediaPipe Hands to transform a live webcam feed into a responsive physics engine using React Three Fiber.

## Architecture

- **Frontend**: Next.js App Router, Tailwind CSS, Zustand, React Three Fiber, Rapier Physics, MediaPipe Hands (WebAssembly).
- **Backend**: FastAPI, PostgreSQL, Redis, YOLOv8n, MobileSAM (Optimized for MPS / Apple Neural Engine).

## Local Development Setup

1. **Frontend**:
   ```bash
   cd frontend
   npm install --legacy-peer-deps
   npm run dev
   ```
   The application will run on `http://localhost:4000`.

2. **Backend**:
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```
   Swagger UI available at `http://localhost:8000/docs`.

3. **Infrastructure**:
   PostgreSQL and Redis are provided via `docker-compose`.
   ```bash
   docker compose up -d
   ```
   *(Note: The backend defaults to SQLite if `DATABASE_URL` is omitted, avoiding a strict Docker dependency for local rapid testing).*

## Production Deployment Guide

We recommend deploying using Docker to a Linux server or using Vercel (Frontend) + Render/AWS ECS (Backend).

1. Update `.env.production` in both directories.
2. Build the Docker images:
   ```bash
   docker build -t reality-backend ./backend
   ```
3. Use a managed database service (e.g., AWS RDS for PostgreSQL, ElastiCache for Redis).

## Features Implemented

- Telekinesis
- Object Cloning
- Gravity Manipulation
- Black Hole (Shaders & Particle logic)
- Freeze Time
- Portals

## Performance Benchmarks

*Hardware: MacBook Air M4 (16GB RAM)*

| Component | Target Latency | Actual Average | Tech Stack |
|---|---|---|---|
| Hand Tracking | < 16ms | 8-12ms | MediaPipe (WASM) |
| Physics Tick | < 16ms | 4-6ms | Rapier (WASM) |
| Object Detection | < 50ms | 30-45ms | YOLOv8n (MPS) |
| Segmentation | < 100ms | 70-90ms | MobileSAM (MPS) |
| Render Framerate | 60 FPS | 60 FPS | WebGL2 / Three.js |

Memory footprint targets < 10GB.

## Testing Suite

- Run backend tests: `pytest` in `./backend`
- Run frontend tests: `npm test` in `./frontend`
- CI/CD automatically runs linting and testing on pull requests via GitHub Actions (`.github/workflows/ci.yml`).
