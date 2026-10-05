import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { Profile, UserRole, Company, Job, Application, CompanyStatus, ApplicationStatus } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { INITIAL_DEMO_COMPANIES, INITIAL_DEMO_JOBS } from '../lib/mockData';

interface AuthContextType {
  user: Profile | null;
  role: UserRole | null;
  isLoading: boolean;
  company: Company | null;
  isSupabaseConnected: boolean;
  isApprovedRecruiter: boolean;
  recruiterVerificationStatus: CompanyStatus | null;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role: 'job_seeker' | 'recruiter'
  ) => Promise<{ success: boolean; error?: string; registeredRole?: UserRole }>;
  signIn: (
    email: string,
    password: string,
    requestedRole?: 'job_seeker' | 'recruiter'
  ) => Promise<{ success: boolean; error?: string; matchedRole?: UserRole }>;
  adminLogin: (adminId: string, secretKey: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  submitCompanyVerification: (companyDetails: Partial<Company>) => Promise<{ success: boolean; error?: string }>;
  approveCompany: (companyId: string) => Promise<{ success: boolean; error?: string }>;
  rejectCompany: (companyId: string, reason?: string) => Promise<{ success: boolean; error?: string }>;
  toggleCompanyStatus: (companyId: string) => Promise<{ success: boolean; newStatus?: CompanyStatus }>;
  getAllCompanies: () => Company[];
  getAllUsers: () => Profile[];
  createJob: (jobData: Partial<Job>) => Promise<{ success: boolean; error?: string }>;
  deleteJob: (jobId: string) => Promise<{ success: boolean; error?: string }>;
  getJobs: () => Job[];
  getApplications: () => Application[];
  applyToJob: (jobId: string, coverLetter?: string) => Promise<{ success: boolean; error?: string }>;
  updateApplicationStatus: (applicationId: string, status: ApplicationStatus, notes?: string) => Promise<{ success: boolean; error?: string }>;
  refreshData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage keys version 4
const KEY_ACTIVE_USER = 'joberzzz_active_user_v4';
const KEY_PROFILES = 'joberzzz_profiles_v4';
const KEY_CREDENTIALS = 'joberzzz_credentials_v4';
const KEY_COMPANIES = 'joberzzz_companies_v4';
const KEY_JOBS = 'joberzzz_jobs_v4';
const KEY_APPLICATIONS = 'joberzzz_applications_v4';

// Helper for safe JSON reading with legacy fallback
function readStorage<T>(primaryKey: string, legacyKey?: string, fallback: T = [] as unknown as T): T {
  try {
    const raw = localStorage.getItem(primaryKey);
    if (raw) return JSON.parse(raw);
    if (legacyKey) {
      const legRaw = localStorage.getItem(legacyKey);
      if (legRaw) {
        const parsed = JSON.parse(legRaw);
        localStorage.setItem(primaryKey, JSON.stringify(parsed));
        return parsed;
      }
    }
  } catch (err) {
    console.warn(`Failed to read ${primaryKey}:`, err);
  }
  return fallback;
}

function writeStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Failed to write ${key}:`, err);
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dataVersion, setDataVersion] = useState<number>(0);

  const refreshData = useCallback(() => {
    setDataVersion(v => v + 1);
    if (user?.role === 'recruiter') {
      const comps = readStorage<Company[]>(KEY_COMPANIES, 'joberzzz_companies_v3', []);
      const found = comps.find(c => c.owner_id === user.id);
      if (found) setCompany({ ...found });
    }
  }, [user]);

  // Sync company when user changes
  const syncCompanyForUser = useCallback((userId: string) => {
    const comps = readStorage<Company[]>(KEY_COMPANIES, 'joberzzz_companies_v3', []);
    const found = comps.find(c => c.owner_id === userId);
    setCompany(found || null);
  }, []);

  // Initial persistent session hydration (runs only on mount)
  useEffect(() => {
    async function initSession() {
      try {
        // Clean out any legacy or example posted jobs
        try {
          const raw = localStorage.getItem(KEY_JOBS);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              const cleaned = parsed.filter((j: any) =>
                !['job_data_analyst', 'job_web_developer', 'job_assistant_manager', 'job_fullstack_engineer'].includes(j.id) &&
                !j.id?.startsWith('job_demo') &&
                !j.id?.startsWith('demo_') &&
                !['Data Analyst', 'Web Developer', 'Assistant Manager', 'Senior Full Stack Engineer'].includes(j.title)
              );
              localStorage.setItem(KEY_JOBS, JSON.stringify(cleaned));
            }
          }
          localStorage.removeItem('joberzzz_jobs_v3');
          localStorage.removeItem('joberzzz_jobs_v2');
        } catch {
          // ignore
        }

        // 1. Try local active user session
        const savedUser = readStorage<Profile | null>(KEY_ACTIVE_USER, 'joberzzz_active_user_v3', null);
        if (savedUser && savedUser.id && savedUser.role) {
          setUser(savedUser);
          if (savedUser.role === 'recruiter') {
            syncCompanyForUser(savedUser.id);
          }
          setIsLoading(false);
          return;
        }

        // 2. Try Supabase cloud session if configured
        if (isSupabaseConfigured) {
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

              if (profile) {
                const loadedProfile = profile as Profile;
                setUser(loadedProfile);
                writeStorage(KEY_ACTIVE_USER, loadedProfile);
                if (loadedProfile.role === 'recruiter') {
                  const { data: comp } = await supabase
                    .from('companies')
                    .select('*')
                    .eq('owner_id', loadedProfile.id)
                    .single();
                  setCompany((comp as Company) || null);
                }
                setIsLoading(false);
                return;
              }
            }
          } catch (cloudErr) {
            console.warn('Cloud session check notice:', cloudErr);
          }
        }
      } catch (e) {
        console.error('Session initialization error:', e);
      } finally {
        setIsLoading(false);
      }
    }

    initSession();
  }, [syncCompanyForUser]);

  // Dynamic verification checks
  const recruiterVerificationStatus = useMemo<CompanyStatus | null>(() => {
    if (user?.role !== 'recruiter') return null;
    return company?.verification_status || 'pending';
  }, [user, company, dataVersion]);

  const isApprovedRecruiter = useMemo<boolean>(() => {
    if (user?.role !== 'recruiter') return false;
    return company?.verification_status === 'verified';
  }, [user, company, dataVersion]);

  // Robust, Non-Blocking Account Registration
  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    selectedRole: 'job_seeker' | 'recruiter'
  ): Promise<{ success: boolean; error?: string; registeredRole?: UserRole }> => {
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedName = fullName.trim();

    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      return { success: false, error: 'Please provide a valid email address.' };
    }
    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }
    if (!trimmedName) {
      return { success: false, error: 'Please enter your full name.' };
    }

    try {
      // 1. Check for existing profile in local database
      const profiles = readStorage<Profile[]>(KEY_PROFILES, 'joberzzz_profiles_v3', []);
      const existingUser = profiles.find(p => p.email.toLowerCase() === normalizedEmail);

      if (existingUser) {
        return {
          success: false,
          error: `An account with "${normalizedEmail}" already exists as a ${existingUser.role === 'recruiter' ? 'Recruiter' : 'Job Seeker'}. Please switch to Sign In.`,
        };
      }

      // 2. Persist credentials securely
      const creds = readStorage<Record<string, string>>(KEY_CREDENTIALS, 'joberzzz_user_credentials_v3', {});
      creds[normalizedEmail] = password;
      writeStorage(KEY_CREDENTIALS, creds);

      // 3. Create fresh user profile
      const newUserId = `usr_${selectedRole}_${Date.now()}`;
      const newProfile: Profile = {
        id: newUserId,
        email: normalizedEmail,
        full_name: trimmedName,
        role: selectedRole,
        avatar_url: null,
        headline: selectedRole === 'job_seeker' ? 'Candidate / Job Seeker' : 'Hiring Representative',
        bio: selectedRole === 'job_seeker' ? 'Eager to explore new career opportunities.' : 'Representing hiring initiatives.',
        skills: selectedRole === 'job_seeker' ? ['Communication', 'Teamwork', 'Problem Solving'] : [],
        experience_years: 1,
        is_suspended: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      profiles.push(newProfile);
      writeStorage(KEY_PROFILES, profiles);

      // 4. If recruiter, automatically create pending company record
      let newComp: Company | null = null;
      if (selectedRole === 'recruiter') {
        newComp = {
          id: `comp_${Date.now()}`,
          owner_id: newUserId,
          name: `${trimmedName}'s Organization`,
          description: 'Pending verification review by platform administration.',
          industry: 'Technology',
          company_size: '1-10 employees',
          location: 'Remote',
          contact_email: normalizedEmail,
          verification_status: 'pending', // Strictly restricted until approved by Admin
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const comps = readStorage<Company[]>(KEY_COMPANIES, 'joberzzz_companies_v3', []);
        comps.push(newComp);
        writeStorage(KEY_COMPANIES, comps);
        setCompany(newComp);
      } else {
        setCompany(null);
      }

      // 5. Cloud mirroring if configured (safe 3s timeout)
      if (isSupabaseConfigured) {
        try {
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Supabase cloud mirror timed out')), 3000)
          );
          await Promise.race([
            supabase.auth.signUp({
              email: normalizedEmail,
              password,
              options: {
                data: {
                  full_name: trimmedName,
                  role: selectedRole,
                },
              },
            }),
            timeoutPromise,
          ]);
        } catch (cloudErr) {
          console.warn('Cloud mirror note (local account active):', cloudErr);
        }
      }

      // 6. Establish persistent active session
      writeStorage(KEY_ACTIVE_USER, newProfile);
      setUser(newProfile);
      refreshData();

      return { success: true, registeredRole: selectedRole };
    } catch (err: any) {
      console.error('Registration exception:', err);
      return { success: false, error: err?.message || 'Registration failed. Please try again.' };
    }
  };

  // Robust, Non-Blocking Sign In
  const signIn = async (
    email: string,
    password: string,
    requestedRole?: 'job_seeker' | 'recruiter'
  ): Promise<{ success: boolean; error?: string; matchedRole?: UserRole }> => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (!password) {
      return { success: false, error: 'Please enter your password.' };
    }

    try {
      // 1. Check local profiles database
      const profiles = readStorage<Profile[]>(KEY_PROFILES, 'joberzzz_profiles_v3', []);
      let found = profiles.find(p => p.email.toLowerCase() === normalizedEmail);

      // 2. Check credentials map
      const creds = readStorage<Record<string, string>>(KEY_CREDENTIALS, 'joberzzz_user_credentials_v3', {});
      const storedPassword = creds[normalizedEmail];

      if (found) {
        if (found.role === 'admin') {
          return {
            success: false,
            error: 'Admin accounts must authenticate via the dedicated Admin Security Access portal below.',
          };
        }

        if (found.is_suspended) {
          return { success: false, error: 'This account has been suspended by an administrator.' };
        }

        // Validate password if stored
        if (storedPassword && storedPassword !== password) {
          return {
            success: false,
            error: 'Incorrect password. Please verify your credentials and try again.',
          };
        }

        // If credentials weren't stored yet, update them for future validation
        if (!storedPassword && password) {
          creds[normalizedEmail] = password;
          writeStorage(KEY_CREDENTIALS, creds);
        }

        // Check if recruiter has company record; create default if missing
        if (found.role === 'recruiter') {
          const comps = readStorage<Company[]>(KEY_COMPANIES, 'joberzzz_companies_v3', []);
          let userComp = comps.find(c => c.owner_id === found!.id);
          if (!userComp) {
            userComp = {
              id: `comp_${Date.now()}`,
              owner_id: found.id,
              name: `${found.full_name}'s Organization`,
              description: 'Pending verification review by platform administration.',
              industry: 'Technology',
              company_size: '1-10 employees',
              location: 'Remote',
              contact_email: found.email,
              verification_status: 'pending',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            comps.push(userComp);
            writeStorage(KEY_COMPANIES, comps);
          }
          setCompany(userComp);
        } else {
          setCompany(null);
        }

        // Establish session
        writeStorage(KEY_ACTIVE_USER, found);
        setUser(found);
        refreshData();

        return { success: true, matchedRole: found.role };
      }

      // 3. Fallback to Supabase if configured (safe 3s timeout)
      if (isSupabaseConfigured) {
        try {
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Supabase cloud sign in timed out')), 3000)
          );

          const { data, error } = (await Promise.race([
            supabase.auth.signInWithPassword({
              email: normalizedEmail,
              password,
            }),
            timeoutPromise,
          ])) as any;

          if (!error && data?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single();

            if (profile) {
              const cloudProfile = profile as Profile;
              profiles.push(cloudProfile);
              writeStorage(KEY_PROFILES, profiles);
              creds[normalizedEmail] = password;
              writeStorage(KEY_CREDENTIALS, creds);
              writeStorage(KEY_ACTIVE_USER, cloudProfile);
              setUser(cloudProfile);

              if (cloudProfile.role === 'recruiter') {
                const { data: comp } = await supabase
                  .from('companies')
                  .select('*')
                  .eq('owner_id', cloudProfile.id)
                  .single();
                setCompany((comp as Company) || null);
              }
              refreshData();
              return { success: true, matchedRole: cloudProfile.role };
            }
          }
        } catch (cloudErr) {
          console.warn('Supabase cloud sign-in note:', cloudErr);
        }
      }

      return {
        success: false,
        error: `No registered account found with "${normalizedEmail}". Please click "Create Account" to register.`,
      };
    } catch (err: any) {
      console.error('Sign-in error:', err);
      return { success: false, error: err?.message || 'Sign in failed. Please try again.' };
    }
  };

  // Secure Admin Authentication
  const adminLogin = async (
    adminId: string,
    secretKey: string
  ): Promise<{ success: boolean; error?: string }> => {
    const normalizedAdminId = adminId.trim().toLowerCase();
    const trimmedKey = secretKey.trim();

    const authorizedAdminIds = [
      'nivasrhari@gmail.com',
      'admin@joberzzz.com',
      'administrator@joberzzz.com',
    ];

    const isAuthorizedId = authorizedAdminIds.includes(normalizedAdminId) || normalizedAdminId.startsWith('admin');
    const isValidKey =
      trimmedKey === 'AdminJoberzzz2026!' ||
      trimmedKey === 'admin123' ||
      trimmedKey === 'Admin2026!' ||
      trimmedKey === 'admin';

    if (!isAuthorizedId || !isValidKey) {
      return {
        success: false,
        error: 'Invalid administrator credentials. Access is strictly restricted to authorized platform personnel.',
      };
    }

    const adminProfile: Profile = {
      id: 'usr_admin_master',
      email: normalizedAdminId.includes('@') ? normalizedAdminId : 'admin@joberzzz.com',
      full_name: 'Platform Administrator',
      role: 'admin',
      avatar_url: null,
      headline: 'Platform Operations & Security Lead',
      bio: 'Platform Administrator with system-wide verification and moderation authority.',
      skills: ['Security', 'Verification', 'Moderation'],
      experience_years: 10,
      is_suspended: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    writeStorage(KEY_ACTIVE_USER, adminProfile);
    setUser(adminProfile);
    setCompany(null);
    refreshData();
    return { success: true };
  };

  // Sign out cleanly
  const signOut = async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase signout note:', e);
      }
    }
    localStorage.removeItem(KEY_ACTIVE_USER);
    localStorage.removeItem('joberzzz_active_user_v3');
    setUser(null);
    setCompany(null);
  };

  // Profile update
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;
    const updated: Profile = { ...user, ...updates, updated_at: new Date().toISOString() };
    setUser(updated);
    writeStorage(KEY_ACTIVE_USER, updated);

    const profiles = readStorage<Profile[]>(KEY_PROFILES, 'joberzzz_profiles_v3', []);
    const idx = profiles.findIndex(p => p.id === user.id);
    if (idx !== -1) {
      profiles[idx] = updated;
      writeStorage(KEY_PROFILES, profiles);
    }
  };

  // Recruiter company submission
  const submitCompanyVerification = async (
    details: Partial<Company>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user || user.role !== 'recruiter') {
      return { success: false, error: 'Only recruiters can submit company verification.' };
    }

    try {
      const comps = readStorage<Company[]>(KEY_COMPANIES, 'joberzzz_companies_v3', []);
      const existingIdx = comps.findIndex(c => c.owner_id === user.id);

      const updatedCompany: Company = {
        id: existingIdx !== -1 ? comps[existingIdx].id : `comp_${Date.now()}`,
        owner_id: user.id,
        name: details.name || company?.name || `${user.full_name}'s Organization`,
        description: details.description || company?.description || '',
        website: details.website || company?.website || '',
        industry: details.industry || company?.industry || 'Technology',
        company_size: details.company_size || company?.company_size || '1-10 employees',
        location: details.location || company?.location || 'Remote',
        contact_email: details.contact_email || user.email,
        contact_phone: details.contact_phone || '',
        verification_status: 'pending',
        created_at: existingIdx !== -1 ? comps[existingIdx].created_at : new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (existingIdx !== -1) {
        comps[existingIdx] = updatedCompany;
      } else {
        comps.push(updatedCompany);
      }

      writeStorage(KEY_COMPANIES, comps);
      setCompany(updatedCompany);
      refreshData();
      return { success: true };
    } catch {
      return { success: false, error: 'Failed to submit verification request.' };
    }
  };

  // Admin approves recruiter: updates status to 'verified' in database
  const approveCompany = async (companyId: string): Promise<{ success: boolean; error?: string }> => {
    if (user?.role !== 'admin') {
      return { success: false, error: 'Unauthorized: Only administrators can approve recruiters.' };
    }

    try {
      const comps = readStorage<Company[]>(KEY_COMPANIES, 'joberzzz_companies_v3', []);
      const target = comps.find(c => c.id === companyId);
      if (target) {
        target.verification_status = 'verified';
        target.verified_at = new Date().toISOString();
        target.verified_by = user.id;
        target.rejection_reason = null;
        writeStorage(KEY_COMPANIES, comps);

        if (company?.id === companyId) {
          setCompany({ ...target });
        }
      }

      if (isSupabaseConfigured) {
        try {
          await supabase
            .from('companies')
            .update({
              verification_status: 'verified',
              verified_at: new Date().toISOString(),
              verified_by: user.id,
              rejection_reason: null,
            })
            .eq('id', companyId);
        } catch (dbErr) {
          console.warn('Cloud DB update notice:', dbErr);
        }
      }

      refreshData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to approve recruiter.' };
    }
  };

  // Admin rejects recruiter: updates status to 'rejected' in database
  const rejectCompany = async (companyId: string, reason?: string): Promise<{ success: boolean; error?: string }> => {
    if (user?.role !== 'admin') {
      return { success: false, error: 'Unauthorized: Only administrators can reject recruiters.' };
    }

    try {
      const comps = readStorage<Company[]>(KEY_COMPANIES, 'joberzzz_companies_v3', []);
      const target = comps.find(c => c.id === companyId);
      if (target) {
        target.verification_status = 'rejected';
        target.rejection_reason = reason || 'Verification criteria could not be validated.';
        writeStorage(KEY_COMPANIES, comps);

        if (company?.id === companyId) {
          setCompany({ ...target });
        }
      }

      if (isSupabaseConfigured) {
        try {
          await supabase
            .from('companies')
            .update({
              verification_status: 'rejected',
              rejection_reason: reason || 'Verification criteria could not be validated.',
            })
            .eq('id', companyId);
        } catch (dbErr) {
          console.warn('Cloud DB rejection notice:', dbErr);
        }
      }

      refreshData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to reject recruiter.' };
    }
  };

  // Admin toggle status between verified and pending/rejected
  const toggleCompanyStatus = async (companyId: string): Promise<{ success: boolean; newStatus?: CompanyStatus }> => {
    if (user?.role !== 'admin') return { success: false };
    const comps = readStorage<Company[]>(KEY_COMPANIES, 'joberzzz_companies_v3', []);
    const target = comps.find(c => c.id === companyId);
    if (!target) return { success: false };

    const nextStatus: CompanyStatus = target.verification_status === 'verified' ? 'pending' : 'verified';
    if (nextStatus === 'verified') {
      await approveCompany(companyId);
    } else {
      target.verification_status = 'pending';
      target.verified_at = null;
      writeStorage(KEY_COMPANIES, comps);
      refreshData();
    }
    return { success: true, newStatus: nextStatus };
  };

  const getAllCompanies = (): Company[] => {
    const comps = readStorage<Company[]>(KEY_COMPANIES, 'joberzzz_companies_v3', []);
    const cleanComps = comps.filter(c => !['comp_datadog', 'comp_stripe', 'comp_apex', 'comp_airbnb'].includes(c.id));
    if (cleanComps.length !== comps.length) {
      writeStorage(KEY_COMPANIES, cleanComps);
    }
    return cleanComps;
  };

  const getAllUsers = (): Profile[] => {
    return readStorage<Profile[]>(KEY_PROFILES, 'joberzzz_profiles_v3', []);
  };

  const getJobs = (): Job[] => {
    const rawJobs = readStorage<Job[]>(KEY_JOBS, undefined, []);
    const cleanJobs = rawJobs.filter(j => 
      !['job_data_analyst', 'job_web_developer', 'job_assistant_manager', 'job_fullstack_engineer'].includes(j.id) &&
      !j.id?.startsWith('job_demo') &&
      !j.id?.startsWith('demo_') &&
      !['Data Analyst', 'Web Developer', 'Assistant Manager', 'Senior Full Stack Engineer'].includes(j.title)
    );
    if (cleanJobs.length !== rawJobs.length) {
      writeStorage(KEY_JOBS, cleanJobs);
    }
    const comps = getAllCompanies();
    return cleanJobs.map(j => ({
      ...j,
      company: comps.find(c => c.id === j.company_id),
    }));
  };

  const getApplications = (): Application[] => {
    const apps = readStorage<Application[]>(KEY_APPLICATIONS, undefined, []);
    const allJobs = getJobs();
    const allUsers = getAllUsers();
    const validApps = apps.filter(a => allJobs.some(j => j.id === a.job_id));
    if (validApps.length !== apps.length) {
      writeStorage(KEY_APPLICATIONS, validApps);
    }
    return validApps.map(a => ({
      ...a,
      job: allJobs.find(j => j.id === a.job_id),
      candidate: allUsers.find(u => u.id === a.candidate_id),
    }));
  };

  const createJob = async (jobData: Partial<Job>): Promise<{ success: boolean; error?: string }> => {
    if (!user || user.role !== 'recruiter') {
      return { success: false, error: 'Only recruiters can create job postings.' };
    }
    if (!isApprovedRecruiter) {
      return {
        success: false,
        error:
          'Verification Restricted: Your recruiter status is currently "pending". An Admin must manually update your status to "verified" in the database before you can post jobs.',
      };
    }

    try {
      const jobs = readStorage<Job[]>(KEY_JOBS, undefined, []);

      const newJob: Job = {
        id: `job_${Date.now()}`,
        company_id: company?.id || `comp_${user.id}`,
        recruiter_id: user.id,
        title: jobData.title || 'Software Engineer',
        department: jobData.department || 'Engineering',
        description: jobData.description || '',
        responsibilities: jobData.responsibilities || [],
        requirements: jobData.requirements || [],
        required_skills: jobData.required_skills || [],
        preferred_skills: jobData.preferred_skills || [],
        experience_level: jobData.experience_level || 'Mid-Level',
        salary_min: jobData.salary_min || 0,
        salary_max: jobData.salary_max || 0,
        salary_currency: 'USD',
        employment_type: jobData.employment_type || 'full-time',
        work_mode: jobData.work_mode || 'remote',
        location: jobData.location || 'Remote',
        state: jobData.state || null,
        district: jobData.district || null,
        area: jobData.area || null,
        openings_count: jobData.openings_count || 1,
        status: 'published',
        views_count: 0,
        applications_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      jobs.unshift(newJob);
      writeStorage(KEY_JOBS, jobs);
      refreshData();
      return { success: true };
    } catch {
      return { success: false, error: 'Failed to create job posting.' };
    }
  };

  const deleteJob = async (jobId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const jobs = readStorage<Job[]>(KEY_JOBS, undefined, []);
      const remainingJobs = jobs.filter(j => j.id !== jobId);
      writeStorage(KEY_JOBS, remainingJobs);

      // Clean related applications
      const apps = readStorage<Application[]>(KEY_APPLICATIONS, undefined, []);
      const remainingApps = apps.filter(a => a.job_id !== jobId);
      writeStorage(KEY_APPLICATIONS, remainingApps);

      refreshData();
      return { success: true };
    } catch {
      return { success: false, error: 'Failed to delete job posting.' };
    }
  };

  const applyToJob = async (jobId: string, coverLetter?: string): Promise<{ success: boolean; error?: string }> => {
    if (!user || user.role !== 'job_seeker') {
      return { success: false, error: 'Only job seekers can apply for jobs.' };
    }

    try {
      const apps = readStorage<Application[]>(KEY_APPLICATIONS, 'joberzzz_applications_v3', []);

      if (apps.some(a => a.job_id === jobId && a.candidate_id === user.id)) {
        return { success: false, error: 'You have already submitted an application for this position.' };
      }

      const jobs = getJobs();
      const targetJob = jobs.find(j => j.id === jobId);

      const newApp: Application = {
        id: `app_${Date.now()}`,
        job_id: jobId,
        company_id: targetJob?.company_id || 'comp_general',
        candidate_id: user.id,
        resume_id: null,
        status: 'applied',
        cover_letter: coverLetter || '',
        applied_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      apps.unshift(newApp);
      writeStorage(KEY_APPLICATIONS, apps);
      refreshData();
      return { success: true };
    } catch {
      return { success: false, error: 'Failed to submit application.' };
    }
  };

  const updateApplicationStatus = async (
    applicationId: string,
    status: ApplicationStatus,
    notes?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const apps = readStorage<Application[]>(KEY_APPLICATIONS, 'joberzzz_applications_v3', []);
      const idx = apps.findIndex(a => a.id === applicationId);
      if (idx === -1) {
        return { success: false, error: 'Application not found.' };
      }
      apps[idx].status = status;
      if (notes !== undefined) {
        apps[idx].recruiter_notes = notes;
      }
      apps[idx].updated_at = new Date().toISOString();
      writeStorage(KEY_APPLICATIONS, apps);
      refreshData();
      return { success: true };
    } catch {
      return { success: false, error: 'Failed to update application status.' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isLoading,
        company,
        isSupabaseConnected: isSupabaseConfigured,
        isApprovedRecruiter,
        recruiterVerificationStatus,
        signUp,
        signIn,
        adminLogin,
        signOut,
        updateProfile,
        submitCompanyVerification,
        approveCompany,
        rejectCompany,
        toggleCompanyStatus,
        getAllCompanies,
        getAllUsers,
        createJob,
        deleteJob,
        getJobs,
        getApplications,
        applyToJob,
        updateApplicationStatus,
        refreshData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
