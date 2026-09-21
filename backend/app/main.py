import os

try:
    import joblib
    import pandas as pd
    import shap
    ML_AVAILABLE = True
except ImportError:
    ML_AVAILABLE = False

from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="SahayakAI API")

# Global variables for ML models
model = None
le_caste = None
le_location = None
explainer = None

@app.on_event("startup")
def load_models():
    global model, le_caste, le_location, explainer
    if not ML_AVAILABLE:
        print("Warning: ML libraries (Numpy/Pandas/SHAP) could not be loaded. Using simulation fallback.")
        return
        
    base_dir = os.path.dirname(__file__)
    model_path = os.path.join(base_dir, "../models/risk_model.joblib")
    caste_path = os.path.join(base_dir, "../models/le_caste.joblib")
    loc_path = os.path.join(base_dir, "../models/le_location.joblib")
    
    if os.path.exists(model_path):
        model = joblib.load(model_path)
        le_caste = joblib.load(caste_path)
        le_location = joblib.load(loc_path)
        explainer = shap.TreeExplainer(model)
        print("ML Models loaded successfully!")
    else:
        print("Warning: ML Models not found. Using simulation fallback.")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserProfile(BaseModel):
    age: int
    income: int
    distance_to_csc: float
    documents_missing: int
    literacy_level: int
    has_internet: int
    caste_category: str
    location_type: str

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "SahayakAI Backend",
        "model_loaded": model is not None
    }

@app.post("/predict")
def predict_risk(profile: UserProfile):
    try:
        if model is not None:
            # Use Real ML Model
            try:
                caste_encoded = le_caste.transform([profile.caste_category])[0]
            except Exception:
                caste_encoded = 0
                
            try:
                location_encoded = le_location.transform([profile.location_type])[0]
            except Exception:
                location_encoded = 0
                
            input_data = pd.DataFrame([{
                'age': profile.age,
                'income': profile.income,
                'distance_to_csc': profile.distance_to_csc,
                'documents_missing': profile.documents_missing,
                'literacy_level': profile.literacy_level,
                'has_internet': profile.has_internet,
                'caste_category_encoded': caste_encoded,
                'location_type_encoded': location_encoded
            }])
            
            risk_score = float(model.predict(input_data)[0])
            risk_score = min(max(risk_score, 0), 98.5)
            
            # SHAP values for Explainability
            shap_values = explainer.shap_values(input_data)[0]
            
            barriers = []
            feature_names = input_data.columns
            for i, feat in enumerate(feature_names):
                impact = float(shap_values[i])
                if impact > 0: # Positive impact increases risk
                    barriers.append({"feature": feat, "impact_score": impact})
                    
            barriers.sort(key=lambda x: x["impact_score"], reverse=True)
            
            top_barriers = []
            name_map = {
                "age": "Age Factor",
                "income": "Income Level",
                "documents_missing": f"Missing {profile.documents_missing} Documents",
                "literacy_level": "Low Digital/Formal Literacy",
                "has_internet": "No Internet Access",
                "distance_to_csc": f"Distance to CSC ({profile.distance_to_csc} km)",
                "caste_category_encoded": "Caste Category",
                "location_type_encoded": "Location Type"
            }
            
            for b in barriers[:3]:
                if b["impact_score"] > 1.0:
                    top_barriers.append({
                        "feature": name_map.get(b["feature"], b["feature"]),
                        "impact_score": round(b["impact_score"], 1)
                    })
        else:
            # Fallback to Heuristic Risk Calculation (Simulating Random Forest)
            base_risk = 10
            doc_risk = profile.documents_missing * 18
            literacy_risk = (3 - profile.literacy_level) * 8
            distance_risk = min(profile.distance_to_csc * 0.5, 20)
            internet_risk = 15 if profile.has_internet == 0 else 0
            
            total_risk = base_risk + doc_risk + literacy_risk + distance_risk + internet_risk
            risk_score = min(total_risk, 98.5)
            
            barriers = [
                {"feature": "documents_missing", "impact_score": doc_risk},
                {"feature": "literacy_level", "impact_score": literacy_risk},
                {"feature": "has_internet", "impact_score": internet_risk},
                {"feature": "distance_to_csc", "impact_score": distance_risk}
            ]
            
            barriers.sort(key=lambda x: x["impact_score"], reverse=True)
            
            top_barriers = []
            name_map = {
                "documents_missing": f"Missing {profile.documents_missing} Documents",
                "literacy_level": "Low Digital/Formal Literacy",
                "has_internet": "No Internet Access",
                "distance_to_csc": f"Distance to CSC ({profile.distance_to_csc} km)"
            }
            for b in barriers[:3]:
                if b["impact_score"] > 5:
                    top_barriers.append({
                        "feature": name_map[b["feature"]],
                        "impact_score": round(b["impact_score"], 1)
                    })
        
        return {
            "risk_score": round(risk_score, 1),
            "risk_level": "High" if risk_score > 70 else "Medium" if risk_score > 40 else "Low",
            "top_barriers": top_barriers
        }
        
    except Exception as e:
        return {"error": str(e)}

@app.post("/schemes/match")
def match_schemes(profile: UserProfile):
    eligible_schemes = []
    
    # 1. Ayushman Bharat (PMJAY) - Healthcare
    if profile.income < 100000 and profile.location_type == "Rural":
        eligible_schemes.append({
            "name": "Ayushman Bharat (PMJAY)",
            "category": "Healthcare",
            "benefit": "Health cover of ₹5 Lakhs per family per year",
            "difficulty": "Medium" if profile.documents_missing > 0 else "Low"
        })
        
    # 2. PM Kisan Samman Nidhi - Agriculture
    if profile.income < 300000 and profile.location_type == "Rural":
        eligible_schemes.append({
            "name": "PM Kisan Samman Nidhi",
            "category": "Agriculture",
            "benefit": "₹6,000 per year minimum income support",
            "difficulty": "Low"
        })
        
    # 3. PM Ujjwala Yojana - Women/Household
    if profile.income < 150000:
        eligible_schemes.append({
            "name": "Pradhan Mantri Ujjwala Yojana (PMUY)",
            "category": "Household",
            "benefit": "LPG connection to women of BPL families",
            "difficulty": "High" if profile.documents_missing > 1 else "Medium"
        })
        
    # 4. Post Matric Scholarship
    if profile.age >= 18 and profile.age <= 25 and profile.caste_category in ["SC", "ST", "OBC"] and profile.income < 250000:
        eligible_schemes.append({
            "name": "Post Matric Scholarship",
            "category": "Education",
            "benefit": "Financial assistance for higher education",
            "difficulty": "High" if profile.documents_missing > 0 else "Low"
        })
        
    # 5. National Social Assistance Programme (NSAP) - Pension
    if profile.age >= 60 and profile.income < 50000:
        eligible_schemes.append({
            "name": "Indira Gandhi National Old Age Pension Scheme",
            "category": "Pension",
            "benefit": "Monthly pension for senior citizens below poverty line",
            "difficulty": "Medium"
        })

    return {
        "total_matches": len(eligible_schemes),
        "schemes": eligible_schemes
    }