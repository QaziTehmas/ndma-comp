"""
Check Gemini API limits and available models
"""
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

try:
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        print("❌ GEMINI_API_KEY not found in .env file")
        exit(1)
    
    genai.configure(api_key=api_key)
    
    print("=" * 80)
    print("GEMINI API STATUS CHECK")
    print("=" * 80)
    
    print(f"\n✅ API Key configured: {api_key[:10]}...{api_key[-4:]}")
    
    print("\n" + "=" * 80)
    print("AVAILABLE MODELS FOR CONTENT GENERATION:")
    print("=" * 80)
    
    models = [m for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
    
    for i, model in enumerate(models, 1):
        print(f"\n{i}. {model.name}")
        print(f"   Display Name: {model.display_name}")
        print(f"   Input Token Limit: {model.input_token_limit:,}")
        print(f"   Output Token Limit: {model.output_token_limit:,}")
        print(f"   Supported Methods: {', '.join(model.supported_generation_methods)}")
    
    print("\n" + "=" * 80)
    print("FREE TIER LIMITS (Default):")
    print("=" * 80)
    print("• Requests per Minute (RPM): 15")
    print("• Requests per Day (RPD): 1,500")
    print("• Tokens per Minute: 1,000,000")
    
    print("\n" + "=" * 80)
    print("TEST CONNECTION:")
    print("=" * 80)
    
    # Try a simple request to check if API is working
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content("Say 'API is working' in 3 words")
        print(f"✅ API Connection: SUCCESS")
        print(f"Test Response: {response.text}")
    except Exception as e:
        error_msg = str(e)
        if '429' in error_msg:
            print("⚠️  API Connection: QUOTA EXCEEDED")
            print("You've hit your rate limit. Wait 24 hours or upgrade.")
        elif '404' in error_msg:
            print("⚠️  Model not available or incorrect model name")
        else:
            print(f"❌ API Connection: FAILED")
            print(f"Error: {error_msg}")
    
    print("\n" + "=" * 80)
    print("CHECK DETAILED USAGE:")
    print("=" * 80)
    print("🔗 Visit: https://aistudio.google.com/apikey")
    print("🔗 Usage Monitor: https://ai.google.dev/gemini-api/docs/quota")
    
except Exception as e:
    print(f"❌ Error: {e}")
