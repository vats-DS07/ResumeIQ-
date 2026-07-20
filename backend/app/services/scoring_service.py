import re
from typing import List, Dict

class ScoringService:
    @staticmethod
    def calculate_sub_scores(
        raw_text: str,
        page_count: int,
        extracted_skills: List[str],
        missing_skills: List[str],
        job_description: str = None
    ) -> Dict[str, int]:
        """
        Calculates the 5 deterministic sub-scores:
        - Formatting (0-100)
        - Keyword Match (0-100)
        - Structure (0-100)
        - Readability (0-100)
        - Length (0-100)
        """
        text_lower = raw_text.lower()
        
        # 1. Structure Score
        # Check for standard resume sections
        sections = {
            "experience": ["experience", "work history", "employment", "professional history", "career"],
            "education": ["education", "academic", "university", "college", "degrees"],
            "skills": ["skills", "technologies", "expertise", "core competencies", "technical skills"],
            "projects": ["projects", "personal projects", "academic projects", "key projects"],
            "contact": ["email", "phone", "contact", "linkedin", "github"]
        }
        
        found_sections = 0
        for key, synonyms in sections.items():
            if any(re.search(rf"\b{syn}\b", text_lower) for syn in synonyms):
                found_sections += 1
                
        # Structure score is 20 points per main section found
        structure_score = min(100, found_sections * 20)
        
        # Add slight penalty for missing contact info in raw text (like email or phone formats)
        has_email = bool(re.search(r"[\w\.-]+@[\w\.-]+\.\w+", raw_text))
        has_phone = bool(re.search(r"\b\d{3}[-.]?\d{3}[-.]?\d{4}\b|\b\+\d{1,2}\s?\d{10}\b", raw_text))
        if not has_email or not has_phone:
            structure_score = max(30, structure_score - 15)

        # 2. Formatting Score
        # Simple heuristics for formatting: bullets presence, sentence starts, line margins, and structure consistency
        bullet_points = len(re.findall(r"^[•\-\*]\s|^\s*[•\-\*]\s", raw_text, re.MULTILINE))
        
        formatting_score = 70  # Baseline
        if bullet_points > 15:
            formatting_score += 20
        elif bullet_points > 5:
            formatting_score += 10
        else:
            formatting_score -= 15  # Poor formatting, likely just paragraphs
            
        # Check line spacing/average lines length consistency
        lines = [line.strip() for line in raw_text.split("\n") if line.strip()]
        if lines:
            avg_line_len = sum(len(l) for l in lines) / len(lines)
            if 30 <= avg_line_len <= 80:
                formatting_score += 10
            else:
                formatting_score -= 5
        
        formatting_score = max(0, min(100, formatting_score))

        # 3. Keyword Match Score
        # Matches extracted vs missing skills. If job description is provided, we check for presence of keywords.
        keyword_score = 75  # Default baseline if no skills or JD
        
        total_skills_count = len(extracted_skills) + len(missing_skills)
        if total_skills_count > 0:
            skills_ratio = len(extracted_skills) / total_skills_count
            keyword_score = int(skills_ratio * 100)
            
        if job_description:
            # Check overlap of words from JD in resume
            jd_words = set(re.findall(r"\b\w{4,}\b", job_description.lower()))
            resume_words = set(re.findall(r"\b\w{4,}\b", text_lower))
            
            # Filter out common stop words if necessary, but simple intersection size ratio is fine
            if jd_words:
                overlap = jd_words.intersection(resume_words)
                jd_match_ratio = len(overlap) / len(jd_words)
                # Weighted blend of skills ratio and word matching
                keyword_score = int(0.6 * keyword_score + 0.4 * (jd_match_ratio * 100))
                
        keyword_score = max(0, min(100, keyword_score))

        # 4. Readability Score
        # Estimate using sentence and word length heuristics (Flesch-Kincaid approximation)
        words = re.findall(r"\b\w+\b", raw_text)
        sentences = [s for s in re.split(r"[.!?]\s", raw_text) if s.strip()]
        
        total_words = len(words)
        total_sentences = len(sentences)
        
        if total_sentences > 0 and total_words > 0:
            avg_sentence_length = total_words / total_sentences
            
            # Syllable approximation: count vowels (crude but fast for readability heuristics)
            def count_syllables(word_list):
                syllable_count = 0
                for word in word_list:
                    word_clean = word.lower()
                    vowels = "aeiouy"
                    count = 0
                    if len(word_clean) > 0 and word_clean[0] in vowels:
                        count += 1
                    for index in range(1, len(word_clean)):
                        if word_clean[index] in vowels and word_clean[index - 1] not in vowels:
                            count += 1
                    if word_clean.endswith("e"):
                        count -= 1
                    if count == 0:
                        count += 1
                    syllable_count += count
                return syllable_count
                
            total_syllables = count_syllables(words)
            avg_syllables_per_word = total_syllables / total_words
            
            # Flesch Reading Ease approximation
            flesch_score = 206.835 - (1.015 * avg_sentence_length) - (84.6 * avg_syllables_per_word)
            
            # Target readability for professional resume is 40-70 (college level, clear and professional).
            # Convert Flesch score to a 0-100 score where 55 is perfect (100 pts), and it decays as it gets too hard or too simple.
            if 40 <= flesch_score <= 70:
                readability_score = 90 + int((15 - abs(flesch_score - 55)) * 0.6)
            elif flesch_score < 40:
                # Too complex
                readability_score = max(30, int(90 - (40 - flesch_score) * 1.5))
            else:
                # Too simple/childish
                readability_score = max(50, int(90 - (flesch_score - 70) * 1.2))
        else:
            readability_score = 50
            
        readability_score = max(0, min(100, readability_score))

        # 5. Length Score
        # Ideal resume is 1 or 2 pages.
        if page_count == 1:
            length_score = 100
        elif page_count == 2:
            length_score = 95
        elif page_count == 3:
            length_score = 80
        elif page_count > 3:
            length_score = max(40, 100 - (page_count - 2) * 15)
        else:
            length_score = 30
            
        return {
            "Formatting": formatting_score,
            "Keyword Match": keyword_score,
            "Structure": structure_score,
            "Readability": readability_score,
            "Length": length_score
        }

    @classmethod
    def calculate_hybrid_score(
        cls,
        raw_text: str,
        page_count: int,
        extracted_skills: List[str],
        missing_skills: List[str],
        ai_score: int,
        job_description: str = None
    ) -> tuple:
        """
        Calculates subscores and combines them with Gemini AI qualitative score.
        Formula: final_score = round(0.6 * avg(sub_scores) + 0.4 * ai_score)
        Returns: (final_score, sub_scores_dict)
        """
        sub_scores = cls.calculate_sub_scores(
            raw_text, page_count, extracted_skills, missing_skills, job_description
        )
        avg_sub_score = sum(sub_scores.values()) / len(sub_scores)
        final_score = round(0.6 * avg_sub_score + 0.4 * ai_score)
        
        # Clamp to 0-100
        final_score = max(0, min(100, final_score))
        
        return final_score, sub_scores
