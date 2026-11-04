from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

MODEL_FILE = Path("model.joblib")

app = FastAPI(title="Grade Predictor ML API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def load_model():
    if not MODEL_FILE.exists():
        raise FileNotFoundError(
            "model.joblib was not found. Run: python train_model.py"
        )

    return joblib.load(MODEL_FILE)


model_data = load_model()
model = model_data["model"]
features = model_data["features"]


def convert_to_yes_no(value):
    if value is True or value == "Yes" or value == "yes" or value == "true":
        return "yes"

    return "no"


def convert_to_sex(value):
    if value == "Female" or value == "F":
        return "F"

    return "M"


def convert_to_address(value):
    if value == "Urban" or value == "U":
        return "U"

    return "R"


@app.get("/")
def health_check():
    return {
        "message": "Grade Predictor ML service is running",
        "model": model_data["model_name"],
    }


@app.post("/predict")
def predict_grade(student: dict):
    try:
        model_input = {
            "age": int(student["age"]),
            "sex": convert_to_sex(student["sex"]),
            "address": convert_to_address(student["homeAddressType"]),
            "Medu": int(student["motherEducation"]),
            "Fedu": int(student["fatherEducation"]),
            "famrel": int(student["familyRelationshipQuality"]),
            "famsup": convert_to_yes_no(student["familyEducationalSupport"]),
            "studytime": int(student["weeklyStudyTime"]),
            "failures": int(student["pastClassFailures"]),
            "absences": int(student["schoolAbsences"]),
            "schoolsup": convert_to_yes_no(student["schoolEducationalSupport"]),
            "internet": convert_to_yes_no(student["internetAccess"]),
            "higher": convert_to_yes_no(student["wantsHigherEducation"]),
            "freetime": int(student["freeTimeAfterSchool"]),
            "goout": int(student["goingOutWithFriends"]),
            "Dalc": int(student["weekdayAlcoholConsumption"]),
            "Walc": int(student["weekendAlcoholConsumption"]),
            "health": int(student["healthStatus"]),
            "G1": float(student["firstTermGrade"]),
            "G2": float(student["secondTermGrade"]),
        }

        input_frame = pd.DataFrame([model_input], columns=features)

        predicted_grade_out_of_20 = float(model.predict(input_frame)[0])
        predicted_grade_out_of_20 = float(
            np.clip(predicted_grade_out_of_20, 0, 20)
        )

        # Express backend expects a score out of 100 for letter grades.
        percentage_score = round(predicted_grade_out_of_20 * 5, 2)

        return {
            "score": percentage_score,
            "rawScore": round(predicted_grade_out_of_20, 2),
            "outOf": 20,
        }

    except KeyError as error:
        raise HTTPException(
            status_code=400,
            detail=f"Missing required field: {error.args[0]}",
        )

    except (TypeError, ValueError):
        raise HTTPException(
            status_code=400,
            detail="One or more submitted values are invalid.",
        )

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Could not generate a prediction.",
        )