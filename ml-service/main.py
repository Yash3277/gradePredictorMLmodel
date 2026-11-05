"""
main.py - FastAPI service for the grade model (model.joblib)

Run:   uvicorn main:app --reload --port 8000
Docs:  http://127.0.0.1:8000/docs

POST /predict  { studyHours, homeCondition, parentalPressure } -> { score, grade }
"""
from pathlib import Path
from typing import Any, Dict

import joblib
from fastapi import Body, FastAPI, HTTPException

MODEL_FILE = Path(__file__).parent / "model.joblib"
if not MODEL_FILE.exists():
    raise RuntimeError("model.joblib not found. Run `python train_model.py` first.")
model = joblib.load(MODEL_FILE)

app = FastAPI(title="Grade Predictor - ML Service")

# words the website may send -> the number the model was trained on
HOME_LEVELS = {
    "poor": 1, "bad": 1, "disruptive": 1,
    "average": 2, "moderate": 2, "ok": 2, "okay": 2,
    "good": 3, "stable": 3, "excellent": 3,
}
PRESSURE_LEVELS = {"low": 1, "medium": 2, "moderate": 2, "high": 3}


def to_level(raw, table, name):
    text = str(raw).strip().lower()
    if text in table:
        return table[text]
    if text in ("1", "2", "3"):
        return int(text)
    raise ValueError(f"'{name}' must be one of: {', '.join(sorted(table))}")


def grade_from_score(score):
    if score >= 90:
        return "S"
    if score >= 80:
        return "A"
    if score >= 70:
        return "B"
    if score >= 60:
        return "C"
    if score >= 50:
        return "D"
    return "F"


@app.get("/")
def health_check():
    return {"status": "ok", "model": "RandomForest (trained on simulated data)"}


@app.post("/predict")
def predict(
    student: Dict[str, Any] = Body(
        ..., examples=[{"studyHours": 5, "homeCondition": "Good", "parentalPressure": "High"}]
    )
):
    try:
        hours = float(student.get("studyHours"))
    except (TypeError, ValueError):
        raise HTTPException(status_code=422, detail="'studyHours' must be a number")
    if not 0 <= hours <= 24:
        raise HTTPException(status_code=422, detail="'studyHours' must be between 0 and 24")

    try:
        home = to_level(student.get("homeCondition"), HOME_LEVELS, "homeCondition")
        pressure = to_level(student.get("parentalPressure"), PRESSURE_LEVELS, "parentalPressure")
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error))

    score = float(model.predict([[hours, home, pressure]])[0])
    score = round(max(0.0, min(100.0, score)), 1)
    return {"score": score, "grade": grade_from_score(score)}
