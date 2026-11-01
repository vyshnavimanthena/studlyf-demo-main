import re

def evaluate_answer(question: str, user_answer: str, question_type: str, expected_answer: str = "") -> dict:
    """
    Evaluates an answer deterministically based on word count, keyword matching, and structure.
    Returns: { "score", "strengths", "gaps", "verdict", "ideal_approach" }
    """
    user_answer = user_answer.strip() if user_answer else ""
    user_lower = user_answer.lower()
    
    if not user_answer:
        return {
            "score": 0,
            "strengths": [],
            "gaps": ["No answer provided."],
            "verdict": "FAIL",
            "ideal_approach": expected_answer if expected_answer else "Provide a comprehensive answer covering the key aspects of the question."
        }

    # 1. Automatic Low-Score Detection
    cleaned_lower = re.sub(r'[^a-z\s]', '', user_lower).strip()
    weak_phrases = [
        "i dont know", "dont know", "no idea", "not sure", "idk", 
        "sorry", "cant answer", "maybe", "no", "yes", "ok", "sir", 
        "i have no idea", "i am not sure"
    ]
    
    is_weak = False
    if cleaned_lower in weak_phrases or len(cleaned_lower) < 2:
        is_weak = True
    else:
        # Check if text is just a weak phrase with minimal extra fluff
        for phrase in weak_phrases:
            if phrase in cleaned_lower and len(cleaned_lower.split()) <= len(phrase.split()) + 2:
                is_weak = True
                break
                
    if is_weak:
        return {
            "score": 15,
            "strengths": [],
            "gaps": [
                "Insufficient response depth.",
                "Did not address the actual question."
            ],
            "verdict": "FAIL",
            "ideal_approach": expected_answer if expected_answer else "Structure your answer to directly address the core concepts asked."
        }

    word_count = len(re.findall(r'\w+', user_answer))
    score = 30 # Base score for a non-trivial attempt
    strengths = []
    gaps = []
    
    # 2. Word count rule
    if word_count < 5:
        score -= 20
        gaps.append("Answer is extremely brief. Lacks required depth.")
    elif word_count < 15:
        score -= 10
        gaps.append("Answer is too short. Expand on your reasoning.")
    elif word_count > 40:
        score += 10 # Slight bump for effort, but not an automatic pass
    
    # Keyword extraction
    stopwords = {"the", "is", "at", "which", "on", "a", "an", "and", "or", "but", "to", "in", "with", "for", "of", "how", "what", "why", "when", "where", "design", "explain", "describe", "write", "this", "that", "it", "can", "will", "are", "be", "as", "from"}
    
    reference_text = expected_answer if expected_answer else question
    ref_words = set(re.findall(r'\w+', reference_text.lower()))
    keywords = {w for w in ref_words if len(w) > 3 and w not in stopwords}
    
    user_words = set(re.findall(r'\w+', user_lower))
    matched_keywords = keywords.intersection(user_words)
    
    match_ratio = len(matched_keywords) / len(keywords) if keywords else 0

    if question_type == "hr" or "resume" in question_type:
        # HR logic: clarity, confidence, communication
        hr_keywords = {"example", "because", "learned", "team", "project", "situation", "task", "action", "result", "communication", "resolved", "improved", "helped", "led", "managed", "developed", "created", "experience"}
        hr_match = len(hr_keywords.intersection(user_words))
        
        if hr_match >= 4 or match_ratio > 0.4:
            score += 45
            strengths.append("Provided detailed personal reasoning and structural examples.")
        elif hr_match >= 2 or match_ratio > 0.2:
            score += 25
            strengths.append("Provided basic personal reasoning.")
            gaps.append("Could provide more specific personal examples (e.g. STAR method).")
        elif hr_match >= 1:
            score += 10
            gaps.append("Needs much more concrete examples or structured reasoning.")
        else:
            gaps.append("Lacks concrete examples or structured personal reasoning.")
            score -= 10
            
        if word_count >= 25:
            score += 15
            strengths.append("Adequate explanation length.")
            
    else:
        # Technical/Coding logic
        if match_ratio > 0.5:
            score += 45
            strengths.append("Strong technical terminology alignment.")
        elif match_ratio > 0.25:
            score += 25
            strengths.append("Mentions some relevant technical concepts.")
            gaps.append("Missing some key technical constraints. Be more comprehensive.")
        elif match_ratio > 0.1:
            score += 10
            gaps.append("Lacks many core expected technical concepts.")
        else:
            gaps.append("Did not hit expected technical concept markers.")
            score -= 10

        if question_type == "coding" or "implement" in question.lower():
            if any(syntax in user_answer for syntax in ["{", "def ", "function", "return", "class ", "=>", "import", "const ", "let "]):
                score += 15
                strengths.append("Code structure/syntax detected.")
            else:
                gaps.append("Did not detect expected code syntax or structure.")
                score -= 15

    # Cap boundaries
    score = max(0, min(100, score))
        
    verdict = "PASS" if score >= 70 else "FAIL"
    
    ideal = expected_answer if expected_answer else "Structure your answer to directly address the core concepts asked, using appropriate terminology and examples."

    return {
        "score": score,
        "strengths": strengths,
        "gaps": gaps,
        "verdict": verdict,
        "ideal_approach": ideal
    }
