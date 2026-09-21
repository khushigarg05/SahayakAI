import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import joblib
import os

def generate_dummy_data(n_samples=5000):
    np.random.seed(42)
    
    data = {
        'age': np.random.randint(18, 80, n_samples),
        'income': np.random.randint(10000, 500000, n_samples),
        'distance_to_csc': np.random.uniform(0.5, 50.0, n_samples), # distance to common service center in km
        'documents_missing': np.random.randint(0, 5, n_samples),
        'literacy_level': np.random.choice([0, 1, 2, 3], n_samples, p=[0.2, 0.4, 0.3, 0.1]), # 0: None, 1: Primary, 2: Secondary, 3: Higher
        'has_internet': np.random.choice([0, 1], n_samples, p=[0.4, 0.6]),
        'caste_category': np.random.choice(['General', 'OBC', 'SC', 'ST'], n_samples, p=[0.3, 0.4, 0.2, 0.1]),
        'location_type': np.random.choice(['Urban', 'Rural'], n_samples, p=[0.3, 0.7])
    }
    
    df = pd.DataFrame(data)
    
    # Calculate Risk Score (0 to 100) based on some logic
    # Higher risk means harder to access welfare
    risk = (
        (df['documents_missing'] * 15) + 
        (df['distance_to_csc'] * 0.5) + 
        ((3 - df['literacy_level']) * 5) + 
        ((1 - df['has_internet']) * 10)
    )
    
    # Add some noise
    risk += np.random.normal(0, 5, n_samples)
    
    # Normalize to 0-100
    risk = np.clip(risk, 0, 100)
    df['risk_score'] = risk
    
    return df

def train_model():
    print("Generating data...")
    df = generate_dummy_data()
    
    # Preprocessing
    le_caste = LabelEncoder()
    df['caste_category_encoded'] = le_caste.fit_transform(df['caste_category'])
    
    le_location = LabelEncoder()
    df['location_type_encoded'] = le_location.fit_transform(df['location_type'])
    
    features = ['age', 'income', 'distance_to_csc', 'documents_missing', 
                'literacy_level', 'has_internet', 'caste_category_encoded', 'location_type_encoded']
    
    X = df[features]
    y = df['risk_score']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training Random Forest Regressor...")
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    score = model.score(X_test, y_test)
    print(f"Model R^2 Score: {score:.3f}")
    
    # Save the model and encoders
    os.makedirs('models', exist_ok=True)
    joblib.dump(model, 'models/risk_model.joblib')
    joblib.dump(le_caste, 'models/le_caste.joblib')
    joblib.dump(le_location, 'models/le_location.joblib')
    
    print("Model and encoders saved to 'models/' directory.")

if __name__ == "__main__":
    train_model()
