# CropGuard AI — Plant/Crop Disease Detection System
**Mekelle Institute of Technology · 2026**

An AI-powered system that detects plant and crop diseases from leaf images and provides treatment recommendations. Built for smallholder farmers in Tigray, Ethiopia.

---

## System overview

```
Farmer uploads leaf image
  → React frontend      (port 3000)
  → Node.js backend     (port 3001)   ← saves image, logs to PostgreSQL
  → Python FastAPI      (port 8000)   ← runs CNN inference (MobileNetV2)
  ← disease + recommendation returned
  ← displayed to farmer
```

## Project structure

```
plant-disease-system/
├── ml/           Python AI model (TensorFlow + FastAPI)
├── backend/      Node.js + Express REST API
├── frontend/     React + Vite web application
└── README.md
```

## Quick start

### 1. Train the AI model
```bash
cd ml
pip install -r requirements.txt
python preprocessing.py   # split dataset
python model.py           # train (30–60 min with GPU)
python evaluate.py        # generate metrics + confusion matrix
```

### 2. Start Python AI server
```bash
cd ml
uvicorn serve:app --host 0.0.0.0 --port 8000
```

### 3. Start Node.js backend
```bash
cd backend
cp .env.example .env      # fill in DB credentials
npm install
npm run dev
```

### 4. Start React frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
# Open http://localhost:3000
```

## Tech stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| AI model | TensorFlow, MobileNetV2, FastAPI    |
| Backend  | Node.js, Express, PostgreSQL        |
| Frontend | React 18, Vite                      |
| Deploy   | Hugging Face Spaces / Railway / Vercel |

## Supported crops (Tigray)
Wheat, Teff, Maize, Sorghum — healthy and diseased leaf detection.

## Target accuracy
Above 85% on the test set (typically 90–95% with MobileNetV2 + PlantVillage).

## Team
Mekelle Institute of Technology — Final Year Project, 2026
Submitted to: Ins Gorge
