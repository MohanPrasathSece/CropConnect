import sys
import json
import joblib
import pandas as pd
import os

def predict():
    try:
        # Check if model files exist
        model_path = 'ml_data/price_model.pkl'
        encoder_path = 'ml_data/crop_encoder.pkl'
        
        if not os.path.exists(model_path) or not os.path.exists(encoder_path):
            print(json.dumps({"success": False, "error": "Model files not found. Please train the model first."}))
            return

        model = joblib.load(model_path)
        le = joblib.load(encoder_path)
        
        # Get arguments
        if len(sys.argv) < 5:
            print(json.dumps({"success": False, "error": "Missing arguments. Required: crop, month, rain, temp"}))
            return
            
        crop_name = sys.argv[1]
        month = int(sys.argv[2])
        rain = float(sys.argv[3])
        temp = float(sys.argv[4])
        
        # Valid crops
        valid_crops = le.classes_.tolist()
        if crop_name not in valid_crops:
            print(json.dumps({"success": False, "error": f"Model only trained for: {', '.join(valid_crops)}"}))
            return
            
        # Encode and Predict
        crop_encoded = le.transform([crop_name])[0]
        input_data = pd.DataFrame([[crop_encoded, month, rain, temp]], columns=['crop_encoded', 'month', 'rain', 'temp'])
        
        prediction = model.predict(input_data)[0]
        
        result = {
            "success": True,
            "crop": crop_name,
            "predictedPrice": round(prediction, 2),
            "month": month,
            "metadata": {
                "rain": rain,
                "temp": temp,
                "model": "RandomForestRegressor"
            }
        }
        
        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))

if __name__ == "__main__":
    predict()
