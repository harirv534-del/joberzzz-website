import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/NotificationContext';
import { VerificationStatusPill } from '../common/VerificationStatusPill';
import { Job, Application, ApplicationStatus } from '../../types';
import { LocationSelect, LocationValue } from '../common/LocationSelect';
import { formatLocation } from '../../lib/indiaLocations';
import {
  Building2,
  PlusCircle,
  Briefcase,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  Send,
  X,
  Lock,
  ExternalLink,
  ChevronRight,
  UserCheck,
  Check,
  MapPin,
  DollarSign,
  FileText,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { RecruiterAnalyticsDashboard } from './RecruiterAnalyticsDashboard';
import { calculateJobResumeMatch } from '../../lib/matchEngine';

export const RecruiterDashboard: React.FC = () => {
  const {
    user,
    company,
    isApprovedRecruiter,
    recruiterVerificationStatus,
    createJob,
    getJobs,
    getApplications,
    submitCompanyVerification,
    updateApplicationStatus,
    refreshData
  } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'jobs' | 'candidates' | 'analytics' | 'company'>('jobs');
  const [isPostingModalOpen, setIsPostingModalOpen] = useState(false);
  const [postFeedback, setPostFeedback] = useState<{ success: boolean; msg: string } | null>(null);

  // New Job Form State
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');
  const [salaryMin, setSalaryMin] = useState<number | ''>(100000);
  const [salaryMax, setSalaryMax] = useState<number | ''>(140000);
  const [workMode, setWorkMode] = useState<'remote' | 'hybrid' | 'on-site'>('remote');
  const [location, setLocation] = useState<LocationValue>({ state: '', district: '', area: '' });

  // Verification request form state
  const [companyName, setCompanyName] = useState(company?.name || '');
  const [industry, setIndustry] = useState(company?.industry || 'Technology');
  const [website, setWebsite] = useState(company?.website || '');
  const [companySize, setCompanySize] = useState(company?.company_size || '1-10 employees');
  const [companyLocation, setCompanyLocation] = useState(company?.location || '');
  const [companyDesc, setCompanyDesc] = useState(company?.description || '');
  const [verificationFeedback, setVerificationFeedback] = useState<string | null>(null);

  const allJobs = getJobs();
  const companyJobs = allJobs.filter(j => j.company_id === company?.id || j.recruiter_id === user?.id);

  const allApplications = getApplications();
  const companyApplications = allApplications.filter(
    a => a.company_id === company?.id || companyJobs.some(j => j.id === a.job_id)
  );

  // Dynamic Resume-to-Job Matching Calculator for Applicants
  const calculateApplicantMatchPercentage = (app: Application): number => {
    const targetJob = companyJobs.find(j => j.id === app.job_id);
    if (!targetJob) return 75;
    const match = calculateJobResumeMatch(targetJob, app.candidate || null, app.resume || null);
    return match.overallMatchPct;
  };

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isApprovedRecruiter) {
      setPostFeedback({
        success: false,
        msg: 'Posting Restricted: Recruiter verification status is currently pending. Admin must manually verify your company in the database first.'
      });
      toast.warning(
        'Posting Restricted: Recruiter verification status is currently pending.',
        'Verification required'
      );
      return;
    }

    if (!title.trim() || !description.trim() || !skills.trim()) {
      setPostFeedback({ success: false, msg: 'Please fill in all required job fields.' });
      toast.error('Please fill in all required job fields.');
      return;
    }

    if (!location.state || !location.district) {
      setPostFeedback({ success: false, msg: 'Please select the job State and District / City.' });
      toast.error('Please select the job State and District / City.');
      return;
    }

    setPostFeedback(null);
    const parsedSkills = skills.split(',').map(s => s.trim()).filter(Boolean);

    const res = await createJob({
      title: title.trim(),
      department: department.trim(),
      description: description.trim(),
      required_skills: parsedSkills,
      salary_min: Number(salaryMin) || 0,
      salary_max: Number(salaryMax) || 0,
      work_mode: workMode,
      location: formatLocation(location.state, location.district, location.area),
      state: location.state,
      district: location.district,
      area: location.area || null,
      responsibilities: [
        'Deliver high-quality scalable software architecture.',
        'Collaborate across cross-functional teams to fulfill roadmap goals.',
        'Maintain high automated test coverage, reliability, and code quality.'
      ],
      requirements: [
        'Proven professional domain experience.',
        'Strong grasp of required technological stack.',
        'Demonstrated ability to write clean, maintainable, and efficient code.'
      ]
    });

    if (res.success) {
      setPostFeedback({ success: true, msg: 'Job posting published successfully!' });
      toast.success(`Job "${title.trim()}" published successfully!`, 'Job posted');
      refreshData();
      setTimeout(() => {
        setIsPostingModalOpen(false);
        setTitle('');
        setDescription('');
        setSkills('');
        setLocation({ state: '', district: '', area: '' });
        setPostFeedback(null);
      }, 1200);
    } else {
      setPostFeedback({ success: false, msg: res.error || 'Failed to publish job' });
      toast.error(res.error || 'Failed to publish job', 'Error posting job');
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await submitCompanyVerification({
      name: companyName.trim(),
      industry: industry.trim(),
      website: website.trim(),
      company_size: companySize,
      location: companyLocation.trim(),
      description: companyDesc.trim(),
    });
    if (res.success) {
      setVerificationFeedback('Company verification details updated and submitted to Admin for database verification.');
      toast.success(
        'Company verification details submitted to Admin for review.',
        'Verification updated'
      );
      refreshData();
    } else {
      toast.error('Failed to update company verification details.');
    }
  };

  return (
    <div className="space-y-6">
      {/* 
        Visually prominent 'Pending Approval' banner for non-verified recruiters 
        using Blue + White corporate styling with subtle pill component
      */}
      {!isApprovedRecruiter ? (
        <div className="rounded-2xl bg-blue-600 text-white p-6 shadow-sm border border-blue-500 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center shrink-0 border border-white/20 text-amber-300">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-base sm:text-lg font-bold tracking-tight text-white">
                    Recruiter Status: Verification Pending Approval
                  </h3>
                  <VerificationStatusPill status={recruiterVerificationStatus} />
                </div>
                <p className="text-xs text-blue-100 mt-1.5 leading-relaxed max-w-2xl">
                  Your recruiter account and company registration have been submitted to Platform Administration. You are restricted from publishing job openings until an Admin manually reviews and updates your verification status to <strong>'verified'</strong> in the database.
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('company')}
              className="py-2.5 px-4 rounded-xl bg-white hover:bg-blue-50 text-blue-700 text-xs font-bold whitespace-nowrap transition-colors shadow-xs cursor-pointer flex items-center gap-1.5 self-start md:self-auto"
            >
              <span>Review Organization Profile</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-base font-bold text-slate-900">
                  {company?.name || 'Recruiter Organization'} — Verified
                </span>
                <VerificationStatusPill status="verified" />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Authorized to publish job openings, review applicants, and inspect candidate match percentages.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsPostingModalOpen(true)}
            className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm shadow-blue-500/20 cursor-pointer flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Job Posting</span>
          </button>
        </div>
      )}

      {/* Recruiter Tab Navigation */}
      <div className="flex items-center justify-between border-b border-blue-100 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'jobs'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50'
            }`}
          >
            Posted Jobs ({companyJobs.length})
          </button>

          <button
            onClick={() => setActiveTab('candidates')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'candidates'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50'
            }`}
          >
            Applicant Pipeline ({companyApplications.length})
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Performance & Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('company')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'company'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50'
            }`}
          >
            <span>Company Profile</span>
            <VerificationStatusPill status={recruiterVerificationStatus} showIcon={false} />
          </button>
        </div>

        {/* Job Posting Action Button */}
        {isApprovedRecruiter && (
          <button
            onClick={() => setIsPostingModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-500/20 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post New Job</span>
          </button>
        )}
      </div>

      {/* TAB: POSTED JOBS */}
      {activeTab === 'jobs' && (
        <div className="space-y-4">
          {companyJobs.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
              <Briefcase className="w-12 h-12 text-blue-400 mx-auto mb-2" />
              <h3 className="text-base font-bold text-slate-900 mb-1">No Jobs Posted Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-5 leading-relaxed">
                {isApprovedRecruiter
                  ? 'Start publishing open roles to receive qualified applicants matched to your requirements.'
                  : 'Your organization status is currently pending admin verification. Once verified, you will be able to post jobs here.'}
              </p>
              {isApprovedRecruiter && (
                <button
                  onClick={() => setIsPostingModalOpen(true)}
                  className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-500/20 cursor-pointer inline-flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create First Job</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {companyJobs.map(job => (
                <div
                  key={job.id}
                  className="bg-white border border-slate-200 hover:border-blue-300 rounded-xl p-5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h4 className="font-bold text-slate-900 text-base">{job.title}</h4>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {job.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mb-2">
                      Department: {job.department || 'Engineering'} • Mode: {job.work_mode} • Location: {job.location || 'Remote'}
                    </p>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                      {job.description}
                    </p>

                    {job.required_skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {job.required_skills.slice(0, 4).map((s, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      Applications Received:{' '}
                      <strong className="text-blue-600">
                        {companyApplications.filter(a => a.job_id === job.id).length}
                      </strong>
                    </span>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setActiveTab('analytics')}
                        className="font-bold text-slate-600 hover:text-blue-700 cursor-pointer flex items-center gap-1"
                      >
                        <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Performance</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('candidates')}
                        className="font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                      >
                        View Applicants →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: CANDIDATE APPLICATIONS */}
      {activeTab === 'candidates' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">Applicant Pipeline & Match Analysis</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review candidates who applied for your jobs, their skills alignment, and computed resume match percentage.
            </p>
          </div>

          {companyApplications.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Users className="w-12 h-12 text-blue-300 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-900 mb-1">No Applications Received Yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Applications submitted by job seekers will appear here with live skill match analysis.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {companyApplications.map(app => {
                const targetJob = companyJobs.find(j => j.id === app.job_id);
                const matchPct = calculateApplicantMatchPercentage(app);

                return (
                  <div
                    key={app.id}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h4 className="font-bold text-slate-900 text-sm">
                          {app.candidate?.full_name || 'Candidate'}
                        </h4>

                        {/* SUBTLE GREEN CHECK MATCH BADGE */}
                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                          <span>{matchPct}% Match</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600">
                        Applied for: <strong className="text-blue-700">{targetJob?.title || 'Open Role'}</strong> • Email: {app.candidate?.email}
                      </p>

                      {app.cover_letter && (
                        <p className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200 max-w-xl">
                          "{app.cover_letter}"
                        </p>
                      )}

                      {Boolean(app.candidate?.skills && app.candidate.skills.length > 0) && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {app.candidate!.skills.map((s, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white text-slate-700 border border-slate-200"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center">
                      <select
                        value={app.status}
                        onChange={async (e) => {
                          const newStatus = e.target.value as ApplicationStatus;
                          const res = await updateApplicationStatus(app.id, newStatus);
                          if (res.success) {
                            toast.success(`Application stage updated to "${newStatus.replace('_', ' ')}".`, 'Pipeline Updated');
                          } else {
                            toast.error('Failed to update application status.');
                          }
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border cursor-pointer focus:outline-none transition-colors ${
                          app.status === 'selected'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : app.status === 'interview'
                            ? 'bg-cyan-50 text-cyan-800 border-cyan-300'
                            : app.status === 'shortlisted'
                            ? 'bg-purple-50 text-purple-800 border-purple-300'
                            : app.status === 'under_review'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        <option value="applied">Applied</option>
                        <option value="under_review">Under Review</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="interview">Interview</option>
                        <option value="selected">Selected</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB: PERFORMANCE & CONVERSION ANALYTICS (RECHARTS) */}
      {activeTab === 'analytics' && (
        <RecruiterAnalyticsDashboard
          jobs={companyJobs}
          applications={companyApplications}
          onNavigateToCandidates={() => setActiveTab('candidates')}
          onNavigateToJobs={() => setActiveTab('jobs')}
        />
      )}

      {/* TAB: COMPANY PROFILE */}
      {activeTab === 'company' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Organization Verification Details</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Keep your company details updated for Platform Admin verification.
              </p>
            </div>
            <VerificationStatusPill status={recruiterVerificationStatus} />
          </div>

          {verificationFeedback && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              <span className="font-semibold">{verificationFeedback}</span>
            </div>
          )}

          <form onSubmit={handleVerificationSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Company / Organization Name</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Industry</label>
                <input
                  type="text"
                  value={industry}
                  onChange={e => setIndustry(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Website URL</label>
                <input
                  type="text"
                  value={website}
                  onChange={e => setWebsite(e.target.value)}
                  placeholder="https://company.com"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Headquarters Location</label>
                <input
                  type="text"
                  value={companyLocation}
                  onChange={e => setCompanyLocation(e.target.value)}
                  placeholder="e.g. New York, NY"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Organization Overview</label>
              <textarea
                rows={3}
                value={companyDesc}
                onChange={e => setCompanyDesc(e.target.value)}
                placeholder="Describe your organization, mission, and hiring focus..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm shadow-blue-500/20 cursor-pointer"
            >
              Update & Resubmit Verification Details
            </button>
          </form>
        </div>
      )}

      {/* JOB CREATION MODAL */}
      {isPostingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsPostingModalOpen(false)}
              className="absolute right-5 top-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4 pr-8">
              <h3 className="text-lg font-bold text-slate-900">Publish New Job Opening</h3>
              <p className="text-xs text-slate-500">
                Create a verified position. Job seekers will see their resume match percentage calculated dynamically against your required skills.
              </p>
            </div>

            {postFeedback && (
              <div
                className={`mb-4 p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  postFeedback.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{postFeedback.msg}</span>
              </div>
            )}

            <form onSubmit={handlePostJob} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Job Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Work Mode</label>
                  <select
                    value={workMode}
                    onChange={e => setWorkMode(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                  >
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="on-site">On-Site</option>
                  </select>
                </div>
              </div>

              <div>
                <LocationSelect value={location} onChange={setLocation} />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Required Competencies / Skills (Comma-separated)
                </label>
                <input
                  type="text"
                  required
                  value={skills}
                  onChange={e => setSkills(e.target.value)}
                  placeholder="e.g. React, TypeScript, Tailwind, Node.js"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  These skills directly power the real-time match percentage displayed to job seekers.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Job Description</label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Outline responsibilities, team objectives, and candidate profile..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPostingModalOpen(false)}
                  className="py-2 px-4 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-500/20 cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish Job</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
