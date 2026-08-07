CropGuard AI - Local Setup Guide (Windows)
==========================================

REQUIREMENTS:
  - Node.js 18+ (download from https://nodejs.org - choose LTS)
  - Windows 10 or later

QUICK START:
  1. Extract this zip to a folder (e.g. C:\CropGuard-AI\)
  2. Double-click "start.bat"
  3. The app opens automatically at http://localhost:5173

MANUAL START (if start.bat doesn't work):
  1. Open Command Prompt or PowerShell in this folder
  2. Run: npm install
  3. Run: npm run dev
  4. Open http://localhost:5173 in your browser

LANGUAGES:
  - English, Amharic (አማርኛ), Tigrinya (ትግርኛ)
  - Switch language using the globe icon in the top navigation bar

NOTE: This is the frontend only. The AI disease detection feature
requires the Python ML backend, which is not included in this package.
The Disease Guide, comparison table, and multilingual UI all work
fully without the backend.
