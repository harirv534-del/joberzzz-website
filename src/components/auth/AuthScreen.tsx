import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/NotificationContext';
import { BrandLogo } from '../common/BrandLogo';
import {
  Briefcase,
  Building2,
  Lock,
  KeyRound,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  User,
  Mail
} from 'lucide-react';

interface AuthScreenProps {
  onSuccess?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = () => {
  const { signIn, signUp, adminLogin } = useAuth();
  const toast = useToast();
  const [isAdminPortal, setIsAdminPortal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'job_seeker' | 'recruiter'>('job_seeker');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Admin form states
  const [adminId, setAdminId] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [showAdminKey, setShowAdminKey] = useState(false);

  // Feedback states
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleStandardAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessNotice(null);
    setLoading(true);

    try {
      if (isSignUp) {
        if (!fullName.trim()) {
          setError('Please enter your full name.');
          toast.error('Please enter your full name.');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters long.');
          toast.error('Password must be at least 6 characters long.');
          setLoading(false);
          return;
        }

        const res = await signUp(email, password, fullName, selectedRole);
        if (!res.success) {
          const errMsg = res.error || 'Account creation could not be completed.';
          setError(errMsg);
          toast.error(errMsg);
          setLoading(false);
          return;
        }

        const msg = 'Account created successfully! Loading your dashboard...';
        setSuccessNotice(msg);
        toast.success(msg, 'Account created');
      } else {
        const res = await signIn(email, password, selectedRole);
        if (!res.success) {
          const errMsg = res.error || 'Authentication failed. Please verify your credentials.';
          setError(errMsg);
          toast.error(errMsg);
          setLoading(false);
          return;
        }

        const msg = 'Signed in successfully! Opening dashboard...';
        setSuccessNotice(msg);
        toast.success(msg, 'Welcome to Joberzzz');
      }
    } catch (err: any) {
      const errMsg = err?.message || 'An unexpected error occurred during authentication.';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessNotice(null);
    setLoading(true);

    try {
      if (!adminId.trim() || !adminKey.trim()) {
        const errMsg = 'Please enter both your Admin User ID and Security Key.';
        setError(errMsg);
        toast.error(errMsg);
        setLoading(false);
        return;
      }

      const res = await adminLogin(adminId, adminKey);
      if (!res.success) {
        const errMsg = res.error || 'Access denied: Valid administrator credentials required.';
        setError(errMsg);
        toast.error(errMsg);
        setLoading(false);
        return;
      }

      const msg = 'Admin authenticated successfully! Loading console...';
      setSuccessNotice(msg);
      toast.success(msg, 'Admin Access Granted');
    } catch (err: any) {
      const errMsg = err?.message || 'Authentication error.';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 relative selection:bg-blue-600 selection:text-white">
      <div className="w-full max-w-md z-10">
        {/* 
          1. Brand Logo & Title:
          - Logo image with exact aspect ratio, zero boxes, zero borders, zero shadows.
          - "Joberzzz" placed directly below the logo, perfectly horizontally center-aligned.
          - Official Tagline directly below.
        */}
        <div className="mb-7">
          <BrandLogo size="lg" variant="vertical" showTagline={true} />
        </div>

        {/* Clean White Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs p-6 sm:p-8">
          {!isAdminPortal ? (
            <>
              {/* Role Selection (Only Recruiter / HR or Job Seeker - NO ADMIN) */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Select User Role
                  </label>
                  <span className="text-[11px] font-semibold text-blue-600">
                    {selectedRole === 'job_seeker' ? 'Candidate Profile' : 'Company / Recruiter'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('job_seeker');
                      setError(null);
                    }}
                    className={`py-2.5 px-3.5 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition-all cursor-pointer ${
                      selectedRole === 'job_seeker'
                        ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-200 hover:bg-blue-50/50'
                    }`}
                  >
                    <Briefcase className={`w-4 h-4 ${selectedRole === 'job_seeker' ? 'text-white' : 'text-slate-500'}`} />
                    <span>Job Seeker</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('recruiter');
                      setError(null);
                    }}
                    className={`py-2.5 px-3.5 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition-all cursor-pointer ${
                      selectedRole === 'recruiter'
                        ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-200 hover:bg-blue-50/50'
                    }`}
                  >
                    <Building2 className={`w-4 h-4 ${selectedRole === 'recruiter' ? 'text-white' : 'text-slate-500'}`} />
                    <span>Recruiter / HR</span>
                  </button>
                </div>
              </div>

              {/* Login / Sign Up Tabs */}
              <div className="flex p-1 bg-slate-100 rounded-xl mb-5 border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(false);
                    setError(null);
                    setSuccessNotice(null);
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    !isSignUp
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-600 hover:text-blue-600'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(true);
                    setError(null);
                    setSuccessNotice(null);
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    isSignUp
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-600 hover:text-blue-600'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Feedback messages */}
              {successNotice && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span className="font-semibold">{successNotice}</span>
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* Authentication Form */}
              <form onSubmit={handleStandardAuth} className="space-y-4">
                {isSignUp && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={selectedRole === 'recruiter' ? 'e.g. Marcus Vance' : 'e.g. Alex Seeker'}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={selectedRole === 'recruiter' ? 'recruiter@company.com' : 'candidate@email.com'}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={isSignUp ? 'Create a secure password (min 6 characters)' : '••••••••'}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {isSignUp && selectedRole === 'recruiter' && (
                  <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-[11px] text-blue-900 leading-relaxed">
                    <strong>Recruiter Notice:</strong> Newly registered recruiters are assigned <strong>'pending'</strong> verification status. You will complete your company profile and submit it for Admin database verification before publishing jobs.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{isSignUp ? 'Creating Account...' : 'Authenticating...'}</span>
                    </span>
                  ) : (
                    <>
                      <span>
                        {isSignUp
                          ? `Create Account as ${selectedRole === 'recruiter' ? 'Recruiter' : 'Job Seeker'}`
                          : `Sign In as ${selectedRole === 'recruiter' ? 'Recruiter' : 'Job Seeker'}`}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Dedicated Admin Authentication Portal - Secure, zero visible credentials */
            <div>
              <div className="flex items-center gap-2 mb-3 text-rose-700">
                <ShieldCheck className="w-5 h-5 shrink-0" />
                <h2 className="text-sm font-bold uppercase tracking-wider">
                  Admin Security Authorization
                </h2>
              </div>
              <p className="text-xs text-slate-600 mb-5 leading-relaxed">
                Restricted portal for authorized platform administrators to manage recruiter verifications and ecosystem governance.
              </p>

              {successNotice && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span className="font-semibold">{successNotice}</span>
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              <form onSubmit={handleAdminAuth} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Admin User ID / Email
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={adminId}
                      onChange={(e) => setAdminId(e.target.value)}
                      placeholder="Enter authorized Admin identifier"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Admin Password / Security Key
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type={showAdminKey ? 'text' : 'password'}
                      required
                      value={adminKey}
                      onChange={(e) => setAdminKey(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminKey(!showAdminKey)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showAdminKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-rose-600 hover:bg-rose-700 shadow-sm shadow-rose-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Authenticating Admin...</span>
                    </span>
                  ) : (
                    <>
                      <span>Authenticate Admin Session</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Dedicated Admin Portal Link */}
        <div className="mt-5 text-center">
          <button
            onClick={() => {
              setIsAdminPortal(!isAdminPortal);
              setError(null);
              setSuccessNotice(null);
            }}
            className="text-xs text-slate-500 hover:text-blue-600 font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isAdminPortal ? 'Return to User & Recruiter Portal' : 'Admin Security Access'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
