import joblib
import numpy as np
import pandas as pd

from pathlib import Path
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from sklearn.tree import DecisionTreeRegressor

DATA_FILE = "student-mat.csv"
MODEL_FILE = "model.joblib"
RANDOM_STATE = 42
USE_PAST_GRADES = False
ALL_FEATURES = [
    "age",
    "sex",
    "address",
    "Medu",
    "Fedu",
    "famrel",
    "famsup",
    "studytime",
    "failures",
    "absences",
    "schoolsup",
    "internet",
    "higher",
    "freetime",
    "goout",
    "Dalc",
    "Walc",
    "health",
    "G1",
    "G2",
]

CATEGORICAL_FEATURES = [
    "sex",
    "address",
    "famsup",
    "schoolsup",
    "internet",
    "higher",
]

FEATURES = (
    ALL_FEATURES
    if USE_PAST_GRADES
    else [feature for feature in ALL_FEATURES if feature not in ["G1", "G2"]]
)

NUMERIC_FEATURES = [
    feature for feature in FEATURES if feature not in CATEGORICAL_FEATURES
]


def create_pipeline(model):
    preprocessor = ColumnTransformer(
        transformers=[
            (
                "categorical",
                OneHotEncoder(handle_unknown="ignore"),
                CATEGORICAL_FEATURES,
            ),
            ("numeric", "passthrough", NUMERIC_FEATURES),
        ]
    )

    return Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("model", model),
        ]
    )


def evaluate_model(model_name, pipeline, x_train, x_test, y_train, y_test):
    pipeline.fit(x_train, y_train)

    predictions = pipeline.predict(x_test)
    predictions = np.clip(predictions, 0, 20)

    mae = mean_absolute_error(y_test, predictions)
    rmse = np.sqrt(mean_squared_error(y_test, predictions))
    r2 = r2_score(y_test, predictions)

    print(f"\n{model_name}")
    print(f"MAE:  {mae:.3f}")
    print(f"RMSE: {rmse:.3f}")
    print(f"R²:   {r2:.3f}")

    return {
        "name": model_name,
        "pipeline": pipeline,
        "mae": mae,
        "rmse": rmse,
        "r2": r2,
    }


def main():
    if not Path(DATA_FILE).exists():
        raise FileNotFoundError(
            f"{DATA_FILE} was not found. Place student-mat.csv in the ml-service folder."
        )

    df = pd.read_csv(DATA_FILE, sep=";")
    df.columns = df.columns.str.strip()

    required_columns = FEATURES + ["G3"]
    missing_columns = [
        column for column in required_columns if column not in df.columns
    ]

    if missing_columns:
        raise ValueError(
            f"Dataset is missing required columns: {', '.join(missing_columns)}"
        )

    x = df[FEATURES].copy()
    y = df["G3"].copy()

    x_train, x_test, y_train, y_test = train_test_split(
        x,
        y,
        test_size=0.2,
        random_state=RANDOM_STATE,
    )

    models = [
        (
            "Linear Regression",
            create_pipeline(LinearRegression()),
        ),
        (
            "Decision Tree",
            create_pipeline(
                DecisionTreeRegressor(
                    max_depth=5,
                    random_state=RANDOM_STATE,
                )
            ),
        ),
        (
            "Random Forest",
            create_pipeline(
                RandomForestRegressor(
                    n_estimators=300,
                    random_state=RANDOM_STATE,
                    min_samples_leaf=2,
                )
            ),
        ),
    ]

    model_results = []

    print("Training models...")
    print(f"Dataset rows: {len(df)}")
    print(f"Features used: {len(FEATURES)}")

    for model_name, pipeline in models:
        result = evaluate_model(
            model_name,
            pipeline,
            x_train,
            x_test,
            y_train,
            y_test,
        )
        model_results.append(result)

    best_model = min(model_results, key=lambda item: item["rmse"])

    comparison = pd.DataFrame(
        [
            {
                "Model": item["name"],
                "MAE": round(item["mae"], 3),
                "RMSE": round(item["rmse"], 3),
                "R2": round(item["r2"], 3),
            }
            for item in model_results
        ]
    )

    comparison.to_csv("model_comparison.csv", index=False)

    joblib.dump(
        {
            "model": best_model["pipeline"],
            "model_name": best_model["name"],
            "features": FEATURES,
            "score_scale": "0-20",
        },
        MODEL_FILE,
    )

    print("\n-----------------------------")
    print(f"Best model: {best_model['name']}")
    print(f"Saved model: {MODEL_FILE}")
    print("Saved comparison: model_comparison.csv")
    print("-----------------------------")


if __name__ == "__main__":
    main()