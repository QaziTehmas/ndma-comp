import json
import os
import re

class ChatEngine:
    def __init__(self):
        self.data = []
        self.load_data()
        
    def load_data(self):
        try:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            json_path = os.path.join(base_dir, "../../frontend/public/data/flood-knowledge-base.json")
            json_path = os.path.normpath(json_path)
            
            if os.path.exists(json_path):
                with open(json_path, 'r', encoding='utf-8') as f:
                    raw_data = json.load(f)
                    
                self.data = []
                for page in raw_data:
                    content = page.get('content', '')
                    page_num = page.get('page', 0)
                    
                    # Filter: Remove TOC (1-6) and References (149+)
                    if page_num <= 6 or page_num >= 149: 
                        continue
                        
                    if content.count('http') > 5 or content.count('...') > 10:
                        continue
                        
                    self.data.append(page)
                    
                print(f"Loaded {len(self.data)} pages of flood data.")
            else:
                print(f"Warning: Knowledge base not found at {json_path}")
        except Exception as e:
            print(f"Error loading chat data: {e}")

    def clean_text(self, text):
        text = re.sub(r'http\S+', '', text)
        text = re.sub(r'\s+', ' ', text)
        text = re.sub(r'\.{3,}', '', text)
        return text.strip()

    def extract_context_chunks(self, content, keywords, max_length=200):
        """Extract contextual chunks around keywords"""
        content_lower = content.lower()
        chunks = []
        
        for keyword in keywords:
            keyword = keyword.lower()
            pos = 0
            while pos < len(content_lower):
                pos = content_lower.find(keyword, pos)
                if pos == -1:
                    break
                
                # Extract context: 100 chars before and 100 chars after
                start = max(0, pos - 100)
                end = min(len(content), pos + 100)
                chunk = content[start:end].strip()
                
                if len(chunk) > 20 and chunk not in [c[1] for c in chunks]:
                    score = sum(1 for k in keywords if k.lower() in chunk.lower())
                    chunks.append((score, chunk))
                
                pos += 1
        
        chunks.sort(key=lambda x: x[0], reverse=True)
        return [c[1] for c in chunks[:max_length]]

    def get_relevant_passages(self, query, top_k=5):
        query_lower = query.lower()
        
        # Location keywords
        locations = []
        location_map = {
            'lahore': ['lahore', 'lhr'],
            'karachi': ['karachi', 'khi'],
            'islamabad': ['islamabad', 'isl'],
            'sindh': ['sindh'],
            'punjab': ['punjab'],
            'balochistan': ['balochistan', 'baluchistan'],
            'kp': ['khyber pakhtunkhwa', ' kp ', 'kpk'],
            'peshawar': ['peshawar'],
            'quetta': ['quetta'],
            'gilgit': ['gilgit', 'baltistan', 'gb'],
            'kashmir': ['kashmir', 'ajk', 'azad jammu']
        }
        
        for loc, variations in location_map.items():
            if any(v in query_lower for v in variations):
                locations.append(loc)
        
        years = re.findall(r'\b(19|20)\d{2}\b', query)
        keywords = [k for k in query.split() if len(k) > 3]
        
        results = []
        for page in self.data:
            content = page.get('content', '')
            content_lower = content.lower()
            score = 0
            
            # Very high weight for locations
            for loc in locations:
                variations = location_map.get(loc, [loc])
                for var in variations:
                    if var in content_lower:
                        score += 100  # Increased from 50
            
            # High weight for years
            for year in years:
                if year in content:
                    score += 50  # Increased from 30
            
            # Keyword matching
            for k in keywords:
                count = content_lower.count(k)
                score += count * 3
            
            if score > 0:
                results.append((score, content, page.get('page', 0)))
        
        results.sort(key=lambda x: x[0], reverse=True)
        return [(r[1], r[2]) for r in results[:top_k]]

    def ask(self, query: str) -> str:
        if not self.data:
            return "Knowledge base not loaded."

        query_lower = query.lower()
        
        # Built-in responses for general questions
        if 'flash flood' in query_lower and ('different' in query_lower or 'difference' in query_lower or 'what is' in query_lower):
            return """## Flash Floods vs Regular Floods

**Flash Floods:**
- Occur within 6 hours of heavy rainfall
- Sudden with little to no warning
- Extremely high velocity, very destructive
- Common in mountains (KP, GB)

**Regular (Riverine) Floods:**
- Develop over days/weeks
- Caused by persistent rain or snowmelt
- Gradual rise with advance warning
- Affect plains (Punjab, Sindh)

*Pakistan faces both types regularly.*"""
        
        if 'flood warning' in query_lower or ('what' in query_lower and 'do' in query_lower and 'flood' in query_lower):
            return """## Emergency Response to Flood Warning:

1. **Evacuate** if advised by authorities
2. **Move to higher ground** immediately
3. **Never cross floodwater** (6 inches can knock you down, 2 feet sweeps vehicles)
4. **Disconnect utilities** if safe
5. **Take emergency kit** (water, food, meds, documents)
6. **Monitor** NDMA alerts (1166 helpline)
7. **Don't return** until cleared by authorities"""
        
        # Search fo relevant content
        passages = self.get_relevant_passages(query, top_k=8)  # Increased from 5
        
        if not passages:
            return "I couldn't find information on that topic. Try:\n- Specific years (2010, 2022)\n- Cities (Lahore, Karachi)\n- Provinces (Sindh, Punjab, KP)\n- General topics (damages, casualties, preparedness)"
        
        keywords = [k for k in query.split() if len(k) > 3]
        
        # Collect contextual chunks
        all_chunks = []
        source_pages = set()
        
        for content, page_num in passages:
            cleaned = self.clean_text(content)
            chunks = self.extract_context_chunks(cleaned, keywords, max_length=150)
            
            # Add chunks that aren't too generic
            for chunk in chunks:
                chunk_lower = chunk.lower()
                # Skip overly generic chunks
                if ('asian countries' not in chunk_lower or len(keywords) > 2):
                    if chunk not in [c[1] for c in all_chunks]:
                        score = sum(1 for k in keywords if k.lower() in chunk.lower())
                        all_chunks.append((score, chunk, page_num))
        
        if not all_chunks:
            # Fallback: just return relevant snippets
            response = "**Historical Flood Data:**\n\n"
            for content, page_num in passages[:2]:
                snippet = self.clean_text(content)[:300]
                response += f"• {snippet}...\n\n"
                source_pages.add(page_num)
            
            if source_pages:
                response += f"\n📄 *Pages {', '.join(map(str, sorted(source_pages)))}*"
            return response
        
        # Sort by score and deduplicate
        all_chunks.sort(key=lambda x: x[0], reverse=True)
        
        response = "**Historical Flood Records:**\n\n"
        
        seen = set()
        count = 0
        for score, chunk, page_num in all_chunks:
            chunk_key = chunk[:40]
            if chunk_key not in seen and count < 6:  # Show up to 6 chunks
                response += f"• {chunk}\n\n"
                seen.add(chunk_key)
                source_pages.add(page_num)
                count += 1
        
        if source_pages:
            pages_str = ', '.join(map(str, sorted(source_pages)[:6]))
            response += f"\n📄 *Source: Pages {pages_str}*"
        
        return response

    def get_location_summary(self, location: str) -> str:
        return self.ask(f"flood history damages risks {location}")

chat_engine = ChatEngine()
