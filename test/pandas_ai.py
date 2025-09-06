#!/usr/bin/env python3
"""
Dynamic Pandas AI Query Engine

Features:
- AI generates actual pandas code dynamically
- Safe execution environment with whitelisting
- Much more flexible than plan-based approach
- Handles complex queries automatically

Usage:
  python pandas_ai.py --csv ./listings.csv --chatbot
"""

import sys
import re
import ast
import traceback
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')

import pandas as pd
from openai import OpenAI

# Configuration
API_KEY = "GG6cBsIY54h7PYIdginIuC2MsFlZafeg"
MODEL = "meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8"

SYSTEM_PROMPT = """You are a pandas code generator. Generate ONLY valid pandas code.

Dataset: df (variable name)
Columns: id, propertytype, lot, address, suburb, availability, frontage, landsize, buildsize, bed, bath, garage, registrationconstructionstatus, price, media, remark, updated_at

Dropdown Values:
- propertytype: "Land only", "Single story", "Double story", "Dual occupancy", "Apartment", "Townhouse", "Home and Land Packages"
- availability: "Available", "Under Offer", "Sold"
- registrationconstructionstatus: "Registered", "Unregistered", "Under Construction", "Completed"

EXAMPLES:
Q: "What suburbs do I have?"
A: df['suburb'].drop_duplicates().sort_values().reset_index(drop=True)

Q: "How many different suburbs?"
A: df['suburb'].nunique()

Q: "Count properties by suburb"
A: df['suburb'].value_counts().reset_index()

Q: "Most expensive properties"
A: df.nlargest(10, 'price')[['address', 'suburb', 'price']]

Q: "Average price by property type"
A: df.groupby('propertytype')['price'].mean().sort_values(ascending=False).reset_index()

Q: "Properties under $800k in Austral"
A: df[(df['suburb'] == 'Austral') & (df['price'] < 800000)][['address', 'price', 'propertytype']]

Q: "Single story homes with 3+ bedrooms"
A: df[(df['propertytype'] == 'Single story') & (df['bed'] >= 3)][['address', 'suburb', 'bed', 'bath', 'price']]

RULES: 
- Return ONLY pandas code, no explanations or markdown
- Use exact column names and dropdown values
- Filter out NaN prices when needed: df[df['price'].notna()]
- For listings, show relevant columns like address, suburb, price
- For counts, use value_counts() or groupby().size()
- For unique lists, use drop_duplicates() and sort_values()
- Use reset_index() for clean output"""

def get_ai_client():
    return OpenAI(api_key=API_KEY, base_url="https://api.deepinfra.com/v1/openai")

def generate_pandas_code(query: str, client: OpenAI) -> str:
    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": query}
            ],
            temperature=0,
            max_tokens=300
        )
        
        code = response.choices[0].message.content.strip()
        
        # Clean up the code
        code = re.sub(r'```(?:python)?\s*', '', code)
        code = re.sub(r'```\s*$', '', code)
        
        # Remove explanatory text, keep only code lines
        lines = []
        for line in code.split('\n'):
            line = line.strip()
            if line and not line.startswith('#') and not line.startswith('//'):
                if any(word in line for word in ['df', 'pd.', '=', '(', ')', '[', ']']):
                    lines.append(line)
        
        return '\n'.join(lines) if lines else code
        
    except Exception as e:
        raise ValueError(f"Failed to generate code: {str(e)}")

def execute_pandas_code(code: str, df: pd.DataFrame):
    try:
        # Create a restricted namespace
        namespace = {
            'df': df,
            'pd': pd,
            '__builtins__': {
                'len': len, 'str': str, 'int': int, 'float': float, 'bool': bool,
                'print': print, 'type': type, 'isinstance': isinstance,
                'min': min, 'max': max, 'sum': sum, 'abs': abs, 'round': round,
            }
        }
        
        # Execute the code
        result = eval(code, namespace)
        return True, result, ""
        
    except Exception as e:
        error_msg = f"{type(e).__name__}: {str(e)}"
        return False, None, error_msg

def load_data(csv_path: Path) -> pd.DataFrame:
    df = pd.read_csv(csv_path)
    
    # Normalize column names
    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]
    
    # Convert price to numeric
    if 'price' in df.columns:
        df['price'] = pd.to_numeric(df['price'], errors='coerce')
    
    # Convert numeric columns
    numeric_cols = ['bed', 'bath', 'garage', 'landsize', 'buildsize', 'frontage', 'lot']
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')
    
    # Parse dates
    if 'updated_at' in df.columns:
        df['updated_at'] = pd.to_datetime(df['updated_at'], errors='coerce')
    
    # Clean text columns
    text_cols = df.select_dtypes(include=['object']).columns
    for col in text_cols:
        df[col] = df[col].astype(str).str.strip()
        df[col] = df[col].replace('nan', None)
    
    return df

def run_chatbot(csv_path: Path):
    try:
        client = get_ai_client()
        print("✅ AI client initialized")
    except Exception as e:
        print(f"❌ Failed to initialize AI client: {e}")
        return
    
    try:
        df = load_data(csv_path)
        print(f"✅ Loaded dataset: {len(df)} rows, {len(df.columns)} columns")
        print(f"📊 Columns: {', '.join(sorted(df.columns))}")
    except Exception as e:
        print(f"❌ Failed to load dataset: {e}")
        return
    
    print("\n🐍 Dynamic Pandas AI Chatbot")
    print("💡 Ask any question about your data - I'll generate pandas code!")
    print("📝 Examples:")
    print("   - 'What suburbs do I have properties in?'")
    print("   - 'Show me the 10 most expensive properties'")  
    print("   - 'Average price by property type'")
    print("   - 'How many 3+ bedroom houses under $800k?'")
    print("\n💬 Type 'quit', 'exit', or press Ctrl+C to stop\n")
    
    while True:
        try:
            user_query = input("🔍 Your question: ").strip()
            
            if user_query.lower() in ['quit', 'exit', 'q']:
                print("👋 Goodbye!")
                break
            
            if not user_query:
                continue
            
            print("🧠 Generating pandas code...")
            
            try:
                # Generate pandas code
                code = generate_pandas_code(user_query, client)
                print(f"\n🐍 Generated Code:")
                print(f"```python\n{code}\n```")
                
                # Execute the code
                print("\n⚡ Executing...")
                success, result, error = execute_pandas_code(code, df)
                
                if success:
                    print("\n📊 Results:")
                    if isinstance(result, pd.DataFrame):
                        if len(result) > 20:
                            print(result.head(20).to_string(index=False))
                            print(f"\n... and {len(result) - 20} more rows")
                        else:
                            print(result.to_string(index=False))
                    elif isinstance(result, pd.Series):
                        if len(result) > 20:
                            print(result.head(20).to_string())
                            print(f"\n... and {len(result) - 20} more items")
                        else:
                            print(result.to_string())
                    else:
                        print(f"   {result}")
                else:
                    print(f"❌ Execution failed: {error}")
                    print("💡 Try rephrasing your question or being more specific.")
                
            except Exception as e:
                print(f"❌ Error: {e}")
                print("💡 Try a different approach or simpler question.")
            
        except KeyboardInterrupt:
            print("\n👋 Goodbye!")
            break
        except EOFError:
            print("\n👋 Goodbye!")
            break
        
        print()  # Add spacing

def main():
    import argparse
    parser = argparse.ArgumentParser(description="Dynamic Pandas AI Query Engine")
    parser.add_argument("--csv", required=True, help="Path to CSV file")
    parser.add_argument("--chatbot", action="store_true", help="Start interactive chatbot")
    parser.add_argument("--query", help="Single query to execute")
    
    args = parser.parse_args()
    
    csv_path = Path(args.csv).resolve()
    if not csv_path.exists():
        print(f"❌ CSV file not found: {csv_path}")
        sys.exit(1)
    
    if args.chatbot:
        run_chatbot(csv_path)
    elif args.query:
        # Single query mode
        try:
            client = get_ai_client()
            df = load_data(csv_path)
            
            code = generate_pandas_code(args.query, client)
            print(f"Generated code: {code}")
            
            success, result, error = execute_pandas_code(code, df)
            if success:
                print("Results:")
                print(result)
            else:
                print(f"Error: {error}")
                
        except Exception as e:
            print(f"❌ Error: {e}")
            sys.exit(1)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()