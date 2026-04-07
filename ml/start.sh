#!/bin/bash
# Start the FastAPI ML server bound to localhost ONLY
# This prevents direct access to the ML server bypassing Node.js auth/quota
echo "Starting CropGuard AI ML server on 127.0.0.1:8000"
echo "Only the Node.js backend (port 3001) can reach this service."
uvicorn serve:app --host 127.0.0.1 --port 8000
