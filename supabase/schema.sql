-- ====================================================================
-- JOBERZZZ RECRUITMENT ECOSYSTEM - SUPABASE POSTGRESQL SCHEMA & RLS
-- ====================================================================

-- 1. ENUMS
CREATE TYPE public.user_role AS ENUM ('job_seeker', 'recruiter', 'admin');
CREATE TYPE public.company_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE public.job_status AS ENUM ('draft', 'published', 'paused', 'closed', 'moderation_pending');
CREATE TYPE public.employment_type AS ENUM ('full-time', 'part-time', 'contract', 'internship', 'freelance');
CREATE TYPE public.work_mode AS ENUM ('remote', 'hybrid', 'on-site');
CREATE TYPE public.application_status AS ENUM ('applied', 'under_review', 'shortlisted', 'interview', 'selected', 'rejected', 'withdrawn');
CREATE TYPE public.report_status AS ENUM ('pending', 'investigating', 'resolved', 'dismissed');

-- 2. PROFILES TABLE
-- Every authenticated user must have a corresponding profile entry.
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role public.user_role NOT NULL DEFAULT 'job_seeker',
    avatar_url TEXT,
    phone TEXT,
    location TEXT,
    headline TEXT,
    bio TEXT,
    skills TEXT[] DEFAULT '{}',
    experience_years NUMERIC(4, 1) DEFAULT 0,
    education JSONB DEFAULT '[]'::jsonb,
    experience JSONB DEFAULT '[]'::jsonb,
    target_role TEXT,
    preferred_location TEXT,
    expected_salary NUMERIC(12, 2),
    is_suspended BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. COMPANIES TABLE (Managed by Recruiters)
CREATE TABLE public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    logo_url TEXT,
    description TEXT,
    website TEXT,
    industry TEXT,
    company_size TEXT,
    location TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    verification_status public.company_status NOT NULL DEFAULT 'pending',
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES public.profiles(id),
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. RESUMES TABLE (Job Seeker resumes)
CREATE TABLE public.resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    parsed_text TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. JOBS TABLE
CREATE TABLE public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    recruiter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    department TEXT,
    description TEXT NOT NULL,
    responsibilities TEXT[] DEFAULT '{}',
    requirements TEXT[] DEFAULT '{}',
    required_skills TEXT[] DEFAULT '{}',
    preferred_skills TEXT[] DEFAULT '{}',
    experience_level TEXT NOT NULL,
    salary_min NUMERIC(12, 2),
    salary_max NUMERIC(12, 2),
    salary_currency TEXT DEFAULT 'USD',
    employment_type public.employment_type NOT NULL DEFAULT 'full-time',
    work_mode public.work_mode NOT NULL DEFAULT 'remote',
    location TEXT NOT NULL,
    openings_count INTEGER NOT NULL DEFAULT 1,
    status public.job_status NOT NULL DEFAULT 'draft',
    deadline TIMESTAMPTZ,
    views_count INTEGER NOT NULL DEFAULT 0,
    applications_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. APPLICATIONS TABLE
CREATE TABLE public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
    status public.application_status NOT NULL DEFAULT 'applied',
    cover_letter TEXT,
    recruiter_notes TEXT,
    ats_score NUMERIC(5, 2),
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_job_candidate UNIQUE(job_id, candidate_id)
);

-- 7. SAVED JOBS TABLE
CREATE TABLE public.saved_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_saved_job UNIQUE(user_id, job_id)
);

-- 8. ATS AUDITS TABLE
CREATE TABLE public.ats_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
    target_role TEXT NOT NULL,
    job_description TEXT,
    overall_score NUMERIC(5, 2) NOT NULL,
    keyword_match_score NUMERIC(5, 2) NOT NULL,
    category_breakdown JSONB NOT NULL,
    matched_skills TEXT[] DEFAULT '{}',
    missing_skills TEXT[] DEFAULT '{}',
    critical_issues TEXT[] DEFAULT '{}',
    recommendations TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. COVER LETTERS TABLE
CREATE TABLE public.cover_letters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    job_title TEXT NOT NULL,
    company_name TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. INTERVIEW SESSIONS TABLE
CREATE TABLE public.interview_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    job_title TEXT NOT NULL,
    experience_level TEXT NOT NULL,
    questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    evaluation JSONB DEFAULT '{}'::jsonb,
    overall_score NUMERIC(5, 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. REPORTS TABLE (Job / User / Company Moderation)
CREATE TABLE public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL, -- 'job', 'company', 'user'
    target_id UUID NOT NULL,
    reason TEXT NOT NULL,
    details TEXT,
    status public.report_status NOT NULL DEFAULT 'pending',
    reviewed_by UUID REFERENCES public.profiles(id),
    resolution_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- TRIGGERS & AUTOMATION
-- ====================================================================

-- Automatic profile creation on auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    assigned_role public.user_role;
    user_full_name TEXT;
BEGIN
    -- Determine role from user metadata, defaulting to job_seeker
    assigned_role := COALESCE(
        (NEW.raw_user_meta_data->>'role')::public.user_role,
        'job_seeker'::public.user_role
    );

    user_full_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        split_part(NEW.email, '@', 1)
    );

    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        role,
        avatar_url,
        phone,
        location,
        is_suspended,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        user_full_name,
        assigned_role,
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.raw_user_meta_data->>'phone',
        NEW.raw_user_meta_data->>'location',
        FALSE,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE
    SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        updated_at = NOW();

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Helper function to check if current caller is an active admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
          AND role = 'admin'
          AND is_suspended = FALSE
    );
$$;

-- Helper function to check user role
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS public.user_role
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT role FROM public.profiles
    WHERE id = auth.uid();
$$;

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ats_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cover_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES POLICIES
CREATE POLICY "Public profile viewing for verified members"
    ON public.profiles FOR SELECT
    USING (
        auth.uid() = id
        OR public.is_admin()
        OR (role = 'job_seeker' AND is_suspended = FALSE)
        OR (role = 'recruiter' AND is_suspended = FALSE)
    );

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id AND is_suspended = FALSE)
    WITH CHECK (
        auth.uid() = id
        -- Regular users cannot self-escalate to admin role
        AND (role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()) OR public.is_admin())
    );

CREATE POLICY "Admins can manage any profile"
    ON public.profiles FOR ALL
    USING (public.is_admin());

-- 2. COMPANIES POLICIES
CREATE POLICY "Anyone can view verified companies"
    ON public.companies FOR SELECT
    USING (verification_status = 'verified' OR owner_id = auth.uid() OR public.is_admin());

CREATE POLICY "Recruiters can insert their own company"
    ON public.companies FOR INSERT
    WITH CHECK (
        auth.uid() = owner_id
        AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'recruiter'
    );

CREATE POLICY "Company owners can update their company"
    ON public.companies FOR UPDATE
    USING (owner_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins can delete/manage all companies"
    ON public.companies FOR ALL
    USING (public.is_admin());

-- 3. RESUMES POLICIES
CREATE POLICY "Users can view their own resumes"
    ON public.resumes FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Recruiters can view resumes for applications to their company jobs"
    ON public.resumes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.applications a
            JOIN public.jobs j ON a.job_id = j.id
            JOIN public.companies c ON j.company_id = c.id
            WHERE a.resume_id = resumes.id
              AND (c.owner_id = auth.uid() OR j.recruiter_id = auth.uid())
        )
    );

CREATE POLICY "Users can insert their own resumes"
    ON public.resumes FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update or delete their resumes"
    ON public.resumes FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete their resumes"
    ON public.resumes FOR DELETE
    USING (user_id = auth.uid());

-- 4. JOBS POLICIES
CREATE POLICY "Published jobs are visible to all users"
    ON public.jobs FOR SELECT
    USING (
        status = 'published'
        OR recruiter_id = auth.uid()
        OR public.is_admin()
    );

CREATE POLICY "Recruiters can insert jobs for their verified company"
    ON public.jobs FOR INSERT
    WITH CHECK (
        recruiter_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.companies
            WHERE id = company_id
              AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Recruiters can update their own jobs"
    ON public.jobs FOR UPDATE
    USING (recruiter_id = auth.uid() OR public.is_admin());

CREATE POLICY "Recruiters can delete their own jobs"
    ON public.jobs FOR DELETE
    USING (recruiter_id = auth.uid() OR public.is_admin());

-- 5. APPLICATIONS POLICIES
CREATE POLICY "Job seekers can view their own applications"
    ON public.applications FOR SELECT
    USING (candidate_id = auth.uid());

CREATE POLICY "Recruiters can view applications for their company jobs"
    ON public.applications FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.jobs j
            WHERE j.id = applications.job_id
              AND j.recruiter_id = auth.uid()
        )
        OR public.is_admin()
    );

CREATE POLICY "Job seekers can submit applications"
    ON public.applications FOR INSERT
    WITH CHECK (
        candidate_id = auth.uid()
        AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'job_seeker'
    );

CREATE POLICY "Job seekers can withdraw their own application"
    ON public.applications FOR UPDATE
    USING (candidate_id = auth.uid())
    WITH CHECK (status = 'withdrawn');

CREATE POLICY "Recruiters can update application status and notes for their jobs"
    ON public.applications FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.jobs j
            WHERE j.id = applications.job_id
              AND j.recruiter_id = auth.uid()
        )
        OR public.is_admin()
    );

-- 6. SAVED JOBS POLICIES
CREATE POLICY "Users can manage their own saved jobs"
    ON public.saved_jobs FOR ALL
    USING (user_id = auth.uid());

-- 7. ATS AUDITS, COVER LETTERS, INTERVIEWS
CREATE POLICY "Users can view and manage their own ATS audits"
    ON public.ats_audits FOR ALL
    USING (user_id = auth.uid());

CREATE POLICY "Users can view and manage their own cover letters"
    ON public.cover_letters FOR ALL
    USING (user_id = auth.uid());

CREATE POLICY "Users can view and manage their own interview sessions"
    ON public.interview_sessions FOR ALL
    USING (user_id = auth.uid());

-- 8. REPORTS POLICIES
CREATE POLICY "Users can create reports"
    ON public.reports FOR INSERT
    WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "Users can view their submitted reports"
    ON public.reports FOR SELECT
    USING (reporter_id = auth.uid() OR public.is_admin());

CREATE POLICY "Only admins can update reports"
    ON public.reports FOR UPDATE
    USING (public.is_admin());

-- ====================================================================
-- STORAGE BUCKETS SETUP & SECURITY POLICIES
-- ====================================================================
-- Ensure private resumes storage bucket exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('resumes', 'resumes', false) 
ON CONFLICT (id) DO UPDATE SET public = false;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('company-logos', 'company-logos', true) 
ON CONFLICT (id) DO NOTHING;

-- Storage Policy: Users can upload their own resumes
CREATE POLICY "Users can upload their own resumes"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'resumes'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage Policy: Users can view/read their own resumes
CREATE POLICY "Users can view their own resumes"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'resumes'
    AND (
        auth.uid()::text = (storage.foldername(name))[1]
        OR public.is_admin()
        OR EXISTS (
            SELECT 1 FROM public.applications a
            JOIN public.jobs j ON a.job_id = j.id
            JOIN public.companies c ON j.company_id = c.id
            JOIN public.resumes r ON a.resume_id = r.id
            WHERE r.file_path = name
              AND (c.owner_id = auth.uid() OR j.recruiter_id = auth.uid())
        )
    )
);

-- Storage Policy: Users can delete their own resumes
CREATE POLICY "Users can delete their own resumes"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'resumes'
    AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin())
);


-- ==========================================================================
-- LOCATION FEATURE (India: State -> District / City -> Area optional)
-- Existing `location` text columns are kept for backward compatibility and
-- hold the display string, e.g. "Mattuthavani, Madurai, Tamil Nadu".
-- ==========================================================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS district TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS area TEXT;

ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS district TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS area TEXT;

CREATE INDEX IF NOT EXISTS idx_jobs_state_district ON public.jobs (state, district);
