# Quick Start Guide - Enhanced Flood Chatbot

## ⚡ 5-Minute Setup

### 1. Install Dependencies (Already Done ✅)
```bash
cd apps/backend/python
pip install google-generativeai python-dotenv
```

### 2. Verify Environment
```bash
# Check .env file has GEMINI_API_KEY
cat .env
```

### 3. Test Data Search (Works Without API Quota)
```bash
python test_data_search.py
```

### 4. Start Server
```bash
uvicorn main:app --reload
```

### 5. Test API
```bash
curl "http://localhost:8000/api/chat?query=What%20happened%20in%202010"
```

## 🎯 Example Queries

### Specific Statistics
```
"What were the damages in Punjab in 2010?"
"How many people were affected in Sindh in 2022?"
"What was the economic loss in 2010 floods?"
"Tell me casualties in KP"
```

### Provincial Summaries
```
"Tell me about flood history in Sindh"
"Which districts in Punjab are high risk?"
"What is the risk level of Balochistan?"
```

### Comparative Analysis
```
"Compare 2010 and 2022 floods"
"What's worse, 2010 or 2022?"
"How do Punjab and Sindh compare?"
```

### General Knowledge
```
"What is a flash flood?"
"Difference between flash floods and riverine floods?"
"How to prepare for floods?"
"What is GLOF?"
```

### Future Predictions
```
"What are 2025 monsoon predictions?"
"Which areas are vulnerable in 2025?"
```

## 📊 Understanding Responses

### Response Format
```
[GEMINI AI GENERATED RESPONSE]
- Natural language explanation
- Contextual analysis
- Exact figures cited

---
Sources: 📊 [events] | 🗺️ [province] | 📄 [pages]
```

### Source Icons
- 📊 = Historical events data
- 🗺️ = Provincial summary data
- 📄 = Knowledge base pages

## ⚠️ Troubleshooting

### "Quota exceeded"
**Solution:** Wait 24 hours or upgrade API plan  
**Note:** Data search still works, only AI response affected

### "Knowledge base not loaded"
**Solution:** Check file paths in `services/chat_engine.py`

### "Gemini API not initialized"
**Solution:** Verify `.env` has `GEMINI_API_KEY`

## 🔍 Quick Tests

### Test 1: Data Search
```bash
python test_data_search.py
```
Expected: ✅ All 4 tests pass

### Test 2: API Endpoint
```bash
curl "http://localhost:8000/api/chat?query=2022%20floods"
```
Expected: JSON response with flood data

### Test 3: Location Summary
```bash
curl "http://localhost:8000/api/history-risk?location=Punjab"
```
Expected: Punjab flood risk summary

## 📁 Key Files

```
services/
  chat_engine.py          ← Main chatbot logic (RAG)
  
data/
  ../../frontend/public/data/
    historical-floods.json     ← 15 major events (1950-2025)
    provincial-impacts.json    ← 6 provincial summaries
    flood-knowledge-base.json  ← 142 pages of reports
    flood-history.json         ← Major events timeline

tests/
  test_data_search.py     ← Data retrieval tests
  test_chatbot.py         ← Full AI tests
  
docs/
  CHATBOT_README.md       ← Full documentation
  IMPLEMENTATION_SUMMARY.md ← What was built
```

## 🚀 Integration Points

### Backend (main.py)
```python
# Already integrated!
@app.get("/api/chat")
def chat(query: str):
    response = chat_engine.ask(query)
    return {"response": response}
```

### Frontend Usage
```javascript
// Example: Call from React
const response = await fetch(
  `http://localhost:8000/api/chat?query=${encodeURIComponent(userQuery)}`
);
const data = await response.json();
console.log(data.response);
```

## 💡 Pro Tips

1. **Be Specific** - "Punjab 2010 casualties" > "Punjab floods"
2. **Use Years** - Include years for better matching
3. **Name Provinces** - Helps narrow search results
4. **Ask Follow-ups** - Build on conversation context

## 📞 Need Help?

1. Check console logs for detailed debug info
2. Run `test_data_search.py` to verify data loading
3. See `CHATBOT_README.md` for architecture details
4. Check `IMPLEMENTATION_SUMMARY.md` for what was built

## ✅ Checklist

- [x] Dependencies installed
- [x] Environment variables configured
- [x] Data files accessible
- [x] Gemini API initialized
- [x] Data search tested
- [x] API endpoints working
- [ ] Gemini quota available (wait 24h if exceeded)

---

**Status:** ✅ Ready to use (data search working, AI pending quota reset)  
**Version:** 2.0  
**Last Updated:** December 8, 2025
