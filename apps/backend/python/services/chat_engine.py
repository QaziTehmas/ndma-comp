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
        
        # Load all API keys from environment
        self.api_keys = []
        for i in range(1, 5):  # Support 4 API keys
            if i == 1:
                key = os.getenv("GEMINI_API_KEY")
            else:
                key = os.getenv(f"GEMINI_API_KEY_{i}")
            if key:
                self.api_keys.append(key)
        
        self.current_key_index = 0  # Track which API key we're using
        
        # Initialize Gemini with first available key
        if self.api_keys:
            self.init_gemini(self.api_keys[0])
        else:
            print("⚠️ Warning: No GEMINI_API_KEY found in environment")
        
        # Load all data sources
        self.load_data()
    
    def init_gemini(self, api_key=None):
        """Initialize Gemini API with a specific API key"""
        if api_key is None:
            if self.api_keys:
                api_key = self.api_keys[self.current_key_index]
            else:
                print("⚠️ Warning: No API key available")
                return
        
        try:
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
                print(f"✅ Gemini API initialized successfully (gemini-2.5-flash) - Key {self.current_key_index + 1}/{len(self.api_keys)}")
            except:
                self.gemini_model = genai.GenerativeModel(
                    'gemini-2.0-flash',
                    generation_config=generation_config,
                    safety_settings=safety_settings
                )
                print(f"✅ Gemini API initialized successfully (gemini-2.0-flash) - Key {self.current_key_index + 1}/{len(self.api_keys)}")
        except Exception as e:
            print(f"❌ Error initializing Gemini: {e}")
    
    def switch_to_next_api_key(self):
        """Switch to the next available API key"""
        if len(self.api_keys) <= 1:
            print("⚠️ Only one API key available, cannot switch")
            return False
        
        self.current_key_index = (self.current_key_index + 1) % len(self.api_keys)
        print(f"🔄 Switching to API key {self.current_key_index + 1}/{len(self.api_keys)}")
        self.init_gemini(self.api_keys[self.current_key_index])
        return True

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
        
        # Try with current API key, and retry with other keys if quota exceeded
        max_retries = len(self.api_keys) if self.api_keys else 1
        last_error = None
        
        for attempt in range(max_retries):
            try:
                query_lower = query.lower()
                
                # Step 0: Validate topic - only filter out clearly absurd/irrelevant questions
                # Allow general questions and let Gemini use its knowledge to answer appropriately
                
                # Detect absurd/irrelevant questions (common patterns) - only block these
                absurd_patterns = ['pee', 'piss', 'urinate', 'toilet', 'bathroom', 'joke', 'funny', 'recipe', 'cooking']
                is_absurd = any(pattern in query_lower for pattern in absurd_patterns)
                
                # Check for disaster-related keywords (optional - for better context, not required)
                disaster_keywords = [
                    # Natural disasters
                    'flood', 'flooding', 'earthquake', 'drought', 'landslide', 'cyclone', 'tsunami', 'avalanche',
                    'water', 'disaster', 'rain', 'monsoon', 'dam', 'river', 'storm', 'hurricane', 'typhoon',
                    # Pakistan locations
                    'punjab', 'sindh', 'balochistan', 'kp', 'kpk', 'pakistan', 'indus', 'ravi', 'chenab',
                    'lahore', 'karachi', 'islamabad', 'peshawar', 'quetta', 'gilgit', 'kashmir',
                    # Disaster-related terms
                    'weather', 'climate', 'damage', 'casualt', 'evacuate', 'relief', 'emergency',
                    'risk', 'history', 'impact', 'preparedness', 'mitigation', 'response',
                    # Years (common disaster years)
                    '2010', '2022', '1950', '2020', '2005', '2008'
                ]
                
                has_disaster_keywords = any(keyword in query_lower for keyword in disaster_keywords)
                
                # Only block clearly absurd questions
                if is_absurd:
                    return """I'm **FloodGuard AI**, a serious natural disaster analysis system trained on 75 years of Pakistan's disaster data (1950-2025).

I provide accurate, data-driven insights on:
• Historical natural disaster events and damages
• Risk assessments for regions
• Safety and preparedness measures

Please ask meaningful questions about natural disasters in Pakistan."""
                
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
                    # Data-driven query - use data first, supplement with general knowledge if needed
                    prompt = f"""You are FloodGuard AI, an expert natural disaster analyst specializing in Pakistan with access to comprehensive disaster database (1950-2025).

User Question: {query}

AVAILABLE DATA:
{context}

INSTRUCTIONS:
1. PRIMARY: Use the provided data above for specific facts and numbers
2. SECONDARY: If data is incomplete or doesn't fully answer the question, supplement with your general knowledge about natural disasters in Pakistan
3. SCOPE: Focus on natural disasters (floods, earthquakes, droughts, landslides, etc.) - keep Pakistan-relevant
4. WORLDWIDE EXAMPLES: Only use international examples if they help explain concepts or provide context (e.g., "Similar to the 2004 Indian Ocean tsunami, Pakistan's coastal areas face...")
5. Keep response CONCISE: 3-5 sentences maximum OR 2-3 bullet points
6. Format numbers with **bold** (e.g., **1,234** people affected)
7. NEVER end mid-sentence - complete every sentence fully
8. Be direct and informative - prioritize Pakistan context
9. If the question is vague or needs clarification, provide a helpful answer but also suggest what specific information would help give a better answer

Example response with data:
"In **2010**, devastating floods affected **20 million** people across Pakistan, with **1,985** casualties. **Sindh** and **Punjab** were the most severely impacted provinces."

Example with partial data + general knowledge:
"While my database shows limited records for that period, Pakistan's **Indus River basin** is highly vulnerable to monsoon flooding. Similar patterns have been observed in other South Asian countries like Bangladesh, where river systems face similar challenges during monsoon season."

Example for vague questions:
"Pakistan faces various natural disaster risks including floods, earthquakes, and droughts. For a more specific answer, could you clarify which type of disaster, region, or time period you're interested in?"

Provide a COMPLETE, concise response now:"""
                else:
                    # No specific data found - use general knowledge, be helpful and ask for clarification if needed
                    keyword_note = ""
                    if not has_disaster_keywords:
                        keyword_note = "\nNOTE: The user's question doesn't contain specific disaster keywords, but you should still provide a helpful answer using your general knowledge about natural disasters and Pakistan. If the question is unclear, provide a general answer and ask what specific information they need."
                    
                    prompt = f"""You are FloodGuard AI, an expert natural disaster analyst specializing in Pakistan and South Asian disasters.

User Question: {query}
{keyword_note}

CONTEXT: Your database search didn't find specific data matching this query, but you have extensive knowledge about natural disasters.

INSTRUCTIONS:
1. Provide a helpful answer using your general knowledge about natural disasters, prioritizing Pakistan context
2. SCOPE: Focus on natural disasters (floods, earthquakes, droughts, landslides, cyclones, etc.) - but be flexible if the question is general
3. PAKISTAN FIRST: Always prioritize Pakistan-specific information and examples when relevant
4. WORLDWIDE EXAMPLES: Use international examples ONLY when they help explain concepts or provide useful context (e.g., "Similar to Japan's earthquake preparedness, Pakistan could benefit from...")
5. Keep response BRIEF: 2-4 complete sentences maximum
6. Use **bold** for key terms, locations, and important points
7. NEVER end mid-sentence - complete every sentence fully
8. Be informative and helpful - focus on practical, relevant information
9. If the question is vague or could be answered better with specifics, provide a helpful general answer AND suggest what specific information would help (e.g., "For a more detailed answer, could you specify which region or time period you're interested in?")

Example response for general questions:
"Pakistan experiences various natural disasters including **monsoon flooding** (July-September), **earthquakes** along fault lines, and **droughts** in arid regions. The **Indus River basin** is particularly vulnerable to flooding. For more specific information, could you tell me which type of disaster, region, or time period you'd like to know about?"

Example response for specific questions without data:
"Pakistan experiences **monsoon flooding** primarily between **July and September**, affecting the **Indus River basin** and its tributaries. The **Punjab** and **Sindh** provinces are most vulnerable due to their low-lying geography. For detailed historical data on a specific year or region, please provide more specifics."

Provide a BRIEF, COMPLETE, and HELPFUL response now:"""
                
                # Enhanced generation config for complete responses
                generation_config = {
                    'temperature': 0.7,  # Balanced creativity and accuracy
                    'top_p': 0.95,
                    'top_k': 40,
                    'max_output_tokens': 2048,  # Increased for complete responses
                    'stop_sequences': None,  # Let responses complete naturally
                }
                
                response = self.gemini_model.generate_content(
                    prompt,
                    generation_config=generation_config
                )
                
                # Track API usage
                self.api_call_count += 1
                print(f"📊 API Calls this session: {self.api_call_count}")
                
                # Enhanced response validation
                if not response.parts:
                    print(f"⚠️ No response parts generated")
                    
                    # Graceful fallback without additional API calls
                    if hasattr(response, 'prompt_feedback') and response.prompt_feedback.block_reason:
                        print(f"⚠️ Response blocked: {response.prompt_feedback.block_reason}")
                    
                    # Smart fallback based on context availability
                    if context:
                        # Extract key information from context
                        import re
                        
                        # Parse query intent
                        query_lower = query.lower()
                        query_years = re.findall(r'\b((?:19|20)\d{2})\b', query)
                        
                        # Split context into events
                        events = [e.strip() for e in context.split('===') if e.strip()]
                        
                        # Match query to most relevant event
                        relevant_event = None
                        
                        # Priority 1: Match specific year
                        if query_years:
                            target_year = query_years[0]
                            for event in events:
                                if f"Year: {target_year}" in event:
                                    relevant_event = event
                                    break
                        
                        # Priority 2: Match province
                        provinces = ['punjab', 'sindh', 'kpk', 'balochistan', 'gilgit', 'ajk']
                        if not relevant_event:
                            for province in provinces:
                                if province in query_lower:
                                    for event in events:
                                        if province in event.lower():
                                            relevant_event = event
                                            break
                                    if relevant_event:
                                        break
                        
                        # Priority 3: Use first/most recent event
                        if not relevant_event and events:
                            relevant_event = events[0]
                        
                        # Format the relevant event as a response
                        if relevant_event:
                            year_match = re.search(r'Year:\s*(\d{4})', relevant_event)
                            severity_match = re.search(r'Severity:\s*(\w+)', relevant_event, re.IGNORECASE)
                            affected_match = re.search(r'Affected:\s*([\d,]+)', relevant_event)
                            casualties_match = re.search(r'Casualties:\s*([\d,]+)', relevant_event)
                            economic_match = re.search(r'Economic.*?[\$]?([\d,\.]+)', relevant_event, re.IGNORECASE)
                            
                            if year_match:
                                response_parts = []
                                year = year_match.group(1)
                                
                                # Build comprehensive response
                                intro = f"In **{year}**, Pakistan experienced"
                                
                                if severity_match:
                                    severity = severity_match.group(1).lower()
                                    intro += f" a **{severity}** flood event"
                                else:
                                    intro += f" severe flooding"
                                
                                response_parts.append(intro + ".")
                                
                                # Add impact details
                                if affected_match or casualties_match:
                                    impact = "The disaster"
                                    if affected_match:
                                        impact += f" affected **{affected_match.group(1)}** people"
                                    if casualties_match:
                                        if affected_match:
                                            impact += f" and resulted in **{casualties_match.group(1)}** casualties"
                                        else:
                                            impact += f" resulted in **{casualties_match.group(1)}** casualties"
                                    response_parts.append(impact + ".")
                                
                                # Add economic impact if available
                                if economic_match:
                                    response_parts.append(f"Economic losses reached **${economic_match.group(1)}**.")
                                
                                return " ".join(response_parts)
                            
                            # Provincial data formatting
                            elif 'Province:' in relevant_event:
                                lines = [l.strip() for l in relevant_event.split('\n') if l.strip() and not l.startswith('===')]
                                if lines:
                                    return "\n\n".join(lines[:4])  # First 4 lines
                            
                            # Generic formatting
                            else:
                                lines = [l.strip() for l in relevant_event.split('\n') if l.strip() and not l.startswith('===')]
                                return "\n".join(lines[:5])
                    
                    # No context available
                    return "I apologize, but I'm unable to process your request at the moment. Please try rephrasing your question about Pakistan's flood history."
                
                # Extract response text
                response_text = response.text.strip()
                
                # Check completion status
                if hasattr(response, 'candidates') and len(response.candidates) > 0:
                    candidate = response.candidates[0]
                    if hasattr(candidate, 'finish_reason'):
                        finish_reason = str(candidate.finish_reason)
                        print(f"🔍 Finish reason: {finish_reason}")
                        
                        if 'MAX_TOKENS' in finish_reason or 'LENGTH' in finish_reason:
                            print(f"⚠️ Response truncated - consider increasing max_output_tokens")
                
                # Post-process incomplete responses
                if response_text and not response_text[-1] in '.!?':
                    print(f"⚠️ Incomplete response detected")
                    
                    # Extract complete sentences only
                    import re
                    sentences = re.split(r'([.!?])\s+', response_text)
                    
                    # Reconstruct with complete sentences only
                    complete_sentences = []
                    for i in range(0, len(sentences)-1, 2):
                        if i+1 < len(sentences):
                            complete_sentences.append(sentences[i] + sentences[i+1])
                    
                    if complete_sentences:
                        response_text = ' '.join(complete_sentences)
                        print(f"✂️ Truncated to {len(complete_sentences)} complete sentence(s)")
                
                return response_text
                
            except Exception as e:
                error_str = str(e)
                print(f"Error in ask() (attempt {attempt + 1}/{max_retries}): {error_str}")
                last_error = e
                
                # Check if it's a quota error (429)
                if "429" in error_str or "quota" in error_str.lower() or "Quota exceeded" in error_str:
                    print(f"⚠️ Quota exceeded for API key {self.current_key_index + 1}")
                    
                    # Try next API key if available
                    if attempt < max_retries - 1:
                        if self.switch_to_next_api_key():
                            print(f"🔄 Retrying with API key {self.current_key_index + 1}/{len(self.api_keys)}")
                            continue  # Retry with new key
                        else:
                            break  # No more keys to try
                    else:
                        break  # No more retries
                else:
                    # Not a quota error, don't retry
                    break
        
        # If we get here, all retries failed
        print(f"❌ All API keys exhausted or error not quota-related")
        return "I encountered an issue processing your question. Could you try rephrasing it?"

    def get_location_summary(self, location: str) -> str:
        """Get comprehensive natural disaster risk summary for a location"""
        return self.ask(f"What is the natural disaster history, damages, casualties, and risk level for {location} in Pakistan?")

# Initialize chat engine instance
chat_engine = ChatEngine()
