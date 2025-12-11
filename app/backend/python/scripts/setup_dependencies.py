"""
Quick setup script to install the correct dependencies for the flood prediction model.
This ensures scikit-learn version matches the model's training version.
"""
import subprocess
import sys
import os

def check_python_version():
    """Check if Python version is adequate"""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required")
        return False
    print(f"✓ Python {sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}")
    return True

def install_dependencies():
    """Install dependencies from requirements.txt"""
    print("\n📦 Installing dependencies...")
    print("=" * 60)
    
    try:
        # Get the directory of this script
        script_dir = os.path.dirname(os.path.abspath(__file__))
        requirements_file = os.path.join(script_dir, 'requirements.txt')
        
        if not os.path.exists(requirements_file):
            print(f"❌ requirements.txt not found at {requirements_file}")
            return False
        
        # Install requirements
        result = subprocess.run(
            [sys.executable, '-m', 'pip', 'install', '-r', requirements_file],
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            print("✓ Dependencies installed successfully!")
            return True
        else:
            print(f"❌ Installation failed:")
            print(result.stderr)
            return False
            
    except Exception as e:
        print(f"❌ Error installing dependencies: {e}")
        return False

def verify_sklearn_version():
    """Verify scikit-learn version"""
    print("\n🔍 Verifying scikit-learn version...")
    try:
        import sklearn
        version = sklearn.__version__
        if version == "1.6.1":
            print(f"✓ scikit-learn {version} is installed (correct version)")
            return True
        else:
            print(f"⚠️  scikit-learn {version} is installed, but model requires 1.6.1")
            print("   Installing correct version...")
            result = subprocess.run(
                [sys.executable, '-m', 'pip', 'install', 'scikit-learn==1.6.1', '--upgrade'],
                capture_output=True,
                text=True
            )
            if result.returncode == 0:
                print("✓ scikit-learn 1.6.1 installed successfully!")
                return True
            else:
                print(f"❌ Failed to install scikit-learn 1.6.1")
                print(result.stderr)
                return False
    except ImportError:
        print("❌ scikit-learn is not installed")
        return False

def verify_xgboost():
    """Verify xgboost is installed"""
    try:
        import xgboost
        print(f"✓ xgboost {xgboost.__version__} is installed")
        return True
    except ImportError:
        print("❌ xgboost is not installed")
        return False

def main():
    print("🚀 Flood Prediction Model - Dependency Setup")
    print("=" * 60)
    
    if not check_python_version():
        sys.exit(1)
    
    # Install dependencies
    if not install_dependencies():
        print("\n❌ Failed to install dependencies. Please install manually:")
        print("   pip install -r requirements.txt")
        sys.exit(1)
    
    # Verify critical packages
    print("\n" + "=" * 60)
    print("Verifying critical packages...")
    print("=" * 60)
    
    sklearn_ok = verify_sklearn_version()
    xgb_ok = verify_xgboost()
    
    if sklearn_ok and xgb_ok:
        print("\n" + "=" * 60)
        print("✅ Setup complete! All dependencies are correctly installed.")
        print("=" * 60)
        print("\nYou can now start the backend server:")
        print("   python main.py")
        return 0
    else:
        print("\n⚠️  Some dependencies may need manual installation")
        print("   pip install scikit-learn==1.6.1 xgboost==2.0.3")
        return 1

if __name__ == "__main__":
    sys.exit(main())

