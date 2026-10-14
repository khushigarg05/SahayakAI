import os
import numpy as np
import pandas as pd

np.random.seed(42)

N = 1000

states = [
    "Uttar Pradesh",
    "Bihar",
    "Rajasthan",
    "Madhya Pradesh",
    "Jharkhand",
    "West Bengal"
]

occupations = [
    "Farmer",
    "Student",
    "Daily Wage Worker",
    "Small Business",
    "Self Employed",
    "Homemaker"
]

data = pd.DataFrame({
    "age": np.random.randint(18, 70, N),
    "annual_income": np.random.randint(30000, 500001, N),
    "occupation": np.random.choice(occupations, N),
    "state": np.random.choice(states, N),
    "rural_or_urban": np.random.choice(
        ["Rural", "Urban"], N, p=[0.65, 0.35]
    ),
    "digital_literacy": np.random.randint(1, 6, N),
    "internet_access": np.random.choice(
        ["Yes", "No"], N, p=[0.75, 0.25]
    ),
    "documents_complete": np.random.choice(
        ["Yes", "No"], N, p=[0.70, 0.30]
    ),
    "scheme_awareness": np.random.randint(1, 6, N),
    "distance_to_service_center": np.random.randint(1, 51, N),
    "application_complexity": np.random.randint(1, 6, N),
    "previous_application_failure": np.random.choice(
        ["Yes", "No"], N, p=[0.25, 0.75]
    )
})

# Calculate an access-risk score.
score = (
    (data["digital_literacy"] <= 2).astype(int) * 2
    + (data["internet_access"] == "No").astype(int) * 2
    + (data["documents_complete"] == "No").astype(int) * 3
    + (data["scheme_awareness"] <= 2).astype(int) * 2
    + (data["distance_to_service_center"] >= 30).astype(int) * 2
    + (data["application_complexity"] >= 4).astype(int) * 2
    + (data["previous_application_failure"] == "Yes").astype(int) * 2
    + (data["rural_or_urban"] == "Rural").astype(int)
)

def risk_level(score):
    if score >= 8:
        return "High"
    elif score >= 4:
        return "Medium"
    else:
        return "Low"

data["access_risk"] = score.apply(risk_level)

# Determine the main barrier.
def detect_barrier(row):
    barriers = {
        "Documentation": 0,
        "Digital Access": 0,
        "Awareness": 0,
        "Distance": 0,
        "Application Complexity": 0
    }

    if row["documents_complete"] == "No":
        barriers["Documentation"] += 3

    if row["internet_access"] == "No":
        barriers["Digital Access"] += 2

    if row["digital_literacy"] <= 2:
        barriers["Digital Access"] += 2

    if row["scheme_awareness"] <= 2:
        barriers["Awareness"] += 2

    if row["distance_to_service_center"] >= 30:
        barriers["Distance"] += 2

    if row["application_complexity"] >= 4:
        barriers["Application Complexity"] += 2

    if row["previous_application_failure"] == "Yes":
        barriers["Application Complexity"] += 1

    return max(barriers, key=barriers.get)

data["primary_barrier"] = data.apply(detect_barrier, axis=1)

# Save dataset
output_path = os.path.join(
    os.path.dirname(__file__),
    "..",
    "data",
    "raw",
    "access_risk_dataset.csv"
)

output_path = os.path.abspath(output_path)

data.to_csv(output_path, index=False)

print(f"Dataset created successfully!")
print(f"Rows: {len(data)}")
print(f"Columns: {len(data.columns)}")
print(f"Saved to: {output_path}")

print("\nRisk distribution:")
print(data["access_risk"].value_counts())

print("\nBarrier distribution:")
print(data["primary_barrier"].value_counts())