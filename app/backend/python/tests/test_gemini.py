import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if api_key:
    genai.configure(api_key=api_key)
    
    print("=== Testing gemini-2.0-flash-exp ===")
    try:
        model = genai.GenerativeModel('gemini-2.0-flash-exp')
        response = model.generate_content("What is a flash flood? Answer in 2 sentences.")
        print(f"✅ SUCCESS!")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")
