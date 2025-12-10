# Enhanced Chatbot with Gemini API - Setup & Usage Guide

## 🎯 Overview

The enhanced chatbot uses a **RAG (Retrieval-Augmented Generation)** approach that combines:
1. **Structured data search** - Finds exact figures from JSON files (casualties, damages, etc.)
2. **Knowledge base search** - Searches comprehensive PDF report content
3. **Gemini AI** - Interprets and contextualizes the data naturally

## 🏗️ Architecture

```
User Query
    ↓
Search Structured Data (JSON files)
    ├── historical-floods.json (1950-2025 events)
    ├── provincial-impacts.json (Provincial summaries)
    └── flood-history.json (Major events)
    ↓
Search Knowledge Base
    └── flood-knowledge-base.json (142 pages of detailed reports)
    ↓
Build Context (Combine all relevant data)
    ↓
Send to Gemini API
    ├── Data-driven prompt (if data found)
    └── General knowledge prompt (if no specific data)
    ↓
Gemini Response + Source Citations
    ↓
Return to User
```

## 📊 Data Sources

### 1. **historical-floods.json**
```json
{
  "year": 2010,
  "severity": "Mega",
  "affected": 20185000,
  "casualties": 1985,
  "economicLoss": 10.056,
  "provinces": ["Punjab", "Sindh", "KP", "Balochistan"],
  "description": "..."
}
```

### 2. **provincial-impacts.json**
```json
{
  "province": "Punjab",
  "totalEvents": 28,
  "totalAffected": 45000000,
  "totalCasualties": 4200,
  "economicLoss": 18.5,
  "highRiskDistricts": ["Lahore", "Gujranwala", ...]
}
```

### 3. **flood-knowledge-base.json**
- 142 pages of comprehensive flood report (1950-2025)
- Detailed narratives about each flood event
- Projections for 2025 monsoon season
- Global best practices

## 🔑 Key Features

### ✅ Handles Specific Data Queries
**Query:** "What were the damages in Punjab in 2010?"
- Searches historical data for 2010 + Punjab
- Finds exact figures: 20M affected, 1985 casualties, $10B loss
- Gemini contextualizes with narrative details

### ✅ Answers General Knowledge Questions
**Query:** "What is a flash flood?"
- No specific data needed
- Gemini provides expert explanation
- Contextualized to Pakistan's geography

### ✅ Provides Comprehensive Summaries
**Query:** "Tell me about flood history in Sindh"
- Aggregates all Sindh-related events
- Provincial summary: 32 events, 52M affected, $25B loss
- High-risk districts and risk level

### ✅ Comparative Analysis
**Query:** "Compare 2010 and 2022 floods"
- Retrieves data for both years
- Gemini analyzes differences and similarities

## 🚀 Usage Examples

### Example 1: Specific Year + Location
```python
response = chat_engine.ask("What happened in Punjab during 2010 floods?")
```
**Output:**
```
The 2010 floods in Punjab were catastrophic...

Statistics:
- Affected: 20,185,000 people
- Casualties: 1,985
- Economic Loss: $10.056 billion USD

[Detailed narrative from knowledge base]

---
Sources: 📊 1 historical events | 🗺️ Provincial data: Punjab | 📄 Report pages: 84, 87
```

### Example 2: General Question
```python
response = chat_engine.ask("What's the difference between flash floods and riverine floods?")
```
**Output:**
```
Flash floods and riverine floods differ primarily in their onset time...

[Gemini-generated expert explanation]
```

### Example 3: Risk Assessment
```python
response = chat_engine.ask("Which districts in Sindh are most at risk?")
```
**Output:**
```
Based on historical data, Sindh's high-risk districts are:
- Karachi
- Hyderabad
- Jacobabad
- Dadu

[Provincial risk analysis with statistics]

---
Sources: 🗺️ Provincial data: Sindh
```

## ⚠️ API Quota Management

### Current Issue: Quota Exceeded
You're seeing: `429 You exceeded your current quota`

### Solutions:

#### Option 1: Wait for Quota Reset (Recommended)
- Free tier resets daily
- Wait 24 hours and try again

#### Option 2: Use Different Model
Models have separate quotas. The code now tries:
1. `gemini-2.5-flash` (latest, best)
2. `gemini-2.0-flash` (fallback)

#### Option 3: Upgrade API Plan
- Visit: https://ai.google.dev/pricing
- Consider paid tier for production use

#### Option 4: Implement Rate Limiting
Add to `chat_engine.py`:
```python
import time
from functools import wraps

def rate_limit(seconds=2):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            time.sleep(seconds)
            return func(*args, **kwargs)
        return wrapper
    return decorator

@rate_limit(seconds=2)
def ask(self, query: str) -> str:
    # ... existing code
```

## 🧪 Testing

### Run Comprehensive Tests
```bash
cd apps/backend/python
python test_chatbot.py
```

### Quick Test
```bash
python -c "from services.chat_engine import chat_engine; print(chat_engine.ask('What is a flash flood?'))"
```

### Test with FastAPI
```bash
# Start server
uvicorn main:app --reload

# Test endpoint
curl "http://localhost:8000/api/chat?query=What%20happened%20in%202010%20floods"
```

## 🔧 Troubleshooting

### Issue: "Knowledge base not loaded"
**Solution:** Check file paths in `load_data()` method

### Issue: "Gemini API not initialized"
**Solution:** Verify `.env` file has `GEMINI_API_KEY`

### Issue: "429 Quota exceeded"
**Solution:** Wait 24 hours or upgrade API plan

### Issue: Import errors
**Solution:** 
```bash
pip install google-generativeai python-dotenv
```

## 📈 Future Enhancements

1. **Caching** - Store frequent queries to reduce API calls
2. **Embeddings** - Use vector search for better context retrieval
3. **Streaming** - Stream responses for better UX
4. **Multi-language** - Support Urdu queries
5. **Image Analysis** - Add flood map analysis

## 🎓 How It Works

### Traditional Approach (Old)
```
Query → Search Keywords → Return Raw Data → User interprets
```
**Problems:** 
- No context
- Hard to understand
- Limited to exact matches

### RAG Approach (New)
```
Query → Search Data → Build Context → Gemini AI → Natural Response
```
**Benefits:**
- Natural language responses
- Contextual understanding
- Handles both specific and general queries
- Accurate citations

## 📝 Code Structure

```
services/
  chat_engine.py          # Main chatbot logic
    ├── init_gemini()     # Initialize Gemini API
    ├── load_data()       # Load all JSON files
    ├── search_structured_data()  # Search JSON files
    ├── get_relevant_passages()   # Search knowledge base
    ├── build_context_from_data() # Combine data for Gemini
    └── ask()             # Main query handler
```

## 🌟 Best Practices

1. **Be Specific** - "Punjab 2010 casualties" > "Punjab floods"
2. **Use Years** - Include years for historical queries
3. **Name Provinces** - Helps narrow down search
4. **Ask Follow-ups** - Build on previous context

## 📞 Support

For issues or questions:
1. Check this README
2. Review `test_chatbot.py` for examples
3. Check console logs for error details

---
**Version:** 2.0 (Gemini-Enhanced RAG)  
**Last Updated:** December 8, 2025
