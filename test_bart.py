import os
os.environ["TRANSFORMERS_VERBOSITY"] = "error"
os.environ["HF_HUB_DISABLE_PROGRESS_BARS"] = "1"
from transformers import pipeline
#pipeline -> transformers use krna easy kr deta h ye , like tokenization loading model,sending data to pytorch,running trnasformer layers
import sys #system module let pyuthon talk to terminal/command Line/stdin/stdout 
#as Node.js -> python (nodejs sends email to py file via stdin)
import json
 
# Load model once
classifier = pipeline(
    "zero-shot-classification",
    model="facebook/bart-large-mnli"
)

def classify_email(text):
    #labels = ["work","promotion","spam","Personal"]
    
    labels = [
  "job interview or hiring email",
  "marketing or promotional email",
  "security or account alert",
  "financial or billing email",
  "personal or social email",
  "spam or scam message"
]

    result = classifier(
    text,
    candidate_labels = labels,
    hypothesis_template = "This email is about {}"
    )
    
    return {
        "predicted_label": result["labels"][0],
        "confidence": float(result["scores"][0]),
        "labels": result["labels"],
        "scores": [float(s) for s in result["scores"]]
    }

if __name__ == "__main__":
    raw_input = sys.stdin.read().strip()
    emails = json.loads(raw_input)

    results = []

    for email in emails:
        text = f"""
From: {email['from']}
Subject: {email['subject']}
Body: {email['body']}
"""

        classification = classify_email(text)

        results.append({
            "id": email["id"],
            "from": email["from"],
            "subject": email["subject"],
            "category": classification["predicted_label"],
            "confidence": classification["confidence"]
        })

    print(json.dumps(results))