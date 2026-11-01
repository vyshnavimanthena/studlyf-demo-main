import re
from typing import Dict, List, Tuple, Any
from services.career_taxonomy import (
    ACTIVITY_SKILL_MAP,
    SUBJECT_SKILL_BASELINE,
    SKILL_DISPLAY_NAMES,
    get_skill_display_name
)

SKILL_ALIASES: Dict[str, str] = {
    "clinical assessment": "medical_knowledge",
    "pharmacology": "pharmaceutical_knowledge",
    "patient empathy": "empathy",
    "emergency response": "decision_making",
    "diagnostics": "medical_knowledge",
    "medical communication": "communication",
    "ethics & compliance": "attention_to_detail",
    "team collaboration": "teamwork",
    "instructional design": "writing",
    "classroom management": "leadership",
    "curriculum development": "planning",
    "student assessment": "analytical_thinking",
    "patience": "empathy",
}

def clean_text(text: str) -> str:
    """Lowercase and clean text for better matching."""
    if not text:
        return ""
    return text.lower().strip()

def find_word_matches(keyword: str, text: str) -> bool:
    """Check if keyword is present in text using word boundaries or exact substring match for multi-word phrases."""
    if not keyword or not text:
        return False
    if " " in keyword:
        # Multi-word phrase, check substring match
        return keyword in text
    else:
        # Single word, check with boundaries
        pattern = r"\b" + re.escape(keyword) + r"\b"
        return bool(re.search(pattern, text))

def extract_skills_and_inferences(profile: dict) -> Tuple[Dict[str, float], List[Dict[str, Any]]]:
    """
    Layer 1: Deterministic Skill Extraction Engine.
    
    Takes user profile inputs:
      - subject: academic field (str)
      - skills: list of explicit skills (list of str)
      - role: current or previous role (str)
      - projects: description of projects (str)
      - clubs: description of clubs / activities (str)
      - interests: list of interests (list of str)
      - ambitions: career ambitions / work preferences (str)
      - work_preferences: remote/office, team/solo preferences (str)
      
    Returns:
      - skill_vector: dict of skill_name -> weight (0-10 float)
      - inferences: list of transferable skills discovered, format:
        {"source_field": str, "matched_keyword": str, "context": str, "inferred_skills": list of str}
    """
    skill_vector: Dict[str, float] = {}
    inferences: List[Dict[str, Any]] = []
    
    # 1. Subject Baseline Matching
    subject_raw = clean_text(profile.get("subject", ""))
    matched_subject = None
    if subject_raw:
        # Try direct mapping first
        if subject_raw in SUBJECT_SKILL_BASELINE:
            matched_subject = subject_raw
        else:
            # Try fuzzy check: is a baseline key inside the subject, or vice versa?
            for baseline_key in SUBJECT_SKILL_BASELINE:
                if baseline_key in subject_raw or subject_raw in baseline_key:
                    matched_subject = baseline_key
                    break
        
        if matched_subject:
            baseline_skills = SUBJECT_SKILL_BASELINE[matched_subject]
            for skill, weight in baseline_skills.items():
                skill_vector[skill] = skill_vector.get(skill, 0.0) + weight
    
    # 2. Explicit Skills Mapping
    # Standardize explicit skills to map to taxonomy keys where possible
    explicit_skills = profile.get("skills", [])
    for skill_input in explicit_skills:
        skill_clean = clean_text(skill_input)
        mapped_key = None
        
        # Check SKILL_ALIASES first
        if skill_clean in SKILL_ALIASES:
            mapped_key = SKILL_ALIASES[skill_clean]
        else:
            # Check direct display name matches
            for key, display_name in SKILL_DISPLAY_NAMES.items():
                if clean_text(display_name) == skill_clean or key == skill_clean.replace(" ", "_"):
                    mapped_key = key
                    break
                
        if mapped_key:
            # High weight for explicitly claimed skills
            skill_vector[mapped_key] = max(skill_vector.get(mapped_key, 0.0), 9.0)
        else:
            # Keep the user's custom skill but map it to a safe snake_case key
            safe_key = skill_clean.replace(" ", "_").replace("-", "_")
            if safe_key:
                skill_vector[safe_key] = max(skill_vector.get(safe_key, 0.0), 8.5)

    # 3. Activity and Free-Text Transferable Skill Inference
    fields_to_scan = {
        "role": profile.get("role", ""),
        "projects": profile.get("projects", ""),
        "clubs": profile.get("clubs", ""),
        "ambitions": profile.get("ambitions", ""),
        "work_preferences": profile.get("work_preferences", ""),
    }
    
    # Process selected_tasks if provided
    selected_tasks = profile.get("selected_tasks")
    if selected_tasks and isinstance(selected_tasks, list):
        fields_to_scan["selected_tasks"] = " ".join(selected_tasks)
    
    # Convert interests to a string if it's a list
    interests_val = profile.get("interests", [])
    if isinstance(interests_val, list):
        fields_to_scan["interests"] = ", ".join(interests_val)
    else:
        fields_to_scan["interests"] = str(interests_val)
        
    # Standardize field labels for UI
    field_display_names = {
        "role": "Current/Previous Role",
        "projects": "Projects & Development",
        "clubs": "Clubs & Activities",
        "ambitions": "Career Ambitions",
        "work_preferences": "Work Preferences",
        "interests": "Personal Interests",
        "selected_tasks": "Performed Tasks"
    }

    # For each field, scan for keywords
    for field_key, field_text in fields_to_scan.items():
        field_cleaned = clean_text(field_text)
        if not field_cleaned:
            continue
            
        for keyword, skills_map in ACTIVITY_SKILL_MAP.items():
            if find_word_matches(keyword, field_cleaned):
                # We have a keyword match! Add these skills to the vector
                inferred_displays = []
                for skill_key, weight in skills_map.items():
                    # Accumulate weight (with a slight discount since it is inferred, e.g. 0.85 multiplier)
                    inferred_weight = weight * 0.85
                    skill_vector[skill_key] = skill_vector.get(skill_key, 0.0) + inferred_weight
                    inferred_displays.append(get_skill_display_name(skill_key))
                
                # Retrieve surrounding text for context
                context_snippet = ""
                idx = field_cleaned.find(keyword)
                if idx != -1:
                    start = max(0, idx - 30)
                    end = min(len(field_cleaned), idx + len(keyword) + 30)
                    context_snippet = "..." + field_text[start:end].strip() + "..."
                else:
                    context_snippet = field_text
                
                inferences.append({
                    "source_field": field_display_names.get(field_key, field_key.title()),
                    "matched_keyword": keyword,
                    "context": context_snippet,
                    "inferred_skills": inferred_displays
                })

    # 4. Normalization
    # Cap all skill scores at 10.0 and round to 1 decimal place.
    # Also clean out empty keys.
    normalized_vector: Dict[str, float] = {}
    for skill_key, score in skill_vector.items():
        if skill_key:
            normalized_vector[skill_key] = round(min(10.0, score), 1)
            
    return normalized_vector, inferences
