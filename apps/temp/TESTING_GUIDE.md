# 🚀 Quick Test & Launch Guide - FloodGuard AI

## When You Have API Quota Available

### Option 1: Quick Data Verification Test (Uses 3 API calls)
```powershell
cd E:\TechXonomy\flood\self\ndma-comp\apps\backend\python
python test_data_search.py
```
**Expected**: All 4 tests pass ✅

### Option 2: Single Query Test (Uses 1 API call)
```powershell
python test_chatbot.py
```
**Expected**: Natural response about 2010 Punjab floods

### Option 3: Launch Full Application

#### Terminal 1 - Backend Server
```powershell
cd E:\TechXonomy\flood\self\ndma-comp\apps\backend\python
python main.py
```
**Expected**: Server runs on http://localhost:8000

#### Terminal 2 - Frontend Dev Server
```powershell
cd E:\TechXonomy\flood\self\ndma-comp\apps\frontend
npm run dev
```
**Expected**: App runs on http://localhost:5173

### Browser Testing Checklist

Open http://localhost:5173 and test these queries:

#### Test 1: Specific Historical Data ✅
**Query**: "What happened in Punjab in 2010?"
**Expected**:
- Bold numbers: **20,185,000** affected, **1,985** casualties
- Mentions **mega** flood event
- Concise (< 500 chars)
- No disclaimers
- Natural tone

#### Test 2: General Knowledge ✅
**Query**: "What is a flash flood?"
**Expected**:
- Brief explanation (< 400 chars)
- Bold key terms: **flash flood**, **rapid**
- Contextualized to Pakistan
- Expert tone

#### Test 3: Comparative Analysis ✅
**Query**: "Compare 2010 and 2022 floods"
**Expected**:
- Mentions both years
- Comparison language (while, whereas, more/less)
- Key figures from both events
- Formatted with markdown

#### Test 4: Risk Assessment ✅
**Query**: "Which areas in Sindh are most at risk?"
**Expected**:
- Specific districts mentioned
- Actionable information
- No apologies
- Well formatted

### What to Look For

✅ **Response Quality**
- [ ] Concise (most < 500 chars)
- [ ] No "according to data" or "sorry"
- [ ] Natural, confident tone
- [ ] Exact figures when available

✅ **Formatting**
- [ ] **Bold** text renders correctly
- [ ] Proper line breaks
- [ ] Lists display well
- [ ] No raw markdown visible

✅ **UX**
- [ ] Feels intelligent, not robotic
- [ ] No visible sources footer
- [ ] Helpful, not apologetic
- [ ] Fast response time (< 3s)

### If You See Issues

#### Issue: "I encountered an issue..."
**Cause**: API quota exceeded or rate limit
**Fix**: Wait 1 minute between requests or use different API key

#### Issue: Response truncated mid-sentence
**Cause**: Safety blocking with fallback
**Fix**: Should now show formatted data instead of raw text

#### Issue: No bold text visible
**Cause**: Markdown not rendering
**Fix**: Check ReactMarkdown is imported in ChatBot.jsx

#### Issue: Response too long
**Cause**: max_output_tokens not working
**Fix**: Already set to 400, should be fine

### Competition Demo Script

1. **Open app** → Clean, professional FloodGuard AI branding ✨
2. **Click suggestion**: "2010 floods" → Fast, accurate response with exact figures 📊
3. **Ask follow-up**: "What about Sindh?" → Contextual, detailed answer 🎯
4. **General question**: "What is flash flood?" → Expert, concise explanation 🧠
5. **Complex query**: "Compare 2010 vs 2022" → Intelligent comparative analysis 📈

**Key Message**: "Our chatbot combines 75 years of historical data (1950-2025) with AI intelligence to provide accurate, natural responses about Pakistan's flood history."

### Quota Management Tips

**Free Tier Limits** (gemini-2.5-flash):
- 5 requests per minute (RPM)
- 20 requests per day (RPD)
- 250K tokens per minute (TPM)

**Best Practices**:
1. Add 1-second delay between test queries
2. Use `test_data_search.py` for data verification (no AI calls)
3. Save full `test_ux_quality.py` for final validation
4. Manual browser testing for demo preparation

**Upgrade if Needed**:
- Paid tier: $0.00025/request = $5 for 20,000 requests
- Worth it for competition prep and testing

### Success Criteria

Before competition submission:
- [ ] All 6 test scenarios passing (>80% each)
- [ ] Browser testing complete
- [ ] No console errors
- [ ] Fast response times (< 3s)
- [ ] Professional appearance
- [ ] Natural, intelligent responses

**You're ready to win! 🏆**
