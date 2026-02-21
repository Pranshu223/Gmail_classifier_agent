# ------------------------------
# Vector Embedding Email Classifier (Instructor - Optimized)
# ------------------------------

import sys
import json
import os
import torch
import numpy as np
from InstructorEmbedding import INSTRUCTOR
from sklearn.metrics.pairwise import cosine_similarity

# ------------------------------
# Performance Settings
# ------------------------------

os.environ["TOKENIZERS_PARALLELISM"] = "false"

num_cores = os.cpu_count()
torch.set_num_threads(num_cores)
torch.set_num_interop_threads(num_cores)

# ------------------------------
# Load Model ONCE
# ------------------------------

model = INSTRUCTOR("hkunlp/instructor-base")

# ------------------------------
# Define Labels
# ------------------------------

LABELS = [
    "job interview invitation, recruiter message, hiring process update, candidate selection email from HR or careers team",
    "invoice, payment receipt, subscription charge, billing statement, transaction confirmation email",
    "security alert, suspicious login warning, OTP verification, password reset request, account authentication email",
    "marketing promotion, discount offer, product sale advertisement, limited time deal, newsletter campaign email",
    "personal message from friend or family, casual conversation, social gathering invitation, informal chat email",
    "phishing attempt, lottery scam, urgent bank request, fake prize notification, fraudulent financial email"
]

# ------------------------------
# Precompute Label Embeddings
# ------------------------------

label_embeddings = model.encode(
    [["Represent the category for email classification:", label] for label in LABELS],
    normalize_embeddings=True
)

# ------------------------------
# Main Execution
# ------------------------------

if __name__ == "__main__":

    try:
        raw_input = sys.stdin.read()

        if not raw_input.strip():
            print(json.dumps([]))
            sys.exit(0)

        emails = json.loads(raw_input)

        if not emails:
            print(json.dumps([]))
            sys.exit(0)

        # ------------------------------
        # Prepare Batch Inputs
        # ------------------------------

        email_inputs = []

        for email in emails:

            from_val = str(email.get("from", ""))
            subject_val = str(email.get("subject", ""))
            body_val = str(email.get("body", ""))

            text = f"From: {from_val}\nSubject: {subject_val}\nBody: {body_val}"

            email_inputs.append(
                ["Represent the email for classification:", text]
            )

        # ------------------------------
        # Batch Encode Emails
        # ------------------------------

        email_embeddings = model.encode(
            email_inputs,
            normalize_embeddings=True
        )

        results = []

        for idx, email_embedding in enumerate(email_embeddings):

            scores = cosine_similarity(
                [email_embedding],
                label_embeddings
            )[0]

            best_index = int(np.argmax(scores))

            results.append({
                "id": emails[idx].get("id"),
                "from": emails[idx].get("from"),
                "subject": emails[idx].get("subject"),
                "category": LABELS[best_index],
                "confidence": float(scores[best_index])
            })

        print(json.dumps(results))

    except Exception as e:
        print(json.dumps({
            "error": str(e)
        }))
