# ML Training Guide — What Needs Real Models

This document maps every simulated ML component in Annadata OS to the real model, dataset, and training approach that would replace it. Use this as a checklist when moving from demo to production.

---

## Already Trained (Ready to Use)

These models exist as `.pkl` files in `src/models/saved_models/` and were trained by the core pipeline. They are **not yet wired into the Docker microservices** — they're used by `src/api/app.py` (the standalone API).

| Model | File | Type | Trained On |
|-------|------|------|------------|
| Weather — Linear Regression | `weather_models/linear_regression_weather.pkl` | sklearn LinearRegression | 5,840 weather records |
| Weather — Random Forest | `weather_models/random_forest_weather.pkl` | sklearn RandomForestRegressor | 5,840 weather records |
| Weather — SVR | `weather_models/svr_weather.pkl` | sklearn SVR | 5,840 weather records |
| Crop Yield — Linear Regression | `crop_models/linear_regression_crop.pkl` | sklearn LinearRegression | 19,690 crop records |
| Crop Yield — Random Forest | `crop_models/random_forest_crop.pkl` | sklearn RandomForestRegressor | 19,690 crop records |
| Crop Yield — SVR | `crop_models/svr_crop.pkl` | sklearn SVR | 19,690 crop records |
| Feature Scaler | `scalers/feature_scaler.pkl` | sklearn StandardScaler | Weather features |
| Crop Feature Scaler | `scalers/crop_feature_scaler.pkl` | sklearn StandardScaler | Crop features |
| Quantum VQR | `quantum_vqr.pkl` | Qiskit VQR (4 qubits, COBYLA) | 5,000 sample subset |

**To wire these into services**: Each service's `app.py` would need to `joblib.load()` the relevant `.pkl` at startup and call `.predict()` instead of using the simulated formulas. The services already have `numpy` available.

### MSP Mitra Price Prediction (Already Real)

MSP Mitra is the **only service with live ML**. It uses `msp_mitra/backend/price_predictor_enhanced.py` which trains Facebook Prophet + ensemble models on-demand from 1.1M AgMarkNet records. No action needed here.

---

## Models That Need Training

### 1. SoilScan AI — Soil Health Prediction

**Currently**: Hand-tuned polynomial/bell-curve scoring formulas in `services/soilscan_ai/app.py` lines 160-350.

**What to train**:

| Model | Purpose | Architecture | Dataset |
|-------|---------|-------------|---------|
| Soil Health Classifier | Predict fertility class from NPK/pH/OC/moisture | Random Forest or XGBoost | [Kaggle Soil Properties](https://www.kaggle.com/datasets/cdminix/us-soil-properties) or Indian NBSS&LUP data |
| Soil Type Classifier | Classify soil type from sensor readings | Gradient Boosted Trees | ICAR soil survey data |
| Photo-based Soil Analyzer | Predict pH/nutrients from soil photograph | CNN (MobileNetV2 or EfficientNet) | [SoilNet dataset](https://zenodo.org/records/7599043) or custom collected |

**Training steps**:
```bash
# Example: train soil health model
cd src/models/
python -c "
from sklearn.ensemble import RandomForestClassifier
import joblib, pandas as pd

df = pd.read_csv('data/soil_dataset.csv')  # You need this dataset
X = df[['nitrogen_ppm', 'phosphorus_ppm', 'potassium_ppm', 'ph_level', 'organic_carbon_pct', 'moisture_pct']]
y = df['fertility_class']  # poor/moderate/good/excellent

model = RandomForestClassifier(n_estimators=200, random_state=42)
model.fit(X, y)
joblib.dump(model, 'saved_models/soil_health_rf.pkl')
"
```

**Priority**: HIGH — this is a core service.

---

### 2. Fasal Rakshak — Crop Disease Detection

**Currently**: Rule-based dictionary lookup in `services/fasal_rakshak/app.py` lines 70-460.

**What to train**:

| Model | Purpose | Architecture | Dataset |
|-------|---------|-------------|---------|
| Disease Image Classifier | Classify disease from leaf photo | MobileNetV2 / ResNet-50 fine-tuned | [PlantVillage](https://github.com/spMohanty/PlantVillage-Dataset) — 54,305 images, 38 classes |
| Symptom-based Detector | Predict disease from text symptoms | TF-IDF + Random Forest or small transformer | Custom labeled symptom descriptions |

**Training steps**:
```python
# PlantVillage classifier (transfer learning)
import tensorflow as tf

base = tf.keras.applications.MobileNetV2(weights='imagenet', include_top=False, input_shape=(224,224,3))
base.trainable = False

model = tf.keras.Sequential([
    base,
    tf.keras.layers.GlobalAveragePooling2D(),
    tf.keras.layers.Dense(128, activation='relu'),
    tf.keras.layers.Dropout(0.3),
    tf.keras.layers.Dense(38, activation='softmax')  # 38 PlantVillage classes
])

model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
# Train on PlantVillage dataset (~95% accuracy expected)
# Export: model.save('models/plant_disease_mobilenet.h5')
# Or convert to ONNX for faster FastAPI inference
```

**Priority**: HIGH — disease detection is a flagship feature.

---

### 3. Harvest Shakti — Crop Recommendation

**Currently**: Hardcoded suitability matrix with noise in `services/harvest_shakti/app.py` lines 485-620, labeled "simulated Random Forest".

**What to train**:

| Model | Purpose | Architecture | Dataset |
|-------|---------|-------------|---------|
| Crop Recommender | Recommend crop from N/P/K/temp/humidity/pH/rainfall | Random Forest Classifier | [Kaggle Crop Recommendation](https://www.kaggle.com/datasets/atharvaingle/crop-recommendation-dataset) — 2,200 samples, 22 crops |
| Yield Estimator | Predict yield from soil + weather + crop | XGBoost Regressor | Already available: `data/crop_raw_data.csv` (19,690 records) |

**Training steps**:
```python
# Crop recommendation
from sklearn.ensemble import RandomForestClassifier
import pandas as pd, joblib

df = pd.read_csv('data/crop_recommendation.csv')  # Download from Kaggle
X = df[['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']]
y = df['label']

model = RandomForestClassifier(n_estimators=200, max_depth=15, random_state=42)
model.fit(X, y)
# Expected accuracy: ~99% (this dataset is well-separated)
joblib.dump(model, 'src/models/saved_models/crop_recommender_rf.pkl')
```

**Priority**: HIGH — straightforward to train, big improvement.

---

### 4. Kisaan Sahayak — Vision Agent

**Currently**: String matching returns hardcoded PlantVillage class names in `services/kisaan_sahayak/app.py` lines 3340-3440.

**What to train**: Same PlantVillage model as Fasal Rakshak (share the model). The vision agent would call the same CNN, then pass results to the verify agent.

**Priority**: MEDIUM — depends on Fasal Rakshak model being trained first.

---

### 5. Kisaan Sahayak — LLM Agent

**Currently**: Template-based multilingual output in `services/kisaan_sahayak/app.py` lines 4100-4240, labeled "simulated Ollama/Gemini".

**What to connect**:

| Option | Cost | Quality |
|--------|------|---------|
| **Ollama + Llama 3.1 8B** (local) | Free, needs 8GB RAM | Good for Hindi/English summaries |
| **Google Gemini 1.5 Flash** (API) | Free tier: 15 RPM, 1M tokens/day | Best multilingual support |
| **OpenAI GPT-4o-mini** (API) | $0.15/M input tokens | Very high quality |

This isn't a training task — it's an API integration. See [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md).

**Priority**: LOW — template responses work for demo.

---

### 6. Harvest-to-Cart — Demand Prediction

**Currently**: Sine wave + trend + noise in `services/harvest_to_cart/app.py` lines 890-940.

**What to train**:

| Model | Purpose | Architecture | Dataset |
|-------|---------|-------------|---------|
| Demand Forecaster | Predict crop demand by city/season | Prophet or LSTM | Historical mandi arrival data from AgMarkNet (already have price data, need arrival volumes) |

**Priority**: LOW — the sine wave approximation is reasonable for demo.

---

### 7. Kisan Credit Score — Credit Model

**Currently**: Weighted formula in `services/kisan_credit/app.py` lines 380-540.

**What to train**:

| Model | Purpose | Architecture | Dataset |
|-------|---------|-------------|---------|
| Credit Risk Model | Score farmer creditworthiness | Logistic Regression or XGBoost | Would need labeled credit data from NABARD/RBI (not publicly available) |

**Priority**: LOW — the heuristic formula is defensible for a demo. Real credit models require regulated data.

---

### 8. Mausam Chakra — Weather Prediction

**Currently**: All weather data is seeded RNG in `services/mausam_chakra/app.py`.

**What to connect**: The trained weather models already exist in `src/models/saved_models/weather_models/`. Wire them in:

```python
import joblib
weather_rf = joblib.load('src/models/saved_models/weather_models/random_forest_weather.pkl')
scaler = joblib.load('src/models/saved_models/scalers/feature_scaler.pkl')
```

Alternatively, connect to the **OpenWeather API** for real current/forecast data (see INTEGRATION_GUIDE.md).

**Priority**: MEDIUM — models already exist, just need wiring.

---

### 9. Beej Suraksha — Seed Image Analysis

**Currently**: Text-matching against hardcoded color vectors in `services/beej_suraksha/app.py` lines 200-310.

**What to train**:

| Model | Purpose | Architecture | Dataset |
|-------|---------|-------------|---------|
| Seed Quality Classifier | Detect fake/damaged seeds from photo | MobileNetV2 fine-tuned | Custom dataset needed — photograph genuine vs. counterfeit seeds for major Indian varieties |

**Priority**: LOW — custom dataset collection required, complex.

---

## Training Priority Summary

| Priority | Service | Model | Effort | Impact |
|----------|---------|-------|--------|--------|
| 1 | Harvest Shakti | Crop Recommender (RF) | 1 hour | High — Kaggle dataset ready |
| 2 | Fasal Rakshak | PlantVillage Disease CNN | 2-4 hours | High — flagship feature |
| 3 | Mausam Chakra | Wire existing weather models | 1-2 hours | Medium — models already trained |
| 4 | SoilScan AI | Soil Health RF | 2-3 hours | High — needs dataset sourcing |
| 5 | Kisaan Sahayak | Share disease CNN from #2 | 30 min | Medium — reuse Fasal Rakshak model |
| 6 | Harvest-to-Cart | Demand Prophet | 2-3 hours | Low — sine wave is acceptable |
| 7 | Kisan Credit | Credit XGBoost | Unknown | Low — needs regulated data |
| 8 | Beej Suraksha | Seed CNN | Days | Low — needs custom dataset |

---

## How to Add a Trained Model to a Service

General pattern for replacing a simulated endpoint with a real model:

```python
# In the service's app.py, at module level:
import joblib
from pathlib import Path

_model = None

def _load_model():
    global _model
    model_path = Path(__file__).parent / "models" / "my_model.pkl"
    if model_path.exists():
        _model = joblib.load(model_path)

# Call during lifespan startup:
@asynccontextmanager
async def lifespan(app):
    _load_model()
    await init_db()
    yield
    await close_db()

# In the endpoint, replace simulated logic:
@app.post("/predict")
async def predict(request: PredictRequest):
    if _model is None:
        # Fall back to simulated logic
        return _simulated_predict(request)
    
    features = np.array([[request.n, request.p, request.k, ...]])
    prediction = _model.predict(features)
    return {"result": prediction[0]}
```

This pattern lets services **gracefully degrade** to simulated mode when the model file isn't present (e.g., in development without the trained models).
