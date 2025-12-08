import json
import os
import re
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

class ChatEngine:
    def __init__(self):
        self.knowledge_base = []
        self.historical_floods = []
        self.provincial_impacts = []
        self.flood_history = []
        self.gemini_model = None
        self.api_call_count = 0  # Track API usage
        
        # Initialize Gemini
        self.init_gemini()
        
        # Load all data sources
        self.load_data()
        
    def init_gemini(self):
        """Initialize Gemini API"""
        try:
            api_key = os.getenv("GEMINI_API_KEY")
            if api_key:
                genai.configure(api_key=api_key)
                # Try gemini-2.5-flash (latest stable model with good quotas)
                # Configure safety settings to be less restrictive for flood disaster data
                safety_settings = [
                    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
                    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
                    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
                    {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"}
                ]
                
                generation_config = {
                    "temperature": 0.7,
                    "top_p": 0.95,
                    "top_k": 40,
                    "max_output_tokens": 800,
                }
                
                # Falls back to gemini-2.0-flash if quota issues persist
                try:
                    self.gemini_model = genai.GenerativeModel(
                        'gemini-2.5-flash',
                        generation_config=generation_config,
                        safety_settings=safety_settings
                    )
                    print("✅ Gemini API initialized successfully (gemini-2.5-flash)")
                except:
                    self.gemini_model = genai.GenerativeModel(
                        'gemini-2.0-flash',
                        generation_config=generation_config,
                        safety_settings=safety_settings
                    )
                    print("✅ Gemini API initialized successfully (gemini-2.0-flash)")
            else:
                print("⚠️ Warning: GEMINI_API_KEY not found in environment")
        except Exception as e:
            print(f"❌ Error initializing Gemini: {e}")
        
    def load_data(self):
        """Load all flood-related data sources"""
        try:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            data_dir = os.path.join(base_dir, "../../frontend/public/data")
            data_dir = os.path.normpath(data_dir)
            
            # Load knowledge base (comprehensive report)
            kb_path = os.path.join(data_dir, "flood-knowledge-base.json")
            if os.path.exists(kb_path):
                with open(kb_path, 'r', encoding='utf-8') as f:
                    raw_data = json.load(f)
                    
                self.knowledge_base = []
                for page in raw_data:
                    content = page.get('content', '')
                    page_num = page.get('page', 0)
                    
                    # Filter: Remove TOC (1-6) and References (149+)
                    if page_num <= 6 or page_num >= 149: 
                        continue
                        
                    if content.count('http') > 5 or content.count('...') > 10:
                        continue
                        
                    self.knowledge_base.append(page)
                    
                print(f"✅ Loaded {len(self.knowledge_base)} pages from knowledge base")
            else:
                print(f"⚠️ Knowledge base not found at {kb_path}")
            
            # Load historical floods data
            hist_path = os.path.join(data_dir, "historical-floods.json")
            if os.path.exists(hist_path):
                with open(hist_path, 'r', encoding='utf-8') as f:
                    self.historical_floods = json.load(f)
                print(f"✅ Loaded {len(self.historical_floods)} historical flood events")
            
            # Load provincial impacts
            prov_path = os.path.join(data_dir, "provincial-impacts.json")
            if os.path.exists(prov_path):
                with open(prov_path, 'r', encoding='utf-8') as f:
                    self.provincial_impacts = json.load(f)
                print(f"✅ Loaded provincial impacts data")
            
            # Load flood history
            fh_path = os.path.join(data_dir, "flood-history.json")
            if os.path.exists(fh_path):
                with open(fh_path, 'r', encoding='utf-8') as f:
                    self.flood_history = json.load(f)
                print(f"✅ Loaded flood history data")
                
        except Exception as e:
            print(f"❌ Error loading data: {e}")

    def search_structured_data(self, query):
        """Search structured JSON data for specific flood information"""
        query_lower = query.lower()
        results = {
            'historical_events': [],
            'provincial_data': None,
            'major_events': []
        }
        
        # Extract year and location from query - Fixed regex to capture full year
        years = re.findall(r'\b((?:19|20)\d{2})\b', query)
        year_ints = [int(y) for y in years] if years else []
        
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
        
        # Search historical floods
        for event in self.historical_floods:
            # Year matching - check if no years specified OR year matches
            if year_ints:
                year_match = event.get('year') in year_ints
            else:
                year_match = True
            
            # Province matching
            if matched_provinces:
                event_provinces_lower = ' '.join([p.lower() for p in event.get('provinces', [])])
                # Match if any of the matched provinces appear in the event
                province_match = any(prov in event_provinces_lower for prov in matched_provinces)
            else:
                province_match = True
            
            if year_match and province_match:
                results['historical_events'].append(event)
        
        # Get provincial impact data
        if matched_provinces:
            for prov_data in self.provincial_impacts:
                if prov_data.get('province', '').lower() in matched_provinces:
                    results['provincial_data'] = prov_data
                    break
        
        # Search major events from flood history
        if isinstance(self.flood_history, dict):
            major_events = self.flood_history.get('major_events', [])
            for event in major_events:
                # Year matching
                if year_ints:
                    year_match = event.get('year') in year_ints
                else:
                    year_match = True
                
                # Region matching
                if matched_provinces:
                    region_match = any(p in event.get('region', '').lower() for p in matched_provinces)
                else:
                    region_match = True
                
                if year_match and region_match:
                    results['major_events'].append(event)
        
        return results

    def get_relevant_passages(self, query, top_k=5):
        """Search knowledge base for relevant passages"""
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
        for page in self.knowledge_base:
            content = page.get('content', '')
            content_lower = content.lower()
            score = 0
            
            # Very high weight for locations
            for loc in locations:
                variations = location_map.get(loc, [loc])
                for var in variations:
                    if var in content_lower:
                        score += 100
            
            # High weight for years
            for year in years:
                if year in content:
                    score += 50
            
            # Keyword matching
            for k in keywords:
                count = content_lower.count(k)
                score += count * 3
            
            if score > 0:
                results.append((score, content, page.get('page', 0)))
        
        results.sort(key=lambda x: x[0], reverse=True)
        return [(r[1], r[2]) for r in results[:top_k]]

    def build_context_from_data(self, query, structured_data, passages):
        """Build comprehensive context for Gemini from all data sources"""
        context_parts = []
        
        # Add structured data (historical floods with specific numbers)
        if structured_data['historical_events']:
            context_parts.append("=== HISTORICAL FLOOD EVENTS DATA ===")
            for event in structured_data['historical_events'][:5]:  # Top 5 relevant events
                context_parts.append(
                    f"Year: {event.get('year')}\n"
                    f"Severity: {event.get('severity')}\n"
                    f"Affected: {event.get('affected'):,} people\n"
                    f"Casualties: {event.get('casualties')}\n"
                    f"Economic Loss: ${event.get('economicLoss')} billion USD\n"
                    f"Provinces: {', '.join(event.get('provinces', []))}\n"
                    f"Description: {event.get('description')}\n"
                )
        
        # Add provincial summary data
        if structured_data['provincial_data']:
            prov = structured_data['provincial_data']
            context_parts.append("\n=== PROVINCIAL IMPACT SUMMARY ===")
            context_parts.append(
                f"Province: {prov.get('province')}\n"
                f"Total Events: {prov.get('totalEvents')}\n"
                f"Total Affected: {prov.get('totalAffected'):,} people\n"
                f"Total Casualties: {prov.get('totalCasualties')}\n"
                f"Economic Loss: ${prov.get('economicLoss')} billion USD\n"
                f"Risk Level: {prov.get('riskLevel')}\n"
                f"High Risk Districts: {', '.join(prov.get('highRiskDistricts', []))}\n"
            )
        
        # Add major events from flood history
        if structured_data['major_events']:
            context_parts.append("\n=== MAJOR FLOOD EVENTS ===")
            for event in structured_data['major_events'][:3]:
                context_parts.append(
                    f"Year: {event.get('year')} ({event.get('month', 'N/A')})\n"
                    f"Deaths: {event.get('deaths')}\n"
                    f"Affected: {event.get('affected'):,} people\n"
                    f"Region: {event.get('region')}\n"
                    f"Type: {event.get('type')}\n"
                    f"Description: {event.get('description')}\n"
                )
        
        # Add passages from knowledge base (detailed narrative)
        if passages:
            context_parts.append("\n=== DETAILED REPORT EXCERPTS ===")
            for content, page_num in passages[:3]:  # Top 3 passages
                # Clean and truncate
                cleaned = re.sub(r'http\S+', '', content)
                cleaned = re.sub(r'\s+', ' ', cleaned).strip()
                if len(cleaned) > 1000:
                    cleaned = cleaned[:1000] + "..."
                context_parts.append(f"[Page {page_num}]: {cleaned}\n")
        
        return "\n".join(context_parts)

    def ask(self, query: str) -> str:
        """Main chatbot interface - uses Gemini with RAG approach"""
        if not self.gemini_model:
            return "I'm currently unavailable. Please try again in a moment."
        
        try:
            query_lower = query.lower()
            
            # Step 0: Validate topic - only respond to flood-related questions
            flood_keywords = ['flood', 'flooding', 'water', 'disaster', 'rain', 'monsoon', 'dam', 'river', 
                            'punjab', 'sindh', 'balochistan', 'kp', 'pakistan', 'indus', 'ravi', 'chenab',
                            'weather', 'climate', 'damage', 'casualt', 'evacuate', 'relief', 'emergency',
                            'risk', 'history', 'impact', '2010', '2022', '1950', '2020', 'lahore', 'karachi']
            
            # Detect absurd/irrelevant questions (common patterns)
            absurd_patterns = ['pee', 'piss', 'urinate', 'toilet', 'bathroom', 'joke', 'funny']
            is_absurd = any(pattern in query_lower for pattern in absurd_patterns)
            
            is_flood_related = any(keyword in query_lower for keyword in flood_keywords)
            
            # If absurd question, be firm but polite
            if is_absurd:
                return """I'm **FloodGuard AI**, a serious flood analysis system trained on 75 years of Pakistan's flood data (1950-2025).

I provide accurate, data-driven insights on:
• Historical flood events and damages
• Risk assessments for regions
• Safety and preparedness measures

Please ask meaningful questions about floods and disasters in Pakistan."""
            
            # If not flood-related at all, politely redirect
            if not is_flood_related:
                return """I'm **FloodGuard AI**, specialized in Pakistan's flood history and disaster management (1950-2025). 

I can help you with:
• Historical flood events and statistics
• Regional flood risks and impacts
• Flood safety and preparedness
• Climate and weather patterns

Please ask me about floods, disasters, or related topics in Pakistan."""
            
            # Step 1: Search structured data (for specific facts and figures)
            structured_data = self.search_structured_data(query)
            
            # Step 2: Search knowledge base (for detailed narratives)
            passages = self.get_relevant_passages(query, top_k=3)
            
            # Step 3: Build comprehensive context
            context = self.build_context_from_data(query, structured_data, passages)
            
            # Step 4: Determine if we have relevant data
            has_specific_data = (
                structured_data['historical_events'] or 
                structured_data['provincial_data'] or 
                structured_data['major_events'] or 
                passages
            )
            
            # Step 5: Create prompt for Gemini
            if has_specific_data:
                # Data-driven query - provide context
                prompt = f"""You are FloodGuard AI, an expert flood analyst trained on Pakistan's comprehensive flood history from 1950 to 2025.

User Question: {query}

HISTORICAL DATA AVAILABLE:
{context}

CRITICAL INSTRUCTIONS:
1. Keep response CONCISE - maximum 4-6 sentences or 3-4 bullet points
2. ALWAYS complete every sentence - NEVER end mid-sentence or mid-number
3. Respond naturally as an expert - NEVER mention "the data shows" or "according to the report"
4. Use exact figures from data with **bold** formatting
5. If specific year NOT in data: "I don't have detailed records for [year]"
6. NEVER mention other countries unless directly relevant
7. Use markdown: **bold** for numbers, bullet points for lists
8. Be direct - no disclaimers or apologies
9. PRIORITY: Finish every sentence completely before stopping

Provide a COMPLETE response with all sentences fully finished."""
            else:
                # General knowledge query - no specific data found
                prompt = f"""You are FloodGuard AI, an expert flood disaster analyst specializing in Pakistan's flood context (1950-2025).

User Question: {query}

INSTRUCTIONS:
1. Keep response BRIEF - maximum 3-4 complete sentences
2. ALWAYS finish every sentence - NEVER end mid-sentence
3. For missing years: "I don't have detailed records for [year]"
4. Use markdown: **bold** for key terms
5. NEVER mention other countries unless relevant
6. No disclaimers - be direct and helpful
7. PRIORITY: Complete all sentences before stopping

Provide a BRIEF, COMPLETE response with all sentences fully finished."""
            
            # Step 6: Get response from Gemini with generation config
            generation_config = {
                'temperature': 0.6,  # Lower for more focused responses
                'top_p': 0.95,  # Higher for more complete responses
                'top_k': 40,
                'max_output_tokens': 1500,  # Sufficient for concise, complete answers
            }
            
            response = self.gemini_model.generate_content(
                prompt,
                generation_config=generation_config
            )
            
            # Track API usage
            self.api_call_count += 1
            print(f"📊 API Calls this session: {self.api_call_count}")
            
            # Check response status
            if not response.parts:
                print(f"⚠️ No response parts - response might be blocked or incomplete")
                # Handle blocked responses gracefully WITHOUT retry (saves API quota)
                if hasattr(response, 'prompt_feedback') and response.prompt_feedback.block_reason:
                    print(f"⚠️ Response blocked: {response.prompt_feedback.block_reason}")
                
                # Instead of retry, use fallback formatting (no extra API call)
                if context:
                    # Format context data as markdown - be query-aware
                    import re
                    
                    # Extract query intent (years, provinces mentioned)
                    query_lower = query.lower()
                    query_years = re.findall(r'\b((?:19|20)\d{2})\b', query)
                    
                    # Find all events in context
                    context_sections = context.split('===')
                    
                    # Try to find the most relevant section based on query
                    relevant_section = None
                    if query_years:
                        # User asked about specific year - find that year's data
                        target_year = query_years[0]
                        for section in context_sections:
                            if f"Year: {target_year}" in section:
                                relevant_section = section
                                break
                    elif any(province in query_lower for province in ['punjab', 'sindh', 'kpk', 'balochistan', 'gilgit', 'ajk']):
                        # User asked about specific province
                        for section in context_sections:
                            if 'Province:' in section:
                                province_in_section = section.lower()
                                if any(p in province_in_section for p in ['punjab', 'sindh', 'kpk', 'balochistan', 'gilgit', 'ajk'] if p in query_lower):
                                    relevant_section = section
                                    break
                    
                    # Use first section if no specific match found
                    if not relevant_section and context_sections:
                        relevant_section = context_sections[0]
                    
                    if relevant_section:
                        # Format the relevant section
                        year_match = re.search(r'Year: (\d{4})', relevant_section)
                        severity_match = re.search(r'Severity: (\w+)', relevant_section)
                        affected_match = re.search(r'Affected: ([\d,]+)', relevant_section)
                        casualties_match = re.search(r'Casualties: ([\d,]+)', relevant_section)
                        
                        if year_match and affected_match:
                            response_text = f"In **{year_match.group(1)}**, Pakistan experienced "
                            
                            if severity_match:
                                severity = severity_match.group(1).lower()
                                response_text += f"a **{severity}** flood event that "
                            else:
                                response_text += f"severe flooding that "
                            
                            response_text += f"affected **{affected_match.group(1)}** people"
                            
                            if casualties_match:
                                response_text += f", resulting in **{casualties_match.group(1)}** casualties"
                            
                            response_text += ". This was one of the most devastating flood events in the region's history."
                            return response_text
                        
                        # Format provincial data
                        elif 'Province:' in relevant_section:
                            lines = [l.strip() for l in relevant_section.split('\n') if l.strip() and not l.startswith('===')]
                            if len(lines) >= 3:
                                return f"**{lines[0]}**\n\n{lines[1]}\n{lines[2]}"
                        
                        # Generic context formatting
                        lines = relevant_section.split('\n')
                        summary_lines = [line.strip() for line in lines if line.strip() and not line.startswith('===') and not line.startswith('---')][:5]
                        return '\n'.join(summary_lines)
                else:
                    return "I'm currently processing flood-related information. Could you try rephrasing your question?"
            
            # Get the response text
            response_text = response.text.strip()
            
            # Check finish reason and handle incomplete responses
            finish_reason_str = "UNKNOWN"
            if hasattr(response, 'candidates') and len(response.candidates) > 0:
                candidate = response.candidates[0]
                if hasattr(candidate, 'finish_reason'):
                    finish_reason_str = str(candidate.finish_reason)
                    print(f"🔍 Finish reason: {finish_reason_str}")
                    
                    # If response was cut off due to token limit
                    if 'MAX_TOKENS' in finish_reason_str or 'LENGTH' in finish_reason_str:
                        print(f"⚠️ Response truncated due to token limit")
            
            # Post-process incomplete responses
            if response_text:
                # Check if ends mid-sentence
                if not response_text[-1] in '.!?':
                    print(f"⚠️ Response incomplete (doesn't end with punctuation)")
                    print(f"📏 Response length: {len(response_text)} chars")
                    
                    # If it ends with an incomplete number or dollar sign
                    import re
                    if re.search(r'\$\s*\d*$', response_text):
                        # Find the last complete sentence
                        sentences = re.split(r'([.!?])\s+', response_text)
                        if len(sentences) > 2:
                            # Reconstruct up to last complete sentence
                            complete_part = []
                            for i in range(0, len(sentences)-2, 2):
                                if i+1 < len(sentences):
                                    complete_part.append(sentences[i] + sentences[i+1])
                            if complete_part:
                                response_text = ' '.join(complete_part)
                                print(f"✂️ Truncated to last complete sentence")
            
            return response_text
            
        except Exception as e:
            print(f"Error in ask(): {e}")
            # Friendly error message
            return "I encountered an issue processing your question. Could you try rephrasing it?"

    def get_location_summary(self, location: str) -> str:
        """Get comprehensive flood risk summary for a location"""
        return self.ask(f"What is the flood history, damages, casualties, and risk level for {location} in Pakistan?")

# Initialize chat engine instance
chat_engine = ChatEngine()
