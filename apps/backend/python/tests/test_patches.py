"""
Test script to verify sklearn patches are working
"""
import sklearn_patches
import sklearn
import sklearn.base

print("=" * 60)
print("SKLEARN PATCH VERIFICATION")
print("=" * 60)

print(f"Sklearn version: {sklearn.__version__}")
print(f"Patches applied: {hasattr(sklearn.base.BaseEstimator, '_sklearn_compatibility_patched')}")

# Check BaseEstimator
print(f"\nBaseEstimator checks:")
print(f"  - Has __sklearn_tags__: {hasattr(sklearn.base.BaseEstimator, '__sklearn_tags__')}")
print(f"  - Has sklearn_tags: {hasattr(sklearn.base.BaseEstimator, 'sklearn_tags')}")
print(f"  - Has get_tags: {hasattr(sklearn.base.BaseEstimator, 'get_tags')}")
print(f"  - Has _get_tags: {hasattr(sklearn.base.BaseEstimator, '_get_tags')}")

# Check Mixins
try:
    from sklearn.base import ClassifierMixin
    print(f"\nClassifierMixin checks:")
    print(f"  - Has __sklearn_tags__: {hasattr(ClassifierMixin, '__sklearn_tags__')}")
except ImportError:
    print("\nClassifierMixin not found")

# Try creating a simple estimator instance
print("\n" + "=" * 60)
print("Testing instance creation...")
print("=" * 60)

try:
    class DummyEstimator(sklearn.base.BaseEstimator):
        def fit(self, X, y):
            return self
        def predict(self, X):
            return X
    
    estimator = DummyEstimator()
    print(f"✓ Instance created successfully")
    print(f"  - Instance has __sklearn_tags__: {hasattr(estimator, '__sklearn_tags__')}")
    
    # Try to access via super simulation
    print(f"\nTesting attribute access patterns...")
    tags = getattr(estimator, '__sklearn_tags__', None)
    print(f"  - Direct getattr: {tags}")
    
except Exception as e:
    print(f"✗ Error creating instance: {e}")

print("\n" + "=" * 60)
print("Now attempting to load the model...")
print("=" * 60)

try:
    import joblib
    import os
    
    model_path = os.path.join(os.path.dirname(__file__), 'model', 'xgboost_flood_model.pkl')
    print(f"Model path: {model_path}")
    print(f"Model exists: {os.path.exists(model_path)}")
    
    if os.path.exists(model_path):
        print("\nLoading model...")
        model = joblib.load(model_path)
        print(f"✓ Model loaded: {type(model).__name__}")
        print(f"  - Has __sklearn_tags__: {hasattr(model, '__sklearn_tags__')}")
        print(f"  - Has predict_proba: {hasattr(model, 'predict_proba')}")
        
        # Check all steps if it's a pipeline
        if hasattr(model, 'steps'):
            print(f"\nPipeline steps:")
            for name, step in model.steps:
                if step is not None:
                    print(f"  - {name}: {type(step).__name__}")
                    print(f"    Has __sklearn_tags__: {hasattr(step, '__sklearn_tags__')}")
    else:
        print("✗ Model file not found")
        
except Exception as e:
    print(f"✗ Error loading model: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 60)
print("VERIFICATION COMPLETE")
print("=" * 60)
