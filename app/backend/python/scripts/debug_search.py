import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.chat_engine import chat_engine
import re

query = "What happened in Punjab in 2010?"
query_lower = query.lower()

# Extract year and location
years = re.findall(r'\b(19|20)\d{2}\b', query)
year_ints = [int(y) for y in years] if years else []

print(f"Query: {query}")
print(f"Years found: {years}")
print(f"Year ints: {year_ints}")

location_map = {
    'punjab': ['punjab'],
    'sindh': ['sindh', 'karachi', 'hyderabad'],
    'kp': ['kp', 'khyber pakhtunkhwa', 'peshawar', 'kpk'],
    'balochistan': ['balochistan', 'baluchistan', 'quetta'],
    'gb': ['gilgit', 'baltistan', 'gb'],
    'ajk': ['kashmir', 'ajk', 'azad jammu']
}

matched_provinces = []
for province, variations in location_map.items():
    if any(v in query_lower for v in variations):
        matched_provinces.append(province)
        
print(f"Matched provinces: {matched_provinces}")

# Check actual data
print(f"\nTotal historical floods: {len(chat_engine.historical_floods)}")

for event in chat_engine.historical_floods[:3]:
    print(f"\nEvent year: {event.get('year')} (type: {type(event.get('year'))})")
    print(f"Provinces: {event.get('provinces')}")
    
    if year_ints:
        year_match = event.get('year') in year_ints
        print(f"Year match: {year_match} ({event.get('year')} in {year_ints})")
    
    event_provinces_lower = ' '.join([p.lower() for p in event.get('provinces', [])])
    print(f"Event provinces lower: '{event_provinces_lower}'")
    
    if matched_provinces:
        province_match = any(prov in event_provinces_lower for prov in matched_provinces)
        print(f"Province match: {province_match}")

# Now test actual search
print("\n" + "="*80)
print("TESTING ACTUAL SEARCH:")
results = chat_engine.search_structured_data(query)
print(f"Results: {len(results['historical_events'])} events found")
for event in results['historical_events']:
    print(f"  {event.get('year')}: {event.get('provinces')}")
