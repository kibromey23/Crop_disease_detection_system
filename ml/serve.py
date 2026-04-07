"""
AI-Based Plant/Crop Disease Detection System
Stage 5: FastAPI model serving endpoint
Mekelle Institute of Technology — 2026

Run: uvicorn serve:app --reload --host 0.0.0.0 --port 8000
"""

import io, json
import numpy as np
import tensorflow as tf
from pathlib import Path
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image

# ── Load model ────────────────────────────────────────────────
MODEL_PATH       = "saved_model/plant_disease_model"
# class_index is hardcoded here so serve.py works regardless of working directory
# or which class_index.json file the OS happens to find first.
# These are the exact 38 PlantVillage classes the model was trained on.
CLASS_INDEX_PATH = "class_index.json"   # kept for reference / health endpoint

model  = tf.saved_model.load(MODEL_PATH)
infer  = model.signatures["serving_default"]

# Compute output key ONCE at startup — never recompute inside request handler
# This prevents dict ordering issues on repeated calls
_output_keys = list(infer.structured_outputs.keys())
OUTPUT_KEY   = _output_keys[0]
print(f"[serve] Model output key: '{OUTPUT_KEY}'  (all: {_output_keys})")

# ── Hardcoded 38-class index (PlantVillage) ───────────────────
# This guarantees the correct mapping regardless of what class_index.json
# file uvicorn finds in the current working directory.
class_index: dict = {
    "0":  "Apple___Apple_scab",
    "1":  "Apple___Black_rot",
    "2":  "Apple___Cedar_apple_rust",
    "3":  "Apple___healthy",
    "4":  "Blueberry___healthy",
    "5":  "Cherry_(including_sour)___Powdery_mildew",
    "6":  "Cherry_(including_sour)___healthy",
    "7":  "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
    "8":  "Corn_(maize)___Common_rust_",
    "9":  "Corn_(maize)___Northern_Leaf_Blight",
    "10": "Corn_(maize)___healthy",
    "11": "Grape___Black_rot",
    "12": "Grape___Esca_(Black_Measles)",
    "13": "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
    "14": "Grape___healthy",
    "15": "Orange___Haunglongbing_(Citrus_greening)",
    "16": "Peach___Bacterial_spot",
    "17": "Peach___healthy",
    "18": "Pepper,_bell___Bacterial_spot",
    "19": "Pepper,_bell___healthy",
    "20": "Potato___Early_blight",
    "21": "Potato___Late_blight",
    "22": "Potato___healthy",
    "23": "Raspberry___healthy",
    "24": "Soybean___healthy",
    "25": "Squash___Powdery_mildew",
    "26": "Strawberry___Leaf_scorch",
    "27": "Strawberry___healthy",
    "28": "Tomato___Bacterial_spot",
    "29": "Tomato___Early_blight",
    "30": "Tomato___Late_blight",
    "31": "Tomato___Leaf_Mold",
    "32": "Tomato___Septoria_leaf_spot",
    "33": "Tomato___Spider_mites Two-spotted_spider_mite",
    "34": "Tomato___Target_Spot",
    "35": "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    "36": "Tomato___Tomato_mosaic_virus",
    "37": "Tomato___healthy",
}
NUM_CLASSES = 38
print(f"[serve] Using hardcoded class index — {NUM_CLASSES} PlantVillage classes")

# ── Treatment recommendations for all 38 PlantVillage classes ─
RECOMMENDATIONS = {
    # Apple
    "Apple___Apple_scab":
        "Apply fungicide (Captan or Mancozeb) at green tip stage. Remove and destroy fallen infected leaves. Prune for good air circulation.",
    "Apple___Black_rot":
        "Prune out infected cankers and mummified fruit. Apply Captan or Thiophanate-methyl fungicide. Remove all infected material from the orchard.",
    "Apple___Cedar_apple_rust":
        "Apply myclobutanil or propiconazole fungicide starting at pink bud stage. Remove nearby cedar/juniper trees if possible to break the disease cycle.",
    "Apple___healthy":
        "No disease detected. Maintain regular pruning, balanced fertilisation, and monitor for early signs of pests or disease.",

    # Blueberry
    "Blueberry___healthy":
        "No disease detected. Maintain proper soil pH (4.5–5.5), adequate irrigation, and annual pruning to keep the plant productive.",

    # Cherry
    "Cherry_(including_sour)___Powdery_mildew":
        "Apply sulphur-based or potassium bicarbonate fungicide. Improve air circulation by pruning. Avoid excessive nitrogen fertilisation.",
    "Cherry_(including_sour)___healthy":
        "No disease detected. Continue regular monitoring and maintain orchard hygiene to prevent fungal diseases.",

    # Corn / Maize
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot":
        "Apply strobilurin or triazole fungicide (Azoxystrobin or Propiconazole) at early signs. Use resistant hybrids in future seasons. Rotate crops.",
    "Corn_(maize)___Common_rust_":
        "Apply fungicide (Mancozeb or Chlorothalonil) if infection is severe. Plant resistant hybrids. Monitor fields during cool wet periods.",
    "Corn_(maize)___Northern_Leaf_Blight":
        "Apply Mancozeb or Azoxystrobin fungicide. Practice crop rotation with non-host crops. Bury or remove infected crop residue after harvest.",
    "Corn_(maize)___healthy":
        "No disease detected. Continue monitoring and maintain good agronomic practices.",

    # Grape
    "Grape___Black_rot":
        "Apply Mancozeb or Myclobutanil fungicide from bud break through harvest. Remove mummified berries and infected canes. Ensure good canopy management.",
    "Grape___Esca_(Black_Measles)":
        "No effective cure exists. Remove and destroy severely infected vines. Protect pruning wounds with fungicide paste. Avoid wounding vines unnecessarily.",
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)":
        "Apply copper-based fungicide or Mancozeb. Improve air circulation through canopy management. Remove infected leaves promptly.",
    "Grape___healthy":
        "No disease detected. Maintain canopy management, balanced nutrition, and monitor regularly during the growing season.",

    # Orange
    "Orange___Haunglongbing_(Citrus_greening)":
        "No cure exists for Huanglongbing. Remove and destroy infected trees immediately to prevent spread. Control the Asian citrus psyllid vector with insecticides. Plant certified disease-free trees.",

    # Peach
    "Peach___Bacterial_spot":
        "Apply copper-based bactericide in autumn and early spring. Choose resistant varieties for future planting. Avoid overhead irrigation. Remove infected twigs.",
    "Peach___healthy":
        "No disease detected. Continue regular monitoring, proper pruning, and balanced fertilisation.",

    # Bell Pepper
    "Pepper,_bell___Bacterial_spot":
        "Apply copper-based bactericide. Remove and destroy infected plant material. Avoid overhead irrigation. Use disease-free transplants in future seasons.",
    "Pepper,_bell___healthy":
        "No disease detected. Maintain proper spacing for air circulation and monitor regularly.",

    # Potato
    "Potato___Early_blight":
        "Apply Chlorothalonil or Mancozeb fungicide. Remove infected lower leaves. Ensure adequate potassium nutrition. Practice crop rotation.",
    "Potato___Late_blight":
        "Apply Mancozeb or Cymoxanil immediately — late blight spreads very rapidly. Remove and destroy all infected plant material. Avoid overhead irrigation.",
    "Potato___healthy":
        "No disease detected. Scout fields regularly, especially during cool wet weather when late blight risk is highest.",

    # Raspberry
    "Raspberry___healthy":
        "No disease detected. Maintain proper cane management, adequate spacing, and remove old canes after fruiting.",

    # Soybean
    "Soybean___healthy":
        "No disease detected. Monitor for soybean rust and other common pathogens during the growing season.",

    # Squash
    "Squash___Powdery_mildew":
        "Apply potassium bicarbonate, neem oil, or sulphur fungicide at first sign. Improve air circulation. Avoid wetting foliage during irrigation.",

    # Strawberry
    "Strawberry___Leaf_scorch":
        "Apply Captan or Myclobutanil fungicide. Remove infected leaves. Ensure good drainage and air circulation. Avoid overhead irrigation.",
    "Strawberry___healthy":
        "No disease detected. Maintain proper bed renovation after harvest and monitor for common strawberry diseases.",

    # Tomato
    "Tomato___Bacterial_spot":
        "Apply copper-based bactericide. Remove infected leaves and stems. Avoid overhead irrigation. Use certified disease-free transplants.",
    "Tomato___Early_blight":
        "Apply Chlorothalonil or Mancozeb fungicide. Remove lower infected leaves. Stake plants for better air circulation. Practice crop rotation.",
    "Tomato___Late_blight":
        "Apply Mancozeb or Cymoxanil immediately — this disease spreads extremely fast. Remove infected plant parts. Avoid wetting foliage.",
    "Tomato___Leaf_Mold":
        "Improve ventilation in the growing area. Apply Chlorothalonil or copper fungicide. Avoid wetting leaves. Use resistant varieties.",
    "Tomato___Septoria_leaf_spot":
        "Apply Chlorothalonil or Mancozeb. Remove infected lower leaves. Mulch around base to prevent soil splash. Practice crop rotation.",
    "Tomato___Spider_mites Two-spotted_spider_mite":
        "Apply miticide (Abamectin or Bifenazate). Use neem oil as an organic option. Increase humidity. Introduce predatory mites for biological control.",
    "Tomato___Target_Spot":
        "Apply Chlorothalonil or Azoxystrobin fungicide. Remove heavily infected leaves. Improve air circulation through proper staking and pruning.",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus":
        "No cure for TYLCV. Remove and destroy infected plants immediately. Control the whitefly vector with insecticides or sticky traps. Use virus-resistant varieties.",
    "Tomato___Tomato_mosaic_virus":
        "No cure for ToMV. Remove infected plants. Disinfect tools with bleach solution. Wash hands before handling plants. Use resistant varieties.",
    "Tomato___healthy":
        "No disease detected. Continue regular scouting and maintain good cultural practices.",
}

IMG_SIZE = (224, 224)

# ── FastAPI app ───────────────────────────────────────────────
app = FastAPI(
    title="AI Plant Disease Detector",
    description="Upload a leaf image to detect crop diseases (PlantVillage — 14 crops, 38 classes)",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://127.0.0.1:3001"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

class PredictionResponse(BaseModel):
    disease:        str
    confidence_pct: float
    recommendation: str
    top3:           list[dict]

def preprocess(image_bytes: bytes) -> tf.Tensor:
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize(IMG_SIZE)
    arr = np.array(img, dtype=np.float32) / 255.0
    return tf.constant(np.expand_dims(arr, axis=0))

@app.post("/predict", response_model=PredictionResponse)
async def predict(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image.")

    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Maximum 10 MB.")
    tensor   = preprocess(contents)

    # Use OUTPUT_KEY computed at startup — never re-derive inside the handler
    raw   = infer(tensor)
    probs = raw[OUTPUT_KEY].numpy()[0]          # shape: (38,)

    # Verify output size matches — warn but continue if mismatch
    if len(probs) != NUM_CLASSES:
        print(f"[serve] WARNING: model output={len(probs)}, class_index={NUM_CLASSES} — results may be wrong")

    top_idx    = int(np.argmax(probs))
    top_label  = class_index.get(str(top_idx), f"Unknown_class_{top_idx}")
    confidence = float(probs[top_idx]) * 100

    # Top-3 predictions — safe lookup with fallback
    top3_idx = np.argsort(probs)[::-1][:3]
    top3 = [
        {
            "disease":        class_index.get(str(int(i)), f"Class_{int(i)}"),
            "confidence_pct": round(float(probs[int(i)]) * 100, 2),
        }
        for i in top3_idx
    ]

    recommendation = RECOMMENDATIONS.get(
        top_label,
        "Consult your local agricultural extension officer for guidance."
    )

    return PredictionResponse(
        disease=top_label,
        confidence_pct=round(confidence, 2),
        recommendation=recommendation,
        top3=top3,
    )

@app.get("/health")
def health():
    return {"status": "ok", "classes": NUM_CLASSES, "output_key": OUTPUT_KEY}

@app.get("/classes")
def get_classes():
    return {k: v for k, v in class_index.items() if k != "_note"}
