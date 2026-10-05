import { Job, Profile, Resume } from '../types';

export interface JobMatchBreakdown {
  overallMatchPct: number; // 0 - 100%
  skillsScore: number; // 0 - 20
  skillsMax: 20;
  experienceScore: number; // 0 - 20
  experienceMax: 20;
  keywordScore: number; // 0 - 20
  keywordMax: 20;
  educationScore: number; // 0 - 10
  educationMax: 10;
  relevanceScore: number; // 0 - 30
  relevanceMax: 30;

  matchingSkills: string[];
  missingRequiredSkills: string[];
  matchingPreferredSkills: string[];
  missingQualifications: string[];
  relevantExperienceSummary: string;
  compatibilityLevel: 'Exceptional Fit' | 'Strong Match' | 'Moderate Fit' | 'Low Alignment';
  canCalculate: boolean;
  reasonIfNotCalculable?: string;
}

export interface ATSResumeScoreResult {
  overallScore: number; // 0 - 100
  sectionCompleteness: number; // 0 - 25
  keywordOptimization: number; // 0 - 25
  formattingAndLength: number; // 0 - 25
  actionVerbStrength: number; // 0 - 25
  identifiedSkills: string[];
  suggestedImprovements: string[];
  analyzedAt: string;
}

// Common English stopwords to ignore in keyword extraction
const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'can\'t', 'cannot', 'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing',
  'don\'t', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t',
  'have', 'haven\'t', 'having', 'he', 'he\'d', 'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers',
  'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i', 'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if',
  'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s', 'me', 'more', 'most', 'mustn\'t',
  'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our',
  'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shan\'t', 'she', 'she\'d', 'she\'ll', 'she\'s',
  'should', 'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs',
  'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re',
  'they\'ve', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn\'t',
  'we', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when', 'when\'s',
  'where', 'where\'s', 'which', 'while', 'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t',
  'would', 'wouldn\'t', 'you', 'you\'d', 'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours', 'yourself',
  'yourselves', 'will', 'role', 'team', 'work', 'experience', 'responsible', 'requirements'
]);

// Action verbs indicator for ATS audit
const ACTION_VERBS = [
  'built', 'developed', 'architected', 'managed', 'led', 'designed', 'delivered', 'optimized',
  'increased', 'scaled', 'implemented', 'improved', 'automated', 'engineered', 'launched',
  'collaborated', 'created', 'established', 'spearheaded', 'reduced', 'deployed', 'analyzed'
];

/**
 * Extracts meaningful tokens from any text block
 */
function extractTokens(text: string): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9#+]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 2 && !STOP_WORDS.has(token));
}

/**
 * Calculates a dedicated ATS Resume Score (Score A)
 * Measures structural soundness, completeness, and ATS readability of the resume itself.
 */
export function calculateATSResumeScore(
  resume: Resume | null,
  profile: Profile | null
): ATSResumeScoreResult {
  const resumeText = resume?.parsed_text || '';
  const candidateSkills = profile?.skills || [];
  const candidateBio = profile?.bio || '';
  const candidateHeadline = profile?.headline || '';
  const fullCorpus = `${resumeText} ${candidateSkills.join(' ')} ${candidateBio} ${candidateHeadline} ${profile?.target_role || ''}`;
  const tokens = extractTokens(fullCorpus);

  // 1. Section Completeness (Max 25 pts)
  let sectionScore = 0;
  if (profile?.full_name && profile.email) sectionScore += 6;
  if (candidateHeadline.length > 5) sectionScore += 5;
  if (candidateSkills.length >= 3) sectionScore += 6;
  if (profile?.experience_years && profile.experience_years > 0) sectionScore += 4;
  if (candidateBio.length > 20 || resumeText.length > 50) sectionScore += 4;
  const sectionCompleteness = Math.min(25, sectionScore);

  // 2. Keyword Optimization (Max 25 pts)
  const uniqueTokens = new Set(tokens);
  let keywordScore = Math.min(25, Math.round((uniqueTokens.size / 30) * 25));
  if (candidateSkills.length >= 6) keywordScore = Math.max(keywordScore, 20);

  // 3. Formatting and Length (Max 25 pts)
  let formatScore = 15;
  if (resume?.file_name.endsWith('.pdf') || resume?.file_name.endsWith('.docx')) formatScore += 5;
  if (tokens.length >= 40) formatScore += 5;
  const formattingAndLength = Math.min(25, formatScore);

  // 4. Action Verb Strength (Max 25 pts)
  const lowerCorpus = fullCorpus.toLowerCase();
  const matchedVerbs = ACTION_VERBS.filter(verb => lowerCorpus.includes(verb));
  const actionVerbStrength = Math.min(25, Math.max(12, Math.round((matchedVerbs.length / 5) * 25)));

  const overallScore = Math.min(
    100,
    Math.max(50, sectionCompleteness + keywordScore + formattingAndLength + actionVerbStrength)
  );

  const suggestedImprovements: string[] = [];
  if (candidateSkills.length < 5) {
    suggestedImprovements.push('Add at least 5 technical or domain competencies to boost ATS keyword visibility.');
  }
  if (matchedVerbs.length < 3) {
    suggestedImprovements.push('Include quantifiable action verbs like "delivered", "optimized", or "architected".');
  }
  if (!profile?.target_role) {
    suggestedImprovements.push('Specify your Target Role in profile preferences to sharpen keyword alignment.');
  }

  return {
    overallScore,
    sectionCompleteness,
    keywordOptimization: keywordScore,
    formattingAndLength,
    actionVerbStrength,
    identifiedSkills: candidateSkills,
    suggestedImprovements,
    analyzedAt: new Date().toISOString(),
  };
}

/**
 * Calculates a dynamic, job-specific Resume-to-Job Match Percentage (Score B)
 * Dynamically compares the uploaded resume & profile against the specific job's
 * title, required skills, preferred skills, experience level, description, and qualifications.
 */
export function calculateJobResumeMatch(
  job: Job,
  profile: Profile | null,
  resume: Resume | null
): JobMatchBreakdown {
  // Data Validation (Rule 9):
  // Check if job data is present
  if (!job || !job.title) {
    return {
      overallMatchPct: 0,
      skillsScore: 0,
      skillsMax: 20,
      experienceScore: 0,
      experienceMax: 20,
      keywordScore: 0,
      keywordMax: 20,
      educationScore: 0,
      educationMax: 10,
      relevanceScore: 0,
      relevanceMax: 30,
      matchingSkills: [],
      missingRequiredSkills: [],
      matchingPreferredSkills: [],
      missingQualifications: [],
      relevantExperienceSummary: 'Job data unavailable.',
      compatibilityLevel: 'Low Alignment',
      canCalculate: false,
      reasonIfNotCalculable: 'Job listing requirements are missing or incomplete.',
    };
  }

  const candidateSkills = (profile?.skills || []).map(s => s.trim().toLowerCase()).filter(Boolean);
  const candidateHeadline = (profile?.headline || '').trim().toLowerCase();
  const candidateTargetRole = (profile?.target_role || '').trim().toLowerCase();
  const candidateBio = (profile?.bio || '').trim().toLowerCase();
  const candidateExperienceYears = profile?.experience_years ?? 1;
  const resumeText = (resume?.parsed_text || '').trim().toLowerCase();

  // If candidate has neither uploaded a resume nor filled skills or headline
  const hasResume = Boolean(resume && (resume.file_name || resume.parsed_text));
  const hasProfileData = candidateSkills.length > 0 || candidateHeadline.length > 0 || candidateBio.length > 0;

  if (!hasResume && !hasProfileData) {
    return {
      overallMatchPct: 0,
      skillsScore: 0,
      skillsMax: 20,
      experienceScore: 0,
      experienceMax: 20,
      keywordScore: 0,
      keywordMax: 20,
      educationScore: 0,
      educationMax: 10,
      relevanceScore: 0,
      relevanceMax: 30,
      matchingSkills: [],
      missingRequiredSkills: job.required_skills || [],
      matchingPreferredSkills: [],
      missingQualifications: ['Resume document or profile skills required to calculate match'],
      relevantExperienceSummary: 'Upload your resume or add profile skills to calculate match.',
      compatibilityLevel: 'Low Alignment',
      canCalculate: false,
      reasonIfNotCalculable: 'Upload a resume to calculate dynamic match percentage.',
    };
  }

  // Combined candidate text corpus
  const candidateCorpus = `${resumeText} ${candidateSkills.join(' ')} ${candidateHeadline} ${candidateTargetRole} ${candidateBio}`;

  // 1. SKILLS MATCH (Max 20 pts)
  const requiredSkills = (job.required_skills || []).map(s => s.trim());
  const preferredSkills = (job.preferred_skills || []).map(s => s.trim());

  const matchingSkills: string[] = [];
  const missingRequiredSkills: string[] = [];
  const matchingPreferredSkills: string[] = [];

  requiredSkills.forEach(reqSkill => {
    const lower = reqSkill.toLowerCase();
    const hasExact = candidateSkills.some(cs => cs === lower || cs.includes(lower) || lower.includes(cs));
    const hasInText = candidateCorpus.includes(lower);

    if (hasExact || hasInText) {
      matchingSkills.push(reqSkill);
    } else {
      missingRequiredSkills.push(reqSkill);
    }
  });

  preferredSkills.forEach(prefSkill => {
    const lower = prefSkill.toLowerCase();
    const hasExact = candidateSkills.some(cs => cs === lower || cs.includes(lower) || lower.includes(cs));
    if (hasExact || candidateCorpus.includes(lower)) {
      matchingPreferredSkills.push(prefSkill);
    }
  });

  let skillsScore = 0;
  if (requiredSkills.length > 0) {
    const requiredRatio = matchingSkills.length / requiredSkills.length;
    skillsScore = Math.round(requiredRatio * 17); // up to 17 pts for required
    if (preferredSkills.length > 0 && matchingPreferredSkills.length > 0) {
      skillsScore += Math.min(3, Math.round((matchingPreferredSkills.length / preferredSkills.length) * 3));
    } else if (matchingSkills.length === requiredSkills.length) {
      skillsScore += 3; // bonus for 100% required match
    }
  } else {
    // If no explicit required skills, baseline from general keyword overlap
    skillsScore = candidateSkills.length > 0 ? 15 : 10;
  }
  skillsScore = Math.min(20, Math.max(0, skillsScore));

  // 2. EXPERIENCE MATCH (Max 20 pts)
  let targetExpYears = 2; // default
  const level = (job.experience_level || '').toLowerCase();
  const titleLower = job.title.toLowerCase();

  if (level.includes('senior') || titleLower.includes('senior') || titleLower.includes('lead') || titleLower.includes('principal')) {
    targetExpYears = 5;
  } else if (level.includes('entry') || level.includes('junior') || titleLower.includes('junior') || titleLower.includes('intern')) {
    targetExpYears = 1;
  } else if (level.includes('lead') || level.includes('director') || level.includes('manager')) {
    targetExpYears = 6;
  } else {
    targetExpYears = 3; // Mid-level
  }

  let experienceScore = 0;
  if (candidateExperienceYears >= targetExpYears) {
    experienceScore = 20;
  } else {
    const ratio = candidateExperienceYears / targetExpYears;
    experienceScore = Math.max(6, Math.round(ratio * 20));
  }
  experienceScore = Math.min(20, Math.max(0, experienceScore));

  // 3. KEYWORD & DESCRIPTION RELEVANCE MATCH (Max 20 pts)
  const jobText = `${job.title} ${job.department || ''} ${job.description} ${(job.responsibilities || []).join(' ')} ${(job.requirements || []).join(' ')}`;
  const jobTokens = extractTokens(jobText);
  const uniqueJobKeywords = Array.from(new Set(jobTokens)).slice(0, 25);

  let matchedKeywordCount = 0;
  uniqueJobKeywords.forEach(kw => {
    if (candidateCorpus.includes(kw)) {
      matchedKeywordCount++;
    }
  });

  const keywordRatio = uniqueJobKeywords.length > 0 ? matchedKeywordCount / uniqueJobKeywords.length : 0.5;
  const keywordScore = Math.min(20, Math.max(3, Math.round(keywordRatio * 20)));

  // 4. EDUCATION & QUALIFICATION MATCH (Max 10 pts)
  const jobReqText = (job.requirements || []).join(' ').toLowerCase();
  let educationScore = 7; // baseline
  const missingQualifications: string[] = [];

  const mentionsDegree = candidateCorpus.includes('degree') || candidateCorpus.includes('bachelor') ||
    candidateCorpus.includes('master') || candidateCorpus.includes('bs') || candidateCorpus.includes('b.s') ||
    candidateCorpus.includes('m.s') || candidateCorpus.includes('computer science') || candidateCorpus.includes('university');

  if (jobReqText.includes('master') || jobReqText.includes('phd')) {
    if (candidateCorpus.includes('master') || candidateCorpus.includes('phd')) {
      educationScore = 10;
    } else {
      educationScore = 7;
      missingQualifications.push('Advanced degree (Master / PhD) preferred');
    }
  } else if (mentionsDegree) {
    educationScore = 10;
  } else {
    educationScore = 8;
  }

  // Check certifications if needed
  if (jobReqText.includes('aws') && !candidateCorpus.includes('aws')) {
    missingQualifications.push('AWS Cloud certification or hands-on experience');
  }
  if (jobReqText.includes('pmp') && !candidateCorpus.includes('pmp')) {
    missingQualifications.push('PMP or Agile project management certification');
  }

  // 5. JOB TITLE & DOMAIN ROLE RELEVANCE (Max 30 pts)
  // Highly discriminating factor: guarantees different roles have vastly different scores!
  const targetJobTitleTokens = extractTokens(job.title);
  const targetDeptTokens = extractTokens(job.department || '');
  const candidateTitleTokens = extractTokens(`${candidateHeadline} ${candidateTargetRole}`);

  let titleMatches = 0;
  targetJobTitleTokens.forEach(t => {
    if (candidateTitleTokens.includes(t) || candidateCorpus.includes(t)) {
      titleMatches++;
    }
  });

  let deptMatches = 0;
  targetDeptTokens.forEach(d => {
    if (candidateCorpus.includes(d)) {
      deptMatches++;
    }
  });

  const titleRatio = targetJobTitleTokens.length > 0 ? titleMatches / targetJobTitleTokens.length : 0.4;
  let relevanceScore = Math.round(titleRatio * 24);
  if (deptMatches > 0) relevanceScore += 4;
  if (candidateTargetRole && candidateTargetRole.toLowerCase().includes(job.title.toLowerCase().split(' ')[0])) {
    relevanceScore += 2;
  }

  // Baseline floor depending on skill overlap
  if (matchingSkills.length > 0) {
    relevanceScore = Math.max(relevanceScore, 8);
  } else {
    relevanceScore = Math.min(relevanceScore, 10);
  }
  relevanceScore = Math.min(30, Math.max(2, relevanceScore));

  // TOTAL COMPUTED SCORE (0 - 100)
  const totalScore = skillsScore + experienceScore + keywordScore + educationScore + relevanceScore;
  const overallMatchPct = Math.min(100, Math.max(15, totalScore));

  let compatibilityLevel: 'Exceptional Fit' | 'Strong Match' | 'Moderate Fit' | 'Low Alignment' = 'Moderate Fit';
  if (overallMatchPct >= 80) {
    compatibilityLevel = 'Exceptional Fit';
  } else if (overallMatchPct >= 65) {
    compatibilityLevel = 'Strong Match';
  } else if (overallMatchPct >= 45) {
    compatibilityLevel = 'Moderate Fit';
  } else {
    compatibilityLevel = 'Low Alignment';
  }

  const expDiff = candidateExperienceYears - targetExpYears;
  let relevantExperienceSummary = `${candidateExperienceYears} year${candidateExperienceYears === 1 ? '' : 's'} profile experience (${targetExpYears}+ years targeted)`;
  if (expDiff >= 0) {
    relevantExperienceSummary = `Meets targeted seniority (${candidateExperienceYears} yrs experience vs ${targetExpYears} yrs requirement)`;
  } else {
    relevantExperienceSummary = `Developing seniority (${candidateExperienceYears} yrs vs ${targetExpYears} yrs recommended)`;
  }

  return {
    overallMatchPct,
    skillsScore,
    skillsMax: 20,
    experienceScore,
    experienceMax: 20,
    keywordScore,
    keywordMax: 20,
    educationScore,
    educationMax: 10,
    relevanceScore,
    relevanceMax: 30,
    matchingSkills,
    missingRequiredSkills,
    matchingPreferredSkills,
    missingQualifications,
    relevantExperienceSummary,
    compatibilityLevel,
    canCalculate: true,
  };
}
