# Installing Dependencies

## Important: Scikit-learn Version Compatibility

Your model was trained with **scikit-learn 1.6.1**, so you need to use the same version to load it.

## Quick Fix (Recommended)

Use the automated fix script:

```bash
cd backend/python
python fix_sklearn_version.py
```

This script will:
- Check your current sklearn version
- Automatically install the correct version (1.6.1)
- Guide you through the process

## Manual Fix

If you prefer to do it manually:

```bash
cd backend/python
pip uninstall scikit-learn -y
pip install scikit-learn==1.6.1
```

## Full Installation

Install all dependencies from requirements.txt:

```bash
cd backend/python
pip install -r requirements.txt
```

This will install:
- scikit-learn==1.6.1 (matching your model's training version)
- xgboost==2.0.3
- pandas==2.0.3
- fastapi and other dependencies

## Verify Installation

After installing, verify the scikit-learn version:

```bash
python -c "import sklearn; print(sklearn.__version__)"
```

Should output: `1.6.1`

## Troubleshooting

If you still get version warnings:
1. Uninstall existing scikit-learn: `pip uninstall scikit-learn`
2. Install the correct version: `pip install scikit-learn==1.6.1`
3. Restart your backend server

## Note

The `_RemainderColsList` error occurs because this internal class changed between scikit-learn versions. Using the exact same version (1.6.1) ensures compatibility.

