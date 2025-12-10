# Model Setup Instructions

## Problem: Pickle file contains numpy array instead of model

If you're getting the error: `"Loaded object is a numpy array, not a model"`, this means your pickle file contains predictions instead of the trained model pipeline.

## Solution: Save the model correctly

In your Google Colab notebook, make sure you save the **model pipeline**, not the predictions:

### ✅ Correct way to save:

```python
import pickle
import joblib

# Save using pickle
with open('xgboost_flood_model.pkl', 'wb') as f:
    pickle.dump(xgb_pipe, f)  # Save the pipeline, not predictions!

# OR save using joblib (recommended for sklearn/XGBoost)
joblib.dump(xgb_pipe, 'xgboost_flood_model.pkl')  # This is preferred
```

### ❌ Wrong ways (don't do this):

```python
# DON'T save predictions
predictions = xgb_pipe.predict(test_input)
pickle.dump(predictions, f)  # ❌ This saves predictions, not the model

# DON'T save probabilities
proba = xgb_pipe.predict_proba(test_input)
pickle.dump(proba, f)  # ❌ This saves probabilities, not the model
```

## Inspect your current pickle file

Run this script to see what's in your pickle file:

```bash
cd backend/python
python inspect_model.py
```

This will show you:
- What type of object is stored
- If it's a dictionary, what keys it has
- If it's an array, what shape it has
- Whether it has the required `predict` and `predict_proba` methods

## What should be saved

Your pickle file should contain:
- The **pipeline object** (`xgb_pipe`) which has:
  - `predict()` method
  - `predict_proba()` method
  - All preprocessing steps (if using a pipeline)

## Example Colab code:

```python
# After training your model
xgb_pipe = ...  # Your trained pipeline

# Save the model
import joblib
joblib.dump(xgb_pipe, 'xgboost_flood_model.pkl')

# Download the file
from google.colab import files
files.download('xgboost_flood_model.pkl')
```

## After fixing the file

1. Replace `backend/python/model/xgboost_flood_model.pkl` with your corrected file
2. Restart the backend server
3. The model should load correctly

## Troubleshooting

If you still have issues:
1. Run `python inspect_model.py` to check the file contents
2. Ensure the file is not corrupted
3. Check the file size (should be several MB for an XGBoost model)
4. Verify the file was saved with the correct library (pickle or joblib)

