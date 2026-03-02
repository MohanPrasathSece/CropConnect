import sys
import json
import joblib
import pandas as pd
import os

def predict_quality():
    try:
        # Check if model files exist
        score_model_path = 'ml_data/quality_score_model.pkl'
        grade_model_path = 'ml_data/quality_grade_model.pkl'
        
        if not os.path.exists(score_model_path) or not os.path.exists(grade_model_path):
            print(json.dumps({"success": False, "error": "Quality model files not found."}))
            return

        score_model = joblib.load(score_model_path)
        grade_model = joblib.load(grade_model_path)
        
        # Get arguments: color, size, texture, moisture, purity
        if len(sys.argv) < 6:
            print(json.dumps({"success": False, "error": "Missing arguments. Required: color, size, texture, moisture, purity"}))
            return
            
        color = int(sys.argv[1])   # 0-2
        size = int(sys.argv[2])    # 0-2
        texture = int(sys.argv[3]) # 0-2
        moisture = float(sys.argv[4])
        purity = float(sys.argv[5])
        
        input_data = pd.DataFrame([[color, size, texture, moisture, purity]], 
                                  columns=['color', 'size', 'texture', 'moisture', 'purity'])
        
        predicted_score = score_model.predict(input_data)[0]
        predicted_grade = grade_model.predict(input_data)[0]
        
        result = {
            "success": True,
            "qualityScore": round(float(predicted_score), 2),
            "overallGrade": str(predicted_grade),
            "details": {
                "colorIndex": color,
                "sizeIndex": size,
                "textureIndex": texture,
                "moisture": moisture,
                "purity": purity
            },
            "method": "RandomForest-TOP-Quality"
        }
        
        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))

if __name__ == "__main__":
    predict_quality()
