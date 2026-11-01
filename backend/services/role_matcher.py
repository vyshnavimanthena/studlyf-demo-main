from typing import Dict, List, Any
from services.career_taxonomy import ROLE_DATABASE, get_skill_display_name

def match_user_to_roles(user_vector: Dict[str, float], profile: Dict[str, Any], limit: int = 6) -> List[Dict[str, Any]]:
    """
    Layer 2: Role Similarity Engine.
    
    Computes a weighted overlap score between the user's skill vector and each career role's required skills.
    Returns the top matched roles, sorted by match percentage.
    
    Args:
        user_vector: Normalized skill scores (0-10) from Layer 1.
        profile: The original user profile (contains subject, interests, etc.).
        limit: Max number of matched roles to return.
        
    Returns:
        List of matched role dicts.
    """
    matched_roles: List[Dict[str, Any]] = []
    subject = profile.get("subject", "").strip()
    
    for role_name, role_data in ROLE_DATABASE.items():
        role_skills = role_data.get("skills", {})
        
        # Calculate overlap score
        total_required_weight = sum(role_skills.values())
        user_match_weight = 0.0
        
        for skill_key, required_weight in role_skills.items():
            user_score = user_vector.get(skill_key, 0.0)
            # Match weight is the overlap between user's score and required weight
            # User score is 0-10, required weight is also 0-10
            user_match_weight += min(user_score, required_weight)
            
        # Base skill coverage percentage
        if total_required_weight > 0:
            coverage = user_match_weight / total_required_weight
        else:
            coverage = 0.0
            
        match_percentage = coverage * 100.0
        
        # Add a small boost (up to 8%) for subject / degree compatibility
        subject_boost = 0.0
        typical_degree = role_data.get("typical_degree", "").lower()
        if subject:
            subject_words = [w.lower() for w in subject.split() if len(w) > 2]
            for word in subject_words:
                if word in typical_degree:
                    subject_boost += 4.0
            # Cap the boost at 8.0
            subject_boost = min(subject_boost, 8.0)
            
        match_percentage += subject_boost
        
        # Add a small boost for matching interests
        interests = profile.get("interests", [])
        interest_boost = 0.0
        role_personality = [p.lower() for p in role_data.get("personality", [])]
        for interest in interests:
            interest_clean = interest.lower().strip()
            # If interest matches personality or description keywords
            if any(p in interest_clean for p in role_personality) or interest_clean in role_name.lower():
                interest_boost += 3.0
        interest_boost = min(interest_boost, 6.0)
        
        match_percentage += interest_boost

        # Add a custom role title compatibility boost
        role_boost = 0.0
        user_role_clean = profile.get("role", "").lower()
        if user_role_clean:
            # Healthcare compatibility
            if any(w in user_role_clean for w in ["doctor", "medical", "physician", "nurse", "health", "clinical"]):
                if any(w in role_name.lower() for w in ["healthcare", "biomedical", "pharmaceutical"]):
                    role_boost += 12.0
                elif "data analyst" in role_name.lower() or "research scientist" in role_name.lower():
                    role_boost += 5.0
            
            # Education/Teacher compatibility
            elif any(w in user_role_clean for w in ["teacher", "educat", "professor", "instruct", "lectur", "teach"]):
                if any(w in role_name.lower() for w in ["technical writer", "project manager", "consultant"]):
                    role_boost += 12.0
            
            # AI Engineer/Data compatibility
            elif any(w in user_role_clean for w in ["ai", "machine learning", "data", "ml"]):
                if any(w in role_name.lower() for w in ["ml engineer", "ai research", "data scientist", "nlp engineer"]):
                    role_boost += 12.0
                elif any(w in role_name.lower() for w in ["data engineer", "data analyst"]):
                    role_boost += 8.0
            
            # Generic engineering/development compatibility
            elif any(w in user_role_clean for w in ["developer", "engineer", "programmer", "coder"]):
                if any(w in role_name.lower() for w in ["software engineer", "frontend engineer", "backend engineer", "full stack"]):
                    role_boost += 10.0
                    
        match_percentage += role_boost
        
        # Keep within realistic student matching boundaries: 35% - 98%
        match_percentage = max(35.0, min(98.0, match_percentage))
        match_percentage = round(match_percentage, 1)
        
        # Identify strengths: skills user has >= 5.0 that are required by the role
        strengths = []
        for skill_key, required_weight in role_skills.items():
            user_score = user_vector.get(skill_key, 0.0)
            if user_score >= 5.0:
                strengths.append({
                    "skill_key": skill_key,
                    "display_name": get_skill_display_name(skill_key),
                    "score": user_score,
                    "importance": required_weight
                })
        # Sort strengths by user score descending
        strengths = sorted(strengths, key=lambda x: x["score"], reverse=True)
        
        # Identify gaps: skills required by the role (importance >= 4.0) where user has < 5.0 (or missing)
        gaps = []
        for skill_key, required_weight in role_skills.items():
            if required_weight >= 4.0:
                user_score = user_vector.get(skill_key, 0.0)
                if user_score < 5.0:
                    gaps.append({
                        "skill_key": skill_key,
                        "display_name": get_skill_display_name(skill_key),
                        "required": required_weight,
                        "current": user_score,
                        "gap_depth": round(required_weight - user_score, 1)
                    })
        # Sort gaps by gap depth descending
        gaps = sorted(gaps, key=lambda x: x["gap_depth"], reverse=True)
        
        # Map demand to Growth Potential rating
        demand_mapping = {
            "very_high": "High Growth",
            "high": "Moderate-High Growth",
            "medium": "Stable Growth",
            "low": "Low Growth"
        }
        growth_potential = demand_mapping.get(role_data.get("demand", "medium"), "Stable Growth")
        
        # Generate a templated "why matched" explanation
        top_strength_names = [s["display_name"] for s in strengths[:2]]
        top_gap_names = [g["display_name"] for g in gaps[:2]]
        
        if top_strength_names:
            strength_clause = f"your solid foundation in {', '.join(top_strength_names)}"
        else:
            strength_clause = f"your academic background in {subject or 'your field'}"
            
        if top_gap_names:
            gap_clause = f"focusing on building skills in {', '.join(top_gap_names)}"
        else:
            gap_clause = "continuing to hone your core expertise"
            
        why_matched = (
            f"You align well with the {role_name} path due to {strength_clause}. "
            f"To successfully transition, we recommend {gap_clause}."
        )
        
        matched_roles.append({
            "name": role_name,
            "match_percentage": match_percentage,
            "description": role_data.get("description", ""),
            "typical_degree": role_data.get("typical_degree", ""),
            "salary": role_data.get("salary", {}),
            "growth_trajectory": role_data.get("growth", []),
            "growth_potential": growth_potential,
            "matched_strengths": strengths,
            "skill_gaps": gaps,
            "why_matched": why_matched,
            "learning_roadmap": role_data.get("roadmap", [])
        })
        
    # Sort roles by match percentage descending
    matched_roles = sorted(matched_roles, key=lambda x: x["match_percentage"], reverse=True)
    
    return matched_roles[:limit]
