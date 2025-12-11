"""
Comprehensive UX and Functionality Testing for FloodGuard AI Chatbot
Tests response quality, formatting, tone, accuracy, and user experience
"""

import sys
import os
import time

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.chat_engine import chat_engine

def print_test_header(test_num, category, query):
    """Print formatted test header"""
    print("\n" + "=" * 100)
    print(f"TEST {test_num}: {category}")
    print("=" * 100)
    print(f"📝 Query: \"{query}\"")
    print("-" * 100)

def evaluate_response(response, criteria):
    """Evaluate response against criteria"""
    print("\n" + "🔍 EVALUATION:")
    print("-" * 100)
    
    scores = {}
    for criterion, check_func in criteria.items():
        passed, feedback = check_func(response)
        scores[criterion] = passed
        status = "✅" if passed else "❌"
        print(f"{status} {criterion}: {feedback}")
    
    overall = sum(scores.values()) / len(scores) * 100
    print(f"\n📊 Overall Score: {overall:.0f}%")
    return overall

def test_response_quality():
    """Run comprehensive tests on chatbot responses"""
    
    print("=" * 100)
    print("🤖 FLOODGUARD AI - COMPREHENSIVE UX & FUNCTIONALITY TESTS")
    print("=" * 100)
    print("Testing: Response Quality, Formatting, Tone, Accuracy, User Experience")
    print("=" * 100)
    
    total_score = 0
    test_count = 0
    
    # TEST 1: Specific Historical Query
    test_count += 1
    print_test_header(test_count, "Specific Historical Data Query", "What happened in Punjab in 2010?")
    
    response1 = chat_engine.ask("What happened in Punjab in 2010?")
    print(f"\n💬 Response:\n{response1}\n")
    
    criteria1 = {
        "Concise (< 500 chars)": lambda r: (len(r) < 500, f"{len(r)} characters"),
        "Has exact figures": lambda r: (any(num in r for num in ["20,185,000", "1,985", "10.056", "20.1", "1985"]), 
                                       "Found" if any(num in r for num in ["20,185,000", "1,985", "10.056"]) else "Missing"),
        "No disclaimers": lambda r: (not any(phrase in r.lower() for phrase in ["according to", "the data shows", "sorry", "i don't have"]),
                                    "Clean" if not any(phrase in r.lower() for phrase in ["according to", "the data"]) else "Has disclaimers"),
        "Natural tone": lambda r: (not r.startswith("Based on") and not r.startswith("The data"),
                                  "Natural" if not r.startswith("Based on") else "Too formal"),
        "Has markdown formatting": lambda r: ("**" in r or "##" in r, "Yes" if "**" in r else "No bold text"),
    }
    
    score1 = evaluate_response(response1, criteria1)
    total_score += score1
    
    time.sleep(1)  # Rate limiting
    
    # TEST 2: General Knowledge Query
    test_count += 1
    print_test_header(test_count, "General Knowledge Query", "What is a flash flood?")
    
    response2 = chat_engine.ask("What is a flash flood?")
    print(f"\n💬 Response:\n{response2}\n")
    
    criteria2 = {
        "Brief (< 400 chars)": lambda r: (len(r) < 400, f"{len(r)} characters"),
        "No data disclaimers": lambda r: (not any(phrase in r.lower() for phrase in ["no data available", "cannot find", "database doesn't"]),
                                         "Clean" if "no data" not in r.lower() else "Has disclaimer"),
        "Expert tone": lambda r: (not r.startswith("I'm an") and "I am" not in r[:50],
                                 "Confident" if "I'm" not in r[:50] else "Too self-referential"),
        "Contextual to Pakistan": lambda r: (any(word in r.lower() for word in ["pakistan", "kp", "punjab", "monsoon"]),
                                             "Contextualized" if "pakistan" in r.lower() else "Generic"),
        "Has formatting": lambda r: ("**" in r, "Yes" if "**" in r else "No"),
    }
    
    score2 = evaluate_response(response2, criteria2)
    total_score += score2
    
    time.sleep(1)
    
    # TEST 3: Comparative Query
    test_count += 1
    print_test_header(test_count, "Comparative Analysis", "Compare 2010 and 2022 floods")
    
    response3 = chat_engine.ask("Compare 2010 and 2022 floods")
    print(f"\n💬 Response:\n{response3}\n")
    
    criteria3 = {
        "Mentions both years": lambda r: ("2010" in r and "2022" in r, 
                                          "Both found" if "2010" in r and "2022" in r else "Missing year(s)"),
        "Has comparison": lambda r: (any(word in r.lower() for word in ["while", "whereas", "compared", "more", "less", "greater"]),
                                    "Comparative language found" if "while" in r.lower() or "more" in r.lower() else "Missing comparison"),
        "Concise (< 600 chars)": lambda r: (len(r) < 600, f"{len(r)} characters"),
        "No source citations": lambda r: ("---" not in r and "Sources:" not in r and "📊" not in r,
                                          "Clean" if "Sources:" not in r else "Has visible sources"),
        "Bold key numbers": lambda r: ("**" in r, "Formatted" if "**" in r else "Plain text"),
    }
    
    score3 = evaluate_response(response3, criteria3)
    total_score += score3
    
    time.sleep(1)
    
    # TEST 4: Risk Assessment Query
    test_count += 1
    print_test_header(test_count, "Risk Assessment Query", "Which areas in Sindh are most at risk?")
    
    response4 = chat_engine.ask("Which areas in Sindh are most at risk?")
    print(f"\n💬 Response:\n{response4}\n")
    
    criteria4 = {
        "Lists specific districts": lambda r: (any(city in r for city in ["Karachi", "Hyderabad", "Jacobabad", "Dadu"]),
                                               "Districts mentioned" if "Karachi" in r else "Generic answer"),
        "Actionable information": lambda r: (len(r) > 100, "Detailed" if len(r) > 100 else "Too brief"),
        "No apologies": lambda r: ("sorry" not in r.lower() and "unfortunately" not in r.lower(),
                                  "Confident" if "sorry" not in r.lower() else "Apologetic"),
        "Proper formatting": lambda r: ("**" in r or "•" in r or "-" in r, "Well formatted" if "**" in r else "Plain text"),
    }
    
    score4 = evaluate_response(response4, criteria4)
    total_score += score4
    
    time.sleep(1)
    
    # TEST 5: Edge Case - Vague Query
    test_count += 1
    print_test_header(test_count, "Edge Case - Vague Query", "Tell me about floods")
    
    response5 = chat_engine.ask("Tell me about floods")
    print(f"\n💬 Response:\n{response5}\n")
    
    criteria5 = {
        "Handles gracefully": lambda r: (len(r) > 50, "Responded" if len(r) > 50 else "Too brief"),
        "No confusion": lambda r: (not any(phrase in r.lower() for phrase in ["don't understand", "unclear", "can you clarify"]),
                                  "Clear" if "unclear" not in r.lower() else "Confused"),
        "Helpful": lambda r: (any(word in r.lower() for word in ["pakistan", "types", "history", "can ask"]),
                             "Helpful guidance" if "can ask" in r.lower() or "pakistan" in r.lower() else "Generic"),
    }
    
    score5 = evaluate_response(response5, criteria5)
    total_score += score5
    
    time.sleep(1)
    
    # TEST 6: Recent Projections
    test_count += 1
    print_test_header(test_count, "Future Projections Query", "What are the 2025 monsoon predictions?")
    
    response6 = chat_engine.ask("What are the 2025 monsoon predictions?")
    print(f"\n💬 Response:\n{response6}\n")
    
    criteria6 = {
        "Mentions 2025": lambda r: ("2025" in r, "Found" if "2025" in r else "Missing"),
        "Has predictions": lambda r: (any(word in r.lower() for word in ["expect", "forecast", "predict", "monsoon", "rainfall"]),
                                     "Predictive language" if "expect" in r.lower() or "monsoon" in r.lower() else "Generic"),
        "No false certainty": lambda r: (not r.lower().startswith("there will"), 
                                         "Appropriate tone" if not r.lower().startswith("there will") else "Too certain"),
        "Concise": lambda r: (len(r) < 500, f"{len(r)} characters"),
    }
    
    score6 = evaluate_response(response6, criteria6)
    total_score += score6
    
    # FINAL RESULTS
    print("\n" + "=" * 100)
    print("📊 FINAL RESULTS")
    print("=" * 100)
    
    avg_score = total_score / test_count
    
    print(f"\nTests Completed: {test_count}")
    print(f"Average Score: {avg_score:.1f}%")
    
    if avg_score >= 90:
        print("\n🏆 EXCELLENT! Competition-ready quality!")
    elif avg_score >= 75:
        print("\n✅ GOOD! Minor improvements needed.")
    elif avg_score >= 60:
        print("\n⚠️  ACCEPTABLE. Needs refinement.")
    else:
        print("\n❌ NEEDS WORK. Major improvements required.")
    
    print("\n" + "=" * 100)
    
    return avg_score

if __name__ == "__main__":
    print("\n⏳ Starting comprehensive tests...")
    print("This will take about 30-60 seconds...\n")
    
    try:
        final_score = test_response_quality()
        
        print("\n✅ Testing complete!")
        print(f"📈 Final Quality Score: {final_score:.1f}%")
        
    except Exception as e:
        print(f"\n❌ Testing failed: {e}")
        print("Make sure:")
        print("1. Backend server is running")
        print("2. Gemini API quota is available")
        print("3. Data files are loaded correctly")
