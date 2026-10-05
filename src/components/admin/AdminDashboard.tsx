import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/NotificationContext';
import { VerificationStatusPill } from '../common/VerificationStatusPill';
import { CompanyStatus } from '../../types';
import {
  ShieldCheck,
  Building2,
  Users,
  Briefcase,
  CheckCircle,
  XCircle,
  Clock,
  Lock,
  ExternalLink,
  Search,
  AlertTriangle,
  Check,
  Mail,
  MapPin,
  Globe
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    user,
    getAllCompanies,
    getAllUsers,
    getJobs,
    approveCompany,
    rejectCompany,
    toggleCompanyStatus,
    refreshData
  } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'pending' | 'companies' | 'users' | 'jobs'>('pending');
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'info'; message: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const companies = getAllCompanies();
  const users = getAllUsers();
  const jobs = getJobs();

  // Pending recruiter registrations list
  const pendingCompanies = companies.filter(c => c.verification_status === 'pending');

  const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
    setActionNotice({ type, message });
    if (type === 'success') {
      toast.success(message, 'Admin Action');
    } else {
      toast.info(message, 'Admin Action');
    }
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handleApprove = async (companyId: string, name: string) => {
    setProcessingId(companyId);
    try {
      const res = await approveCompany(companyId);
      if (res.success) {
        refreshData();
        showNotification(`Approved "${name}"! Recruiter status updated to "verified" in database.`);
      } else {
        showNotification(res.error || 'Failed to approve recruiter.', 'info');
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (companyId: string, name: string) => {
    setProcessingId(companyId);
    try {
      const res = await rejectCompany(companyId, 'Documentation criteria could not be validated.');
      if (res.success) {
        refreshData();
        showNotification(`Rejected "${name}". Status updated to "rejected" in database.`, 'info');
      } else {
        showNotification(res.error || 'Failed to reject recruiter.', 'info');
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggle = async (companyId: string, name: string) => {
    setProcessingId(companyId);
    try {
      const res = await toggleCompanyStatus(companyId);
      if (res.success) {
        refreshData();
        showNotification(`Verification status for "${name}" toggled to ${res.newStatus}.`);
      }
    } finally {
      setProcessingId(null);
    }
  };

  const filteredPending = pendingCompanies.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.contact_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCompanies = companies.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.contact_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Admin Security Banner with Blue + White Palette */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Platform Administration Console</h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Authorized Personnel
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Admin Session: <span className="text-slate-900 font-semibold">{user?.email}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-semibold flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Pending Approvals:</span>
            <strong className="text-amber-800 text-sm">{pendingCompanies.length}</strong>
          </div>
        </div>
      </div>

      {/* Action Notification */}
      {actionNotice && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center gap-2.5 transition-all shadow-xs ${
            actionNotice.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-amber-50 border-amber-300 text-amber-900'
          }`}
        >
          {actionNotice.type === 'success' ? (
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-700" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-700" />
          )}
          <span className="font-semibold">{actionNotice.message}</span>
        </div>
      )}

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">Pending Registrations</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600">{pendingCompanies.length}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Awaiting manual approval</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">Registered Companies</span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{companies.length}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Recruiter organizations</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">Total Platform Users</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{users.length}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Candidates and recruiters</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">Published Jobs</span>
            <Briefcase className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{jobs.length}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Verified postings</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-100 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'pending'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50'
            }`}
          >
            <span>Pending Approvals</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'pending'
                  ? 'bg-white text-blue-700 font-extrabold'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {pendingCompanies.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('companies')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'companies'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50'
            }`}
          >
            All Recruiters & Companies ({companies.length})
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'users'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50'
            }`}
          >
            User Registry ({users.length})
          </button>

          <button
            onClick={() => setActiveTab('jobs')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'jobs'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50'
            }`}
          >
            Job Moderation ({jobs.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by name, email..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
          />
        </div>
      </div>

      {/* TAB: PENDING RECRUITER REGISTRATIONS */}
      {activeTab === 'pending' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Pending Recruiter Registrations</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Review and approve new recruiter registrations. Approving updates their status in the database to{' '}
                <strong>'verified'</strong> and unlocks their job posting capabilities.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300">
              {filteredPending.length} Awaiting Verification
            </span>
          </div>

          {filteredPending.length === 0 ? (
            <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200">
              <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-900">No Pending Recruiter Registrations</p>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                All recruiter accounts have been reviewed. When a new recruiter registers, their organization will appear here immediately for admin approval.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPending.map(c => {
                const ownerProfile = users.find(u => u.id === c.owner_id);
                const isProcessing = processingId === c.id;

                return (
                  <div
                    key={c.id}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-100/60 text-blue-700 flex items-center justify-center shrink-0">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h4 className="font-bold text-slate-900 text-base">{c.name}</h4>
                          <VerificationStatusPill status="pending" />
                        </div>
                        <p className="text-xs text-slate-600 flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-slate-700">{c.industry || 'Technology'}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {c.location || 'Remote'}
                          </span>
                          <span>•</span>
                          <span>Size: {c.company_size || '1-10'}</span>
                        </p>
                        <p className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-slate-400" />
                            Recruiter: <strong className="text-slate-900">{ownerProfile?.full_name || 'Hiring Lead'}</strong>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {c.contact_email}
                          </span>
                        </p>
                        {c.website && (
                          <p className="text-xs text-blue-600 pt-0.5">
                            <a
                              href={c.website.startsWith('http') ? c.website : `https://${c.website}`}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:underline inline-flex items-center gap-1 font-medium"
                            >
                              <Globe className="w-3 h-3" />
                              <span>{c.website}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </p>
                        )}
                        {c.description && (
                          <p className="text-xs text-slate-600 mt-1 max-w-2xl bg-white p-2.5 rounded-xl border border-slate-200">
                            {c.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Approve & Reject Actions */}
                    <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center pt-2 md:pt-0">
                      <button
                        onClick={() => handleApprove(c.id, c.name)}
                        disabled={isProcessing}
                        className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>{isProcessing ? 'Updating...' : 'Approve Recruiter'}</span>
                      </button>

                      <button
                        onClick={() => handleReject(c.id, c.name)}
                        disabled={isProcessing}
                        className="py-2.5 px-3.5 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB: ALL COMPANIES */}
      {activeTab === 'companies' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs overflow-x-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">All Registered Recruiter Organizations</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspect verification records and toggle approval status in the database at any time.
              </p>
            </div>
          </div>

          {filteredCompanies.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Building2 className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">No organizations found</p>
              <p className="text-xs">When new recruiters register, their organizations will appear here.</p>
            </div>
          ) : (
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Organization</th>
                  <th className="py-3 px-4">Industry</th>
                  <th className="py-3 px-4">Verification Status</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCompanies.map(c => (
                  <tr key={c.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div>{c.name}</div>
                      <div className="text-[11px] font-normal text-slate-500">{c.contact_email}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{c.industry}</td>
                    <td className="py-3.5 px-4">
                      <VerificationStatusPill status={c.verification_status} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{c.location || 'Remote'}</td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {c.verification_status !== 'verified' ? (
                        <button
                          onClick={() => handleApprove(c.id, c.name)}
                          disabled={processingId === c.id}
                          className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer disabled:opacity-50"
                        >
                          Approve
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggle(c.id, c.name)}
                          disabled={processingId === c.id}
                          className="py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer border border-slate-200 disabled:opacity-50"
                        >
                          Revoke Approval
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* TAB: USER REGISTRY */}
      {activeTab === 'users' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs overflow-x-auto">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900">Platform User Registry</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Overview of all registered job seekers and recruiters.
            </p>
          </div>

          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Registered On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">{u.full_name}</td>
                  <td className="py-3 px-4 text-slate-600">{u.email}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        u.role === 'admin'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : u.role === 'recruiter'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {u.role === 'admin' ? 'Admin' : u.role === 'recruiter' ? 'Recruiter / HR' : 'Job Seeker'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB: JOB MODERATION */}
      {activeTab === 'jobs' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs overflow-x-auto">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900">Active Job Postings Moderation</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review published jobs created by verified recruiters.
            </p>
          </div>

          {jobs.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Briefcase className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">No jobs posted yet</p>
              <p className="text-xs">Once verified recruiters publish jobs, they will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map(j => (
                <div
                  key={j.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{j.title}</h4>
                    <p className="text-xs text-slate-500">
                      Company: <strong className="text-slate-700">{j.company?.name || 'Recruiter Org'}</strong> • Mode: {j.work_mode} • Location: {j.location}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Published
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
