import json

with open('apps/frontend/public/data/historical-floods.json') as f:
    data = json.load(f)

print('Total events:', len(data))
print('\nFirst few events:')
for e in data[:5]:
    print(f"{e.get('year')}: {e.get('provinces')}")

print('\n2010 event exists:', any(e.get('year') == 2010 for e in data))
event_2010 = [e for e in data if e.get('year') == 2010]
if event_2010:
    print('\n2010 Event:')
    print(json.dumps(event_2010[0], indent=2))

event_2022 = [e for e in data if e.get('year') == 2022]
if event_2022:
    print('\n2022 Event:')
    print(json.dumps(event_2022[0], indent=2))
