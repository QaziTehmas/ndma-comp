# CRITICAL: Import sklearn patches BEFORE any sklearn imports
import sys
import os

# Add parent directory to path to import sklearn_patches
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

# Import patches before any sklearn usage
import sklearn_patches

# Now import everything else
import pickle
import joblib
import pandas as pd
import numpy as np
from datetime import datetime

# Verify sklearn was patched
import sklearn.base
if hasattr(sklearn.base.BaseEstimator, '_sklearn_compatibility_patched'):
    print("✓ Sklearn patches detected and active")
else:
    print("⚠️  WARNING: Sklearn patches were not applied!")
    print("⚠️  This will cause __sklearn_tags__ errors!")
    # Try to apply them now as emergency fallback
    sklearn_patches.apply_sklearn_patches()


class FloodPredictionService:
    def __init__(self, model_path=None):
        """
        Initialize the flood prediction service with the trained XGBoost model.
        
        Args:
            model_path: Path to the pickle file containing the trained model pipeline
        """
        if model_path is None:
            # Default path relative to this file
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            model_path = os.path.join(base_dir, 'model', 'xgboost_flood_model.pkl')
        
        self.model_path = model_path
        self.model = None
        self.load_model()
    
    def load_model(self):
        """Load the pickled model from disk. Try both pickle and joblib with multiple strategies."""
        import warnings
        
        if not os.path.exists(self.model_path):
            raise FileNotFoundError(f"Model file not found at: {self.model_path}")
        
        try:
            # Strategy 1: Try joblib (common for sklearn models)
            try:
                # Suppress version warnings temporarily - we'll handle compatibility issues
                with warnings.catch_warnings():
                    warnings.filterwarnings('ignore', category=UserWarning)
                    warnings.filterwarnings('ignore', category=FutureWarning)
                    # Load with mmap_mode=None to avoid memory mapping issues
                    loaded_obj = joblib.load(self.model_path, mmap_mode=None)
                print(f"✓ Loaded using joblib")
                self.model = loaded_obj
            except Exception as joblib_error:
                error_msg = str(joblib_error)
                print(f"Joblib load failed: {error_msg}")
                
                # Check if it's a version compatibility issue
                if 'RemainderColsList' in error_msg or 'can\'t get attribute' in error_msg.lower() or 'InconsistentVersionWarning' in error_msg:
                    print("\n⚠️  Detected scikit-learn version incompatibility issue")
                    print("   The model was trained with scikit-learn 1.6.1 but you're using a different version.")
                    print("   Attempting compatibility workaround...")
                    
                    # Try to patch the missing class before loading
                    try:
                        self._patch_sklearn_compatibility()
                        with warnings.catch_warnings():
                            warnings.filterwarnings('ignore')
                            warnings.filterwarnings('ignore', category=UserWarning)
                            # Try loading with custom unpickler to handle missing attributes
                            loaded_obj = joblib.load(self.model_path, mmap_mode=None)
                        print(f"✓ Loaded using joblib with compatibility patch")
                        self.model = loaded_obj
                    except Exception as patch_error:
                        print(f"Compatibility patch failed: {patch_error}")
                        raise ValueError(
                            f"Model version incompatibility detected!\n\n"
                            f"Error: {error_msg}\n\n"
                            "SOLUTION:\n"
                            "1. Install the matching scikit-learn version:\n"
                            "   pip install scikit-learn==1.6.1\n\n"
                            "2. Then restart your backend server.\n\n"
                            "Or retrain your model with the current scikit-learn version.\n"
                            "Note: Your requirements.txt has been updated to scikit-learn==1.6.1"
                        ) from joblib_error
                else:
                    # Strategy 2: Try pickle with multiple objects
                    try:
                        with open(self.model_path, 'rb') as f:
                            # Try loading multiple objects (some pickle files contain multiple objects)
                            loaded_objects = []
                            while True:
                                try:
                                    obj = pickle.load(f)
                                    loaded_objects.append(obj)
                                except EOFError:
                                    break
                            
                            if len(loaded_objects) == 0:
                                raise ValueError("Pickle file appears to be empty")
                            
                            # Use the first object, or try to find the model
                            if len(loaded_objects) == 1:
                                loaded_obj = loaded_objects[0]
                            else:
                                # Multiple objects - find the one that looks like a model
                                print(f"Found {len(loaded_objects)} objects in pickle file. Searching for model...")
                                for i, obj in enumerate(loaded_objects):
                                    obj_type = type(obj).__name__
                                    print(f"  Object {i}: {obj_type}")
                                    if hasattr(obj, 'predict') and hasattr(obj, 'predict_proba'):
                                        loaded_obj = obj
                                        print(f"  ✓ Using object {i} as model")
                                        break
                                else:
                                    loaded_obj = loaded_objects[0]  # Use first as fallback
                            
                            print(f"✓ Loaded using pickle")
                            self.model = loaded_obj
                    except Exception as pickle_error:
                        print(f"Pickle load failed: {pickle_error}")
                        raise ValueError(f"Failed to load model with both joblib and pickle. File may be corrupted or in wrong format.")
            
            # Now inspect what we loaded
            if self.model is None:
                raise ValueError("Failed to load model - model is None")
            
            # Check sklearn version and warn if mismatched
            try:
                import sklearn
                sklearn_version = sklearn.__version__
                if sklearn_version != "1.6.1":
                    print(f"⚠️  WARNING: Model was trained with scikit-learn 1.6.1, but you're using {sklearn_version}")
                    print(f"   This WILL cause compatibility issues. Install the correct version:")
                    print(f"   pip install scikit-learn==1.6.1")
                else:
                    print(f"✓ Sklearn version match: {sklearn_version}")
            except Exception:
                pass
            
            # Fix sklearn tags compatibility issue immediately after loading
            self._ensure_sklearn_tags(self.model)
                
            loaded_obj = self.model
            obj_type = type(loaded_obj).__name__
            print(f"Loaded object type: {obj_type}")
            
            # Check if it's a numpy array
            if isinstance(loaded_obj, np.ndarray):
                raise ValueError(
                    "The pickle file contains a numpy array (likely predictions), not the model.\n"
                    "Please ensure you saved the model pipeline (xgb_pipe) not the predictions.\n"
                    "In your Colab notebook, use: pickle.dump(xgb_pipe, file) or joblib.dump(xgb_pipe, file)"
                )
            
            # Check if it's a dictionary
            if isinstance(loaded_obj, dict):
                print(f"Dictionary loaded with keys: {list(loaded_obj.keys())}")
                # Try to find model in dictionary
                possible_keys = ['xgb_pipe', 'model', 'pipeline', 'classifier', 'estimator', 'pipe']
                for key in possible_keys:
                    if key in loaded_obj:
                        print(f"  Found model under key: '{key}'")
                        loaded_obj = loaded_obj[key]
                        break
                else:
                    # Try to find any object with predict method in dict values
                    for key, value in loaded_obj.items():
                        if hasattr(value, 'predict') and hasattr(value, 'predict_proba'):
                            print(f"  Found model under key: '{key}'")
                            loaded_obj = value
                            break
                    else:
                        raise ValueError(
                            f"Dictionary loaded but no model found. Keys: {list(loaded_obj.keys())}\n"
                            "Expected keys: 'xgb_pipe', 'model', 'pipeline', 'classifier', 'estimator', or 'pipe'"
                        )
            
            self.model = loaded_obj
            
            # Verify the model has the required methods
            if not hasattr(self.model, 'predict'):
                raise ValueError(
                    f"Loaded object does not have 'predict' method.\n"
                    f"Type: {type(self.model)}\n"
                    f"Attributes: {[attr for attr in dir(self.model) if not attr.startswith('_')]}"
                )
            if not hasattr(self.model, 'predict_proba'):
                raise ValueError(
                    f"Loaded object does not have 'predict_proba' method.\n"
                    f"Type: {type(self.model)}\n"
                    f"Attributes: {[attr for attr in dir(self.model) if not attr.startswith('_')]}"
                )
                
            print(f"✓ Model verified: {type(self.model).__name__}")
            print(f"  - Has 'predict' method: ✓")
            print(f"  - Has 'predict_proba' method: ✓")
            
        except Exception as e:
            error_msg = f"Error loading model from {self.model_path}:\n{str(e)}\n\n"
            error_msg += "Troubleshooting tips:\n"
            error_msg += "1. Ensure the pickle file contains the trained pipeline (xgb_pipe), not predictions\n"
            error_msg += "2. Check if the file was saved with pickle.dump() or joblib.dump()\n"
            error_msg += "3. Verify the file is not corrupted\n"
            error_msg += "4. If using a dictionary, ensure it has key 'xgb_pipe' or 'model'"
            print(error_msg)
            raise ValueError(error_msg) from e
    
    def _patch_sklearn_compatibility(self):
        """
        Patch sklearn to handle version compatibility issues.
        This is a workaround for models saved with different sklearn versions.
        """
        try:
            import sklearn.compose._column_transformer as ct_module
            
            # Check if _RemainderColsList exists
            if hasattr(ct_module, '_RemainderColsList'):
                return  # Already exists, no patch needed
            
            # Try to import from older location or create stub
            try:
                # In older versions, it might be directly accessible
                from sklearn.compose._column_transformer import _RemainderColsList
                return
            except ImportError:
                # Create a compatibility stub
                class _RemainderColsList(list):
                    """Compatibility stub for _RemainderColsList class"""
                    def __init__(self, *args, **kwargs):
                        super().__init__(*args, **kwargs)
                
                # Monkey-patch into the module
                ct_module._RemainderColsList = _RemainderColsList
                print("  Applied compatibility patch for _RemainderColsList")
                
        except Exception as e:
            print(f"  Could not apply compatibility patch: {e}")
            # Don't raise, let the main error handling deal with it
    
    def _ensure_sklearn_tags(self, estimator):
        """
        Ensure __sklearn_tags__ attribute exists on estimator and all its components.
        This fixes version compatibility issues.
        """
        try:
            # Set __sklearn_tags__ on the main estimator if not already set
            if not hasattr(estimator, '__sklearn_tags__'):
                try:
                    object.__setattr__(estimator, '__sklearn_tags__', {})
                except (AttributeError, TypeError):
                    # If we can't set it directly, skip
                    pass
            
            # If it's a pipeline, patch all steps
            if hasattr(estimator, 'named_steps'):
                for step_name, step in estimator.named_steps.items():
                    if step is not None:
                        self._ensure_sklearn_tags(step)
            elif hasattr(estimator, 'steps'):
                for step_name, step in estimator.steps:
                    if step is not None:
                        self._ensure_sklearn_tags(step)
            
            # If it has transformers (like ColumnTransformer)
            if hasattr(estimator, 'transformers'):
                for name, trans, cols in estimator.transformers:
                    if trans is not None and trans != 'drop':
                        self._ensure_sklearn_tags(trans)
            
            # If it has other estimators (like in feature unions, etc.)
            if hasattr(estimator, 'transformer_list'):
                for name, trans in estimator.transformer_list:
                    if trans is not None:
                        self._ensure_sklearn_tags(trans)
                    
        except Exception:
            # Silently fail if we can't patch
            pass
    
    def _calculate_derived_features(self, data):
        """
        Calculate derived features from input data.
        
        Args:
            data: Dictionary containing input features
            
        Returns:
            Dictionary with derived features added
        """
        # Calculate temp_range
        if 'temp_range' not in data:
            temp_max = data.get('temperature_max', 0)
            temp_min = data.get('temperature_min', 0)
            data['temp_range'] = temp_max - temp_min
        
        # Calculate day_of_year
        if 'day_of_year' not in data:
            year = data.get('year', 2000)
            month = data.get('month', 1)
            day = data.get('day', 1)
            try:
                date_obj = datetime(year, month, day)
                data['day_of_year'] = date_obj.timetuple().tm_yday
            except:
                data['day_of_year'] = 1
        
        # Calculate season
        if 'season' not in data:
            month = data.get('month', 1)
            if month in [12, 1, 2]:
                data['season'] = 'Winter'
            elif month in [3, 4, 5]:
                data['season'] = 'Spring'
            elif month in [6, 7, 8]:
                data['season'] = 'Summer'
            else:
                data['season'] = 'Autumn'
        
        return data
    
    def predict(self, input_data):
        """
        Predict flood probability and binary classification.
        
        Args:
            input_data: Dictionary containing all required features for the model
            
        Returns:
            Dictionary with prediction results:
            - flood_probability: Probability of flood (0-1)
            - flood_prediction: Binary prediction (0 or 1)
            - prediction_label: Human-readable prediction
        """
        global _model_load_error
        
        if self.model is None:
            error_msg = "Model not loaded."
            if _model_load_error:
                error_msg += f"\n\nOriginal error: {_model_load_error}\n"
                error_msg += "Please check MODEL_SETUP.md for instructions on fixing the model file.\n"
                error_msg += "Run 'python inspect_model.py' to inspect the pickle file contents."
            raise ValueError(error_msg)
        
        # Calculate derived features
        input_data = self._calculate_derived_features(input_data.copy())
        
        # Convert to DataFrame (single row)
        try:
            df = pd.DataFrame([input_data])
            
            # Try to get feature names from model if it's a pipeline
            try:
                if hasattr(self.model, 'feature_names_in_'):
                    # Model has expected feature names
                    expected_features = self.model.feature_names_in_
                    # Reorder columns to match expected order
                    df = df.reindex(columns=expected_features, fill_value=0)
                elif hasattr(self.model, 'get_feature_names_out'):
                    # Pipeline with feature names
                    expected_features = self.model.get_feature_names_out()
                    df = df.reindex(columns=expected_features, fill_value=0)
                elif hasattr(self.model, 'steps') or hasattr(self.model, 'named_steps'):
                    # It's a pipeline, try to get feature names from the final step
                    if hasattr(self.model, 'named_steps'):
                        final_step = list(self.model.named_steps.values())[-1]
                    else:
                        final_step = self.model.steps[-1][1] if hasattr(self.model, 'steps') else self.model
                    
                    if hasattr(final_step, 'feature_names_in_'):
                        expected_features = final_step.feature_names_in_
                        df = df.reindex(columns=expected_features, fill_value=0)
            except Exception as e:
                print(f"Warning: Could not reorder features: {e}. Using original order.")
            
            # Ensure tags exist before prediction (safety check)
            try:
                self._ensure_sklearn_tags(self.model)
            except Exception:
                pass  # Already patched by main.py
            
            # Get probability prediction with error handling
            try:
                proba_result = self.model.predict_proba(df)
            except (AttributeError, TypeError) as e:
                error_str = str(e)
                if '__sklearn_tags__' in error_str or 'sklearn_tags' in error_str or 'super' in error_str.lower():
                    # Try one more patch attempt
                    print("⚠️  Warning: sklearn_tags error detected. Applying emergency patch...")
                    try:
                        self._ensure_sklearn_tags(self.model)
                        # Try one more time
                        proba_result = self.model.predict_proba(df)
                    except Exception as final_error:
                        import sklearn
                        sklearn_version = sklearn.__version__
                        raise ValueError(
                            f"Error calling predict_proba: {final_error}\n\n"
                            f"Scikit-learn version: {sklearn_version}\n\n"
                            "There's a compatibility issue with the model.\n"
                            "Make sure you have scikit-learn==1.6.1 installed and the compatibility\n"
                            "patches in main.py are applied correctly.\n\n"
                            "Try:\n"
                            "1. pip install scikit-learn==1.6.1\n"
                            "2. Restart your backend server\n"
                            "3. Ensure main.py runs before this module imports sklearn"
                        ) from final_error
                else:
                    raise
            
            # Handle different return formats
            if proba_result.ndim == 1:
                # Single class probabilities (binary classification)
                flood_probability = proba_result[1] if len(proba_result) > 1 else proba_result[0]
            elif proba_result.ndim == 2:
                # 2D array: [class_0_prob, class_1_prob]
                flood_probability = proba_result[0, 1] if proba_result.shape[1] > 1 else proba_result[0, 0]
            else:
                raise ValueError(f"Unexpected predict_proba output shape: {proba_result.shape}")
            
            # Get binary prediction
            prediction_result = self.model.predict(df)
            
            # Handle different prediction formats
            if isinstance(prediction_result, np.ndarray):
                flood_prediction = int(prediction_result[0])
            else:
                flood_prediction = int(prediction_result)
            
            return {
                'flood_probability': float(flood_probability),
                'flood_prediction': flood_prediction,
                'prediction_label': '⚠️ FLOOD RISK' if flood_prediction == 1 else '✓ NO FLOOD',
                'probability_percentage': round(float(flood_probability) * 100, 2)
            }
        except AttributeError as e:
            raise ValueError(f"Model does not support required method: {str(e)}. Model type: {type(self.model)}")
        except Exception as e:
            raise ValueError(f"Error during prediction: {str(e)}")


# Singleton instance
_prediction_service = None
_model_load_error = None

def get_prediction_service():
    """Get or create the singleton prediction service instance."""
    global _prediction_service, _model_load_error
    
    if _prediction_service is None:
        try:
            _prediction_service = FloodPredictionService()
            _model_load_error = None
        except Exception as e:
            _model_load_error = str(e)
            # Don't raise here, let the predict method handle it
            # This allows the server to start even if model fails to load
            print(f"Warning: Model failed to load during initialization: {_model_load_error}")
    
    return _prediction_service