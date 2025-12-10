"""
Test script for enhanced Gemini-powered chatbot
Tests various query types to ensure RAG approach works correctly
"""

import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.chat_engine import chat_engine

def test_chatbot():
    """Run comprehensive tests on the chatbot"""
    
    print("=" * 80)
    print("TESTING ENHANCED GEMINI CHATBOT WITH RAG APPROACH")
    print("=" * 80)
    
    test_queries = [
        {
            "category": "Specific Year + Location",
            "query": "What were the damages in Punjab in 2010?",
            "expected": "Should return specific statistics about 2010 Punjab floods"
        },
        {
            "category": "Provincial Summary",
            "query": "Tell me about flood history in Sindh",
            "expected": "Should provide provincial impact data for Sindh"
        },
        {
            "category": "Specific Year",
            "query": "What happened in the 2022 floods?",
            "expected": "Should return detailed info about 2022 mega floods"
        },
        {
            "category": "General Knowledge",
            "query": "What is a flash flood?",
            "expected": "Should use Gemini to explain flash floods"
        },
        {
            "category": "Comparative Query",
            "query": "What's the difference between flash floods and riverine floods?",
            "expected": "Should use Gemini to explain differences"
        },
        {
            "category": "Multiple Years",
            "query": "Compare floods in 2010 and 2022",
            "expected": "Should return data for both years"
        },
        {
            "category": "Risk Assessment",
            "query": "Which areas in Punjab are most vulnerable to flooding?",
            "expected": "Should cite high-risk districts from provincial data"
        },
        {
            "category": "Recent Event",
            "query": "Tell me about monsoon 2025 predictions",
            "expected": "Should find information from knowledge base"
        }
    ]
    
    for i, test in enumerate(test_queries, 1):
        print(f"\n{'=' * 80}")
        print(f"TEST {i}: {test['category']}")
        print(f"{'=' * 80}")
        print(f"Query: {test['query']}")
        print(f"Expected: {test['expected']}")
        print(f"\n{'-' * 80}")
        print("RESPONSE:")
        print(f"{'-' * 80}")
        
        try:
            response = chat_engine.ask(test['query'])
            print(response)
        except Exception as e:
            print(f"❌ ERROR: {str(e)}")
        
        print(f"\n{'=' * 80}\n")
        
        # Wait for user to review before next test
        input("Press Enter to continue to next test...")
    
    print("\n" + "=" * 80)
    print("ALL TESTS COMPLETED")
    print("=" * 80)

if __name__ == "__main__":
    test_chatbot()
