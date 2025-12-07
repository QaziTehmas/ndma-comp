"""
Script to fix scikit-learn version compatibility issues.
This will check and install the correct version (1.6.1) that matches your model.
"""
import subprocess
import sys
import os

def check_sklearn_version():
    """Check current sklearn version"""
    try:
        import sklearn
        return sklearn.__version__
    except ImportError:
        return None

def install_correct_version():
    """Install scikit-learn 1.6.1"""
    print("Installing scikit-learn==1.6.1...")
    result = subprocess.run(
        [sys.executable, '-m', 'pip', 'install', 'scikit-learn==1.6.1', '--upgrade', '--force-reinstall'],
        capture_output=True,
        text=True
    )
    
    if result.returncode == 0:
        print("✓ Successfully installed scikit-learn==1.6.1")
        return True
    else:
        print(f"❌ Failed to install scikit-learn==1.6.1")
        print(result.stderr)
        return False

def main():
    print("=" * 60)
    print("Scikit-learn Version Fixer")
    print("=" * 60)
    print()
    
    current_version = check_sklearn_version()
    
    if current_version is None:
        print("❌ scikit-learn is not installed")
        print("Installing scikit-learn==1.6.1...")
        if install_correct_version():
            print("\n✓ Setup complete! Please restart your backend server.")
            return 0
        else:
            return 1
    
    print(f"Current scikit-learn version: {current_version}")
    
    if current_version == "1.6.1":
        print("✓ You already have the correct version (1.6.1)")
        print("If you're still getting errors, try restarting your server.")
        return 0
    
    print(f"⚠️  You have version {current_version}, but the model requires 1.6.1")
    print()
    
    response = input("Do you want to install scikit-learn==1.6.1? (y/n): ").strip().lower()
    
    if response != 'y':
        print("Cancelled.")
        return 1
    
    # Uninstall current version first
    print("\nUninstalling current version...")
    subprocess.run(
        [sys.executable, '-m', 'pip', 'uninstall', 'scikit-learn', '-y'],
        capture_output=True
    )
    
    # Install correct version
    if install_correct_version():
        print("\n" + "=" * 60)
        print("✓ Installation complete!")
        print("=" * 60)
        print("\n⚠️  IMPORTANT: You must restart your backend server for changes to take effect.")
        print("   Stop the server (Ctrl+C) and run: python main.py")
        return 0
    else:
        return 1

if __name__ == "__main__":
    sys.exit(main())

