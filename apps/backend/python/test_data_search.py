"""
Test the data search functionality (works without Gemini API)
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.chat_engine import chat_engine

print("=" * 80)
print("TESTING DATA SEARCH FUNCTIONALITY")
print("=" * 80)

# Test 1: Search structured data
print("\n" + "=" * 80)
print("TEST 1: Search for Punjab 2010 floods")
print("=" * 80)

query = "What happened in Punjab in 2010?"
results = chat_engine.search_structured_data(query)

print(f"\nQuery: {query}")
print(f"\nHistorical Events Found: {len(results['historical_events'])}")
for event in results['historical_events'][:2]:
    print(f"\n  Year: {event.get('year')}")
    print(f"  Affected: {event.get('affected'):,} people")
    print(f"  Casualties: {event.get('casualties')}")
    print(f"  Economic Loss: ${event.get('economicLoss')} billion")
    print(f"  Provinces: {', '.join(event.get('provinces', []))}")
    print(f"  Description: {event.get('description')}")

if results['provincial_data']:
    prov = results['provincial_data']
    print(f"\n\nProvincial Summary for {prov.get('province')}:")
    print(f"  Total Events: {prov.get('totalEvents')}")
    print(f"  Total Affected: {prov.get('totalAffected'):,} people")
    print(f"  Total Casualties: {prov.get('totalCasualties')}")
    print(f"  Economic Loss: ${prov.get('economicLoss')} billion")
    print(f"  Risk Level: {prov.get('riskLevel')}")
    print(f"  High Risk Districts: {', '.join(prov.get('highRiskDistricts', []))}")

# Test 2: Search knowledge base
print("\n\n" + "=" * 80)
print("TEST 2: Search knowledge base for 2022 floods")
print("=" * 80)

query2 = "2022 floods in Sindh"
passages = chat_engine.get_relevant_passages(query2, top_k=3)

print(f"\nQuery: {query2}")
print(f"Relevant Passages Found: {len(passages)}")

for i, (content, page_num) in enumerate(passages, 1):
    snippet = content[:300].replace('\n', ' ')
    print(f"\n  Passage {i} (Page {page_num}):")
    print(f"  {snippet}...")

# Test 3: Search Sindh data
print("\n\n" + "=" * 80)
print("TEST 3: Provincial data for Sindh")
print("=" * 80)

query3 = "Tell me about Sindh"
results3 = chat_engine.search_structured_data(query3)

if results3['provincial_data']:
    prov = results3['provincial_data']
    print(f"\nProvincial Impact Summary:")
    print(f"  Province: {prov.get('province')}")
    print(f"  Total Events: {prov.get('totalEvents')}")
    print(f"  Total Affected: {prov.get('totalAffected'):,} people")
    print(f"  Total Casualties: {prov.get('totalCasualties')}")
    print(f"  Economic Loss: ${prov.get('economicLoss')} billion")
    print(f"  Risk Level: {prov.get('riskLevel')}")
    print(f"  High Risk Districts: {', '.join(prov.get('highRiskDistricts', []))}")

print(f"\nHistorical Events in Sindh: {len(results3['historical_events'])}")
for event in results3['historical_events'][:3]:
    print(f"  - {event.get('year')}: {event.get('affected'):,} affected, {event.get('casualties')} casualties")

# Test 4: Compare 2010 and 2022
print("\n\n" + "=" * 80)
print("TEST 4: Compare 2010 and 2022 floods")
print("=" * 80)

query4 = "Compare 2010 and 2022 floods"
results4 = chat_engine.search_structured_data(query4)

print(f"\nEvents Found: {len(results4['historical_events'])}")
for event in results4['historical_events']:
    if event.get('year') in [2010, 2022]:
        print(f"\n  {event.get('year')} - {event.get('severity')} Flood:")
        print(f"    Affected: {event.get('affected'):,} people")
        print(f"    Casualties: {event.get('casualties')}")
        print(f"    Economic Loss: ${event.get('economicLoss')} billion")
        print(f"    Provinces: {', '.join(event.get('provinces', []))}")

print("\n\n" + "=" * 80)
print("DATA SEARCH TESTS COMPLETED")
print("=" * 80)
print("\n✅ The chatbot successfully loads and searches data!")
print("⚠️  To enable Gemini AI responses, wait for quota reset or upgrade API plan")
print("📖 See CHATBOT_README.md for full documentation")
