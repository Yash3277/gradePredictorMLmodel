# ml-simple - ML service for the current 3-field website

Works with your website exactly as it is today (studyHours, homeCondition,
parentalPressure). No changes needed in the backend or frontend.

## Run (Windows)

    cd ml-simple
    python -m venv venv
    venv\Scripts\activate
    pip install -r requirements.txt
    python train_model.py          <- once; creates model.joblib
    uvicorn main:app --reload --port 8000

Test at http://127.0.0.1:8000/docs (POST /predict).

Keep ML_SERVICE_URL=http://localhost:8000/predict in the backend .env.
Run this OR the mlmodel folder (Varshith's) - both use port 8000.

## Be honest about the data

The training data is generated from simple assumptions (see make_data in
train_model.py), because no real dataset has these three inputs. The R2
printed during training measures how well the model learned those
assumptions, not real-world accuracy. Present it as a demo model.
