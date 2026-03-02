import sys
import json
import joblib
import pandas as pd
import os

def predict_signals():
    try:
        demand_model_path = 'ml_data/demand_model.pkl'
        life_model_path = 'ml_data/shelflife_model.pkl'
        encoder_path = 'ml_data/crop_encoder.pkl'
        
        if not os.path.exists(demand_model_path) or not os.path.exists(life_model_path):
            print(json.dumps({"success": False, "error": "Signal models not found."}))
            return

        demand_model = joblib.load(demand_model_path)
        life_model = joblib.load(life_model_path)
        le = joblib.load(encoder_path)
        
        # Args: cropName, month, temp, moisture
        if len(sys.argv) < 5:
            print(json.dumps({"success": False, "error": "Missing args: crop, month, temp, moisture"}))
            return
            
        crop_name = sys.argv[1]
        month = int(sys.argv[2])
        temp = float(sys.argv[3])
        moisture = float(sys.argv[4])
        
        # 1. Demand Prediction
        crop_encoded = le.transform([crop_name])[0]
        demand_score = demand_model.predict(pd.DataFrame([[crop_encoded, month]], columns=['crop_encoded', 'month']))[0]
        
        # 2. Shelf-Life Prediction
        life_days = life_model.predict(pd.DataFrame([[temp, moisture]], columns=['temp', 'moisture']))[0]
        
        result = {
            "success": True,
            "demandScore": round(float(demand_score), 2),
            "estimatedLife": round(float(life_days), 1),
            "crop": crop_name,
            "month": month
        }
        
        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))

if __name__ == "__main__":
    predict_signals()
