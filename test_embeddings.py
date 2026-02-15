# ------------------------------
# Vector Embedding Email Classifier
# ------------------------------

import sys
import json
from sentence_transformers import SentenceTransformer, util

# 1️⃣ Load embedding model ONCE
model = SentenceTransformer("hkunlp/instructor-base")

# 2️⃣ Define labels
CATEGORY_MAP = {
    "job interview invitation, recruiter message, hiring process update, candidate selection email from HR or careers team": "hiring",
    "invoice, payment receipt, subscription charge, billing statement, transaction confirmation email": "billing",
    "security alert, suspicious login warning, OTP verification, password reset request, account authentication email": "security",
    "marketing promotion, discount offer, product sale advertisement, limited time deal, newsletter campaign email": "promotion",
    "personal message from friend or family, casual conversation, social gathering invitation, informal chat email": "personal",
    "phishing attempt, lottery scam, urgent bank request, fake prize notification, fraudulent financial email": "scam"
}

# 3️⃣ Pre-compute label embeddings
label_embeddings = model.encode(
    LABELS,
    normalize_embeddings=True
)

def classify_email(text):
    """
    Convert email text to vector and
    find closest label using cosine similarity
    """

    # 4️⃣ Convert email text → vector
    email_embedding = model.encode(
        text,
        normalize_embeddings=True
    )

    # 5️⃣ Compute similarity
    scores = util.cos_sim(email_embedding, label_embeddings)[0]

    # 6️⃣ Pick best label
    best_index = scores.argmax().item()

    return {
        "predicted_label": LABELS[best_index],
        "confidence": float(scores[best_index]),
        "labels": LABELS,
        "scores": [float(s) for s in scores]
    }

# 7️⃣ Read input from Node.js
if __name__ == "__main__":
    raw_input = sys.stdin.read()
    emails = json.loads(raw_input)   # ← array of emails

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