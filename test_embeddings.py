# Vector Embedding Email Classifier (Instructor - Optimized)
import sys
import json
import os
import torch
import numpy as np
from InstructorEmbedding import INSTRUCTOR
from sklearn.metrics.pairwise import cosine_similarity
import logging

# Suppress transformer logs
logging.getLogger("sentence_transformers").setLevel(logging.ERROR)
logging.getLogger("transformers").setLevel(logging.ERROR)
os.environ["TOKENIZERS_PARALLELISM"] = "false"
# Performance Settings - CPU K SARE K SARE CORE DEDIE FOR FAST PROCESSING
os.environ["TOKENIZERS_PARALLELISM"] = "false"

num_cores = os.cpu_count()
torch.set_num_threads(num_cores)
torch.set_num_interop_threads(num_cores)

# Load Model ONCE

model = INSTRUCTOR("hkunlp/instructor-base")
LABELS = [
    "Job / Career",
    "Finance / Invoice",
    "Security Alert",
    "Marketing / Promotion",
    "Personal",
    "Spam / Phishing"
]
label_embeddings = model.encode(
    [["Classify the email into one of the predefined categories: ", label] for label in LABELS],
    normalize_embeddings=True
)

# Main Execution

if __name__ == "__main__":

    try:
        raw_input = sys.stdin.read()

        if not raw_input.strip():
            sys.stdout.write(json.dumps([]))
            sys.stdout.flush()
            sys.exit(0)

        emails = json.loads(raw_input)
        # print("EMAILS",emails)

        if not emails:
            sys.stdout.write(json.dumps([]))
            sys.stdout.flush()
            sys.exit(0)

        # Prepare Batch Inputs

        email_inputs = []

        for email in emails:

            from_val = str(email.get("from", ""))
            subject_val = str(email.get("subject", ""))
            body_val = str(email.get("body", ""))

            text = f"From: {from_val}\nSubject: {subject_val}\nBody: {body_val}"
            email_inputs.append(
                ["Represent the email for classification:", text]
            )
            #print("email inputs is",email_inputs)

        # email_embeddings = model.encode(
        #     email_inputs,
        #     normalize_embeddings=True
        # )
        email_embeddings = []
        for i, item in enumerate(email_inputs):
            try:
                emb = model.encode([item], normalize_embeddings=True)
                email_embeddings.append(emb[0])
            except Exception as e:
                    # Skip bad email instead of crashing
                continue
        if not email_embeddings:
            sys.output.write(json.dumps([]))
            sys.stdout.flush()
            sys.exit(0)        
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
        sys.stdout.write(json.dumps(results))
        sys.stdout.flush()
