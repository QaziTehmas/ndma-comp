import requests
from datetime import datetime, timedelta

def test_connection():
    # Test dates: Today and Yesterday
    dates_to_try = [datetime.now(), datetime.now() - timedelta(days=1), datetime.now() - timedelta(days=2)]
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }

    print("Testing connection to pakirsa.gov.pk...")
    
    for date_obj in dates_to_try:
        date_str = date_obj.strftime("%d-%m-%Y")
        url = f"http://pakirsa.gov.pk/Doc/Data{date_str}.pdf"
        print(f"\nChecking: {url}")
        
        try:
            response = requests.get(url, headers=headers, timeout=10)
            print(f"Status Code: {response.status_code}")
            if response.status_code == 200:
                print(f"SUCCESS! File size: {len(response.content)} bytes")
                # print partial content to see if it's actually HTML error page
                print(f"Content preview: {response.content[:50]}")
            else:
                print("Failed to download.")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    test_connection()
