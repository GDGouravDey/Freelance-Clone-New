from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer, util
import re

# Load pre-trained Sentence-BERT model for semantic matching
model = SentenceTransformer('paraphrase-MiniLM-L6-v2')

# Initialize FastAPI
app = FastAPI()

# Preprocess skills: Lowercase and remove special characters
def preprocess(text):
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s]', '', text)
    return text

# Calculate skill match score using semantic similarity
def calculate_semantic_skill_match(freelancer_skills, job_skills, similarity_threshold=0.7):
    matched_skills = []
    total_similarity = 0

    # Preprocess freelancer and job skills
    freelancer_skills = [preprocess(skill) for skill in freelancer_skills]
    job_skills = [preprocess(skill) for skill in job_skills]

    # Encode job skills once
    job_skill_embeddings = model.encode(job_skills)

    # Keep track of matched job skills to avoid duplicates
    matched_job_indices = set()

    # Compare each freelancer skill to each job-required skill using cosine similarity
    for freelancer_skill in freelancer_skills:
        freelancer_skill_embedding = model.encode(freelancer_skill)

        # Compare with all job skills and get maximum similarity score
        similarities = util.pytorch_cos_sim(freelancer_skill_embedding, job_skill_embeddings)[0]
        max_similarity, best_match_idx = similarities.max(dim=0)

        # If similarity is above the threshold and the job skill has not been matched yet
        if max_similarity.item() >= similarity_threshold and best_match_idx.item() not in matched_job_indices:
            matched_skills.append(job_skills[best_match_idx.item()])
            total_similarity += max_similarity.item()
            matched_job_indices.add(best_match_idx.item())  # Mark this job skill as matched

    # Calculate match score based on number of matched skills
    skill_match_score = (len(matched_skills) / len(job_skills)) * 100 if len(job_skills) > 0 else 0
    return skill_match_score, matched_skills

# Sort freelancers by match score for a specific job
def recommend_freelancers(job_posting, freelancers, similarity_threshold=0.7):
    job_skills = job_posting["skills_required"]
    recommendations = []

    # Calculate combined skill match score for each freelancer
    for freelancer in freelancers:
        freelancer_skills = freelancer["skills"]

        # Calculate skill match score based on semantic similarity
        match_score, matched_skills = calculate_semantic_skill_match(freelancer_skills, job_skills, similarity_threshold)

        # Add match score and matched skills to the freelancer profile
        recommendations.append({
            "name": freelancer["name"],
            "match_score": min(match_score, 100),  # Cap the match score at 100%
            "matched_skills": matched_skills
        })

    # Sort by match score (descending)
    recommendations.sort(key=lambda x: x['match_score'], reverse=True)

    return recommendations

# Define Pydantic models for validation
class JobPosting(BaseModel):
    title: str
    skills_required: list[str]
    budget: float

class Freelancer(BaseModel):
    name: str
    skills: list[str]

class RecommendationRequest(BaseModel):
    job_posting: JobPosting
    freelancers: list[Freelancer]

# FastAPI endpoint to recommend freelancers for a given job posting
@app.post("/recommend_freelancers/")
def get_freelancer_recommendations(request: RecommendationRequest):
    job_posting = request.job_posting.dict()
    freelancers = [freelancer.dict() for freelancer in request.freelancers]

    # Get recommendations
    recommendations = recommend_freelancers(job_posting, freelancers)

    # Return the recommendations as JSON response
    return {"job_title": job_posting["title"], "budget": job_posting["budget"], "recommendations": recommendations}

