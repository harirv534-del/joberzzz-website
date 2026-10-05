import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/NotificationContext';
import { BrandLogo } from './BrandLogo';
import { Briefcase, Building2, ShieldCheck, LogOut } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, role, signOut, recruiterVerificationStatus } = useAuth();
  const toast = useToast();

  const handleSignOut = () => {
    signOut();
    toast.info('Signed out successfully');
  };

  const getRoleBadge = () => {
    switch (role) {
      case 'admin':
        return {
          label: 'Admin Console',
          icon: ShieldCheck,
          className: 'bg-rose-50 text-rose-700 border-rose-200',
        };
      case 'recruiter':
        return {
          label: `Recruiter / HR (${recruiterVerificationStatus === 'verified' ? 'Verified' : 'Pending Approval'})`,
          icon: Building2,
          className:
            recruiterVerificationStatus === 'verified'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-amber-50 text-amber-800 border-amber-200',
        };
      case 'job_seeker':
      default:
        return {
          label: 'Job Seeker',
          icon: Briefcase,
          className: 'bg-blue-50 text-blue-700 border-blue-200',
        };
    }
  };

  const badge = getRoleBadge();
  const IconComp = badge.icon;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-blue-100 bg-white shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand with Logo Emblem and Official Tagline */}
        <BrandLogo size="sm" variant="horizontal" showTagline={true} />

        {/* Current Verified Role Badge & Auth Identity */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badge.className}`}
          >
            <IconComp className="w-3.5 h-3.5 shrink-0" />
            <span>{badge.label}</span>
          </div>

          {/* User Profile & Sign Out */}
          {user && (
            <div className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-800 leading-tight">
                  {user.full_name}
                </p>
                <p className="text-[11px] text-slate-500 leading-none">
                  {user.email}
                </p>
              </div>

              <button
                onClick={handleSignOut}
                title="Sign Out"
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
