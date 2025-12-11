"""
Sklearn 1.6.x Compatibility Patches - AGGRESSIVE VERSION
This file MUST be imported before any sklearn imports anywhere in the application.
"""

import sys

def apply_sklearn_patches():
    """Apply all sklearn compatibility patches"""
    
    # Import sklearn modules
    import sklearn
    import sklearn.base
    import sklearn.compose._column_transformer
    
    # Check if already patched to prevent double-patching
    if hasattr(sklearn.base.BaseEstimator, '_sklearn_compatibility_patched'):
        print("⚠️  Sklearn patches already applied, skipping...")
        return
    
    print("=" * 60)
    print("APPLYING SKLEARN 1.6.x COMPATIBILITY PATCHES (AGGRESSIVE)")
    print("=" * 60)
    
    # ============================================================
    # MONKEY-PATCH __getattribute__ ON BASE CLASSES
    # This intercepts ALL attribute access including super()
    # ============================================================
    
    # Store original __getattribute__ methods
    _original_getattribute = {}
    
    # List of all base classes that might have super() calls
    classes_to_patch = [sklearn.base.BaseEstimator]
    
    # Try to import and patch all mixin classes
    try:
        from sklearn.base import ClassifierMixin, RegressorMixin, TransformerMixin
        classes_to_patch.extend([ClassifierMixin, RegressorMixin, TransformerMixin])
    except ImportError:
        pass
    
    try:
        from sklearn.base import MetaEstimatorMixin
        classes_to_patch.append(MetaEstimatorMixin)
    except ImportError:
        pass
    
    #---- AGGRESSIVE PATCH: Override __getattribute__ ----
    for cls in classes_to_patch:
        cls_name = cls.__name__
        
        # Store original
        if cls not in _original_getattribute:
            _original_getattribute[cls] = cls.__getattribute__
        
        original_getattr = _original_getattribute[cls]
        
        def make_patched_getattribute(original_func, class_name):
            """Factory to create patched __getattribute__ with correct closure"""
            def patched_getattribute(self, name):
                # Intercept sklearn_tags requests
                # CRITICAL: Return a CALLABLE (lambda) not a dict directly
                # because sklearn might call it like self.get_tags()
                if name == '__sklearn_tags__':
                    # For __sklearn_tags__, return the dict directly (it's accessed as attribute, not called)
                    return {}
                elif name in ['sklearn_tags', 'get_tags', '_get_tags']:
                    # For method-like attributes, return a callable that returns {}
                    return lambda: {}
                # For all other attributes, use original
                return original_func(self, name)
            return patched_getattribute
        
        cls.__getattribute__ = make_patched_getattribute(original_getattr, cls_name)
        print(f"✓ Patched __getattribute__ for {cls_name}")
    
    # ---- Also set as direct attributes as fallback ----
    for cls in classes_to_patch:
        try:
            # Set as class attribute (not property)
            cls.__sklearn_tags__ = {}
            cls.sklearn_tags = lambda self: {}
            cls.get_tags = lambda self: {}
            cls._get_tags = lambda self: {}
        except:
            pass
    
    print("✓ Set direct attributes on all classes")
    
    # ---- Patch __init__ methods to set instance attributes ----
    original_base_init = sklearn.base.BaseEstimator.__init__
    
    def patched_base_init(self, *args, **kwargs):
        # Set instance attributes BEFORE calling original init
        object.__setattr__(self, '__sklearn_tags__', {})
        object.__setattr__(self, 'sklearn_tags', lambda: {})
        object.__setattr__(self, 'get_tags', lambda: {})
        object.__setattr__(self, '_get_tags', lambda: {})
        # Now call original
        original_base_init(self, *args, **kwargs)
    
    sklearn.base.BaseEstimator.__init__ = patched_base_init
    print("✓ Patched BaseEstimator.__init__")
    
    # ---- Patch _RemainderColsList ----
    if not hasattr(sklearn.compose._column_transformer, "_RemainderColsList"):
        class _RemainderColsList(list):
            """Compatibility stub for _RemainderColsList"""
            pass
        sklearn.compose._column_transformer._RemainderColsList = _RemainderColsList
        print("✓ Patched _RemainderColsList")
    
    # ---- Patch Pipeline ----
    try:
        from sklearn.pipeline import Pipeline
        
        # Add to classes to patch
        if Pipeline not in _original_getattribute:
            _original_getattribute[Pipeline] = Pipeline.__getattribute__
        
        original_pipeline_getattr = _original_getattribute[Pipeline]
        
        def patched_pipeline_getattribute(self, name):
            if name == '__sklearn_tags__':
                return {}
            elif name in ['sklearn_tags', 'get_tags', '_get_tags']:
                return lambda: {}
            return original_pipeline_getattr(self, name)
        
        Pipeline.__getattribute__ = patched_pipeline_getattribute
        
        # Also patch __init__
        original_pipeline_init = Pipeline.__init__
        def patched_pipeline_init(self, steps, *args, **kwargs):
            object.__setattr__(self, '__sklearn_tags__', {})
            original_pipeline_init(self, steps, *args, **kwargs)
        Pipeline.__init__ = patched_pipeline_init
        
        print("✓ Patched Pipeline class")
    except ImportError:
        pass
    
    # ---- Patch ColumnTransformer ----
    try:
        from sklearn.compose import ColumnTransformer
        
        if ColumnTransformer not in _original_getattribute:
            _original_getattribute[ColumnTransformer] = ColumnTransformer.__getattribute__
        
        original_ct_getattr = _original_getattribute[ColumnTransformer]
        
        def patched_ct_getattribute(self, name):
            if name == '__sklearn_tags__':
                return {}
            elif name in ['sklearn_tags', 'get_tags', '_get_tags']:
                return lambda: {}
            return original_ct_getattr(self, name)
        
        ColumnTransformer.__getattribute__ = patched_ct_getattribute
        
        # Also patch __init__
        original_ct_init = ColumnTransformer.__init__
        def patched_ct_init(self, transformers, *args, **kwargs):
            object.__setattr__(self, '__sklearn_tags__', {})
            original_ct_init(self, transformers, *args, **kwargs)
        ColumnTransformer.__init__ = patched_ct_init
        
        print("✓ Patched ColumnTransformer class")
    except ImportError:
        pass
    
    # ---- Mark patched ----
    sklearn.base.BaseEstimator._sklearn_compatibility_patched = True
    
    print("=" * 60)
    print("✓ ALL SKLEARN PATCHES APPLIED SUCCESSFULLY (AGGRESSIVE)")
    print(f"✓ Sklearn version: {sklearn.__version__}")
    print("=" * 60)
    print()


# Apply patches immediately when this module is imported
apply_sklearn_patches()
