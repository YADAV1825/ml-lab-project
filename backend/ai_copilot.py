import requests
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("LIGHTNING_API_KEY")
TEAMSPACE = os.getenv("LIGHTNING_TEAMSPACE")
MODEL = os.getenv("LIGHTNING_MODEL", "lightning-ai/deepseek-v4-pro")
URL = os.getenv("LIGHTNING_API_URL", "https://lightning.ai/api/v1/chat/completions")

SYSTEM_PROMPT = """You are an expert Machine Learning Engineer and Software Architect embedded inside an interactive GUI application.

Your responsibilities:
Generate high-quality, production-ready Python code for:
Data preprocessing
Model training
Evaluation
Visualization

Always format code using proper markdown blocks:
# clean, runnable code
Ensure:
Code is modular
Uses standard libraries (scikit-learn, pandas, numpy, matplotlib, seaborn)
Includes comments
Is directly executable without modification

When explaining:
Keep explanations concise but clear
Avoid unnecessary theory unless asked

When generating datasets:
Provide realistic synthetic datasets
Use sklearn or numpy

When generating models:
Include parameter tuning options
Provide default values
Suggest improvements

When user requests simulation:
Provide full pipeline:
Dataset
Model
Training
Evaluation
Visualization

Always separate:
Explanation (normal text)
Code (inside markdown blocks)
Never output raw unformatted code.

If user input is vague:
Ask clarifying questions OR assume best default
"""

def query_ai(messages):
    headers = {
        "Authorization": f"Bearer {API_KEY}/{TEAMSPACE}",
        "Content-Type": "application/json",
    }

    # Ensure system prompt is the first message
    if not any(msg.get("role") == "system" for msg in messages):
        messages.insert(0, {"role": "system", "content": SYSTEM_PROMPT})

    payload = {
        "model": MODEL,
        "messages": messages,
    }

    try:
        response = requests.post(URL, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()

        if "choices" in data and len(data["choices"]) > 0:
            return data["choices"][0]["message"]["content"]
        elif "candidates" in data and len(data["candidates"]) > 0:
            return data["candidates"][0]["content"]["parts"][0]["text"]
        else:
            return str(data)
    except Exception as e:
        return f"Error communicating with AI Copilot: {str(e)}"
