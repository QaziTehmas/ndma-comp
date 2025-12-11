import json
import os
from pypdf import PdfReader
import re

def extract_pdf_data():
    pdf_path = "../../../apps/frontend/public/data/a comprehensive report on flood from 1950-2025.pdf"
    output_path = "../../../apps/frontend/public/data/flood-knowledge-base.json"
    
    # Resolve absolute paths
    base_dir = os.path.dirname(os.path.abspath(__file__))
    abs_pdf_path = os.path.normpath(os.path.join(base_dir, pdf_path))
    abs_output_path = os.path.normpath(os.path.join(base_dir, output_path))
    
    print(f"Reading PDF from: {abs_pdf_path}")
    
    if not os.path.exists(abs_pdf_path):
        print("Error: PDF file not found!")
        return

    try:
        reader = PdfReader(abs_pdf_path)
        knowledge_base = []
        
        full_text = ""

        print(f"Found {len(reader.pages)} pages. Extracting text...")

        for i, page in enumerate(reader.pages):
            text = page.extract_text()
            if text:
                # Clean up text likely to be headers/footers
                clean_text = re.sub(r'\s+', ' ', text).strip()
                
                knowledge_base.append({
                    "id": i + 1,
                    "page": i + 1,
                    "content": clean_text
                })
                full_text += clean_text + " "
        
        # Save structured page data
        with open(abs_output_path, 'w', encoding='utf-8') as f:
            json.dump(knowledge_base, f, indent=2, ensure_ascii=False)
            
        print(f"Successfully saved knowledge base to {abs_output_path}")
        
        # Also try to extract a simple timeline (Year: Description) using regex
        # Look for patterns like "1950" or "2010" followed by text
        
        timeline = []
        years = re.findall(r'\b(19|20)\d{2}\b', full_text)
        unique_years = sorted(list(set(years)))
        
        # A simple extract for now, real extraction needs smarter logic or LLM
        print(f"Detected years: {unique_years}")

    except Exception as e:
        print(f"Error processing PDF: {str(e)}")

if __name__ == "__main__":
    extract_pdf_data()
