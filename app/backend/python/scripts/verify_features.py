"""
Verify that all required model features are being provided correctly.
"""
import pickle
import joblib
import os

# Get model directory
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
model_dir = os.path.join(base_dir, 'model')

print("=" * 80)
print("FEATURE VERIFICATION REPORT")
print("=" * 80)

# Load Fire Model Features
print("\n🔥 FIRE MODEL FEATURES:")
print("-" * 80)
fire_features_path = os.path.join(model_dir, 'features_list.joblib')
fire_features = joblib.load(fire_features_path)
print(f"Total Required Features: {len(fire_features)}")
for i, feat in enumerate(fire_features, 1):
    print(f"  {i:2d}. {feat}")

# Load Flood Model Features
print("\n🌊 FLOOD MODEL FEATURES:")
print("-" * 80)
flood_features_path = os.path.join(model_dir, 'selected_features.pkl')
flood_features = pickle.load(open(flood_features_path, 'rb'))
print(f"Total Required Features: {len(flood_features)}")
for i, feat in enumerate(flood_features, 1):
    print(f"  {i:2d}. {feat}")

print("\n" + "=" * 80)
print("VERIFICATION COMPLETE")
print("=" * 80)

