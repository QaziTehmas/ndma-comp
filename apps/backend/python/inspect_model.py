"""
Utility script to inspect the contents of the pickle file.
Run this to debug what's actually stored in the model file.
"""
import pickle
import joblib
import numpy as np
import os
import sys

def inspect_model_file(model_path):
    """Inspect the contents of a pickle/joblib model file."""
    if not os.path.exists(model_path):
        print(f"❌ File not found: {model_path}")
        return
    
    print(f"📁 Inspecting: {model_path}")
    print(f"📊 File size: {os.path.getsize(model_path) / 1024:.2f} KB\n")
    
    # Try joblib first
    print("=" * 60)
    print("Trying joblib.load()...")
    print("=" * 60)
    try:
        obj = joblib.load(model_path)
        print(f"✓ Successfully loaded with joblib")
        print(f"  Type: {type(obj)}")
        print(f"  Type name: {type(obj).__name__}")
        
        if isinstance(obj, np.ndarray):
            print(f"  ⚠️  This is a numpy array, not a model!")
            print(f"  Shape: {obj.shape}")
            print(f"  First few values: {obj.flat[:10]}")
        elif isinstance(obj, dict):
            print(f"  This is a dictionary with {len(obj)} keys")
            print(f"  Keys: {list(obj.keys())}")
            for key, value in obj.items():
                print(f"    '{key}': {type(value).__name__}")
                if hasattr(value, 'predict'):
                    print(f"      ✓ Has 'predict' method")
                if hasattr(value, 'predict_proba'):
                    print(f"      ✓ Has 'predict_proba' method")
        else:
            print(f"  Attributes: {[attr for attr in dir(obj) if not attr.startswith('_')][:20]}")
            if hasattr(obj, 'predict'):
                print(f"  ✓ Has 'predict' method")
            if hasattr(obj, 'predict_proba'):
                print(f"  ✓ Has 'predict_proba' method")
        
    except Exception as e:
        print(f"❌ Failed: {e}")
    
    # Try pickle
    print("\n" + "=" * 60)
    print("Trying pickle.load()...")
    print("=" * 60)
    try:
        with open(model_path, 'rb') as f:
            objects = []
            while True:
                try:
                    obj = pickle.load(f)
                    objects.append(obj)
                except EOFError:
                    break
            
            print(f"✓ Found {len(objects)} object(s) in pickle file")
            
            for i, obj in enumerate(objects):
                print(f"\n  Object {i+1}:")
                print(f"    Type: {type(obj)}")
                print(f"    Type name: {type(obj).__name__}")
                
                if isinstance(obj, np.ndarray):
                    print(f"    ⚠️  This is a numpy array, not a model!")
                    print(f"    Shape: {obj.shape}")
                elif isinstance(obj, dict):
                    print(f"    Dictionary with {len(obj)} keys: {list(obj.keys())}")
                    for key, value in obj.items():
                        print(f"      '{key}': {type(value).__name__}")
                        if hasattr(value, 'predict'):
                            print(f"        ✓ Has 'predict' method")
                        if hasattr(value, 'predict_proba'):
                            print(f"        ✓ Has 'predict_proba' method")
                else:
                    attrs = [attr for attr in dir(obj) if not attr.startswith('_')][:10]
                    print(f"    Sample attributes: {attrs}")
                    if hasattr(obj, 'predict'):
                        print(f"    ✓ Has 'predict' method")
                    if hasattr(obj, 'predict_proba'):
                        print(f"    ✓ Has 'predict_proba' method")
                    
    except Exception as e:
        print(f"❌ Failed: {e}")

if __name__ == "__main__":
    # Default model path
    if len(sys.argv) > 1:
        model_path = sys.argv[1]
    else:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(base_dir, 'model', 'xgboost_flood_model.pkl')
    
    inspect_model_file(model_path)

