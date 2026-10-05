export type UserRole = 'job_seeker' | 'recruiter' | 'admin';

export type CompanyStatus = 'pending' | 'verified' | 'rejected';

export type JobStatus = 'draft' | 'published' | 'paused' | 'closed' | 'moderation_pending';

export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance';

export type WorkMode = 'remote' | 'hybrid' | 'on-site';

export type ApplicationStatus =
  | 'applied'
  | 'under_review'
  | 'shortlisted'
  | 'interview'
  | 'selected'
  | 'rejected'
  | 'withdrawn';

export type ReportStatus = 'pending' | 'investigating' | 'resolved' | 'dismissed';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string | null;
  phone?: string | null;
  location?: string | null;
  state?: string | null;
  district?: string | null;
  area?: string | null;
  headline?: string | null;
  bio?: string | null;
  skills: string[];
  experience_years: number;
  education?: Array<{
    school: string;
    degree: string;
    field: string;
    year: string;
  }>;
  experience?: Array<{
    title: string;
    company: string;
    period: string;
    description: string;
  }>;
  target_role?: string | null;
  preferred_location?: string | null;
  expected_salary?: number | null;
  is_suspended: boolean;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  owner_id: string;
  name: string;
  logo_url?: string | null;
  description: string;
  website?: string | null;
  industry: string;
  company_size: string;
  location: string;
  contact_email?: string | null;
  contact_phone?: string | null;
  verification_status: CompanyStatus;
  verified_at?: string | null;
  verified_by?: string | null;
  rejection_reason?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Resume {
  id: string;
  user_id: string;
  file_name: string;
  file_url: string;
  file_path: string;
  file_type: string;
  file_size_bytes: number;
  is_primary: boolean;
  parsed_text?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  company_id: string;
  recruiter_id: string;
  title: string;
  department?: string | null;
  description: string;
  responsibilities: string[];
  requirements: string[];
  required_skills: string[];
  preferred_skills: string[];
  experience_level: string;
  salary_min?: number | null;
  salary_max?: number | null;
  salary_currency: string;
  employment_type: EmploymentType;
  work_mode: WorkMode;
  location: string;
  state?: string | null;
  district?: string | null;
  area?: string | null;
  openings_count: number;
  status: JobStatus;
  deadline?: string | null;
  views_count: number;
  applications_count: number;
  created_at: string;
  updated_at: string;
  company?: Company;
}

export interface Application {
  id: string;
  job_id: string;
  company_id: string;
  candidate_id: string;
  resume_id?: string | null;
  status: ApplicationStatus;
  cover_letter?: string | null;
  recruiter_notes?: string | null;
  ats_score?: number | null;
  applied_at: string;
  updated_at: string;
  job?: Job;
  candidate?: Profile;
  resume?: Resume;
}

export interface SavedJob {
  id: string;
  user_id: string;
  job_id: string;
  created_at: string;
  job?: Job;
}

export interface ATSAudit {
  id: string;
  user_id: string;
  resume_id?: string | null;
  target_role: string;
  job_description?: string | null;
  overall_score: number;
  keyword_match_score: number;
  category_breakdown: {
    keyword_match: { score: number; explanation: string; suggestions: string[] };
    skills: { score: number; explanation: string; suggestions: string[] };
    experience: { score: number; explanation: string; suggestions: string[] };
    education: { score: number; explanation: string; suggestions: string[] };
    formatting: { score: number; explanation: string; suggestions: string[] };
    achievements: { score: number; explanation: string; suggestions: string[] };
    relevance: { score: number; explanation: string; suggestions: string[] };
  };
  matched_skills: string[];
  missing_skills: string[];
  critical_issues: string[];
  recommendations: string[];
  executive_summary: string;
  created_at: string;
}

export interface CoverLetter {
  id: string;
  user_id: string;
  job_title: string;
  company_name: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface InterviewSession {
  id: string;
  user_id: string;
  job_title: string;
  experience_level: string;
  questions: Array<{
    id: string;
    type: 'hr' | 'technical' | 'role-specific' | 'situational';
    question: string;
    suggested_structure?: string;
    user_answer?: string;
    evaluation?: {
      score: number;
      strengths: string[];
      gaps: string[];
      improvement_suggestion: string;
    };
  }>;
  overall_score?: number | null;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  target_type: 'job' | 'company' | 'user';
  target_id: string;
  reason: string;
  details?: string | null;
  status: ReportStatus;
  reviewed_by?: string | null;
  resolution_notes?: string | null;
  created_at: string;
  updated_at: string;
  reporter?: Profile;
}
