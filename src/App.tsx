import React from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { AuthScreen } from './components/auth/AuthScreen';
import { JobSeekerDashboard } from './components/seeker/JobSeekerDashboard';
import { RecruiterDashboard } from './components/recruiter/RecruiterDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { BrandLogo } from './components/common/BrandLogo';

export default function App() {
  const { user, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <BrandLogo size="lg" variant="vertical" showTagline={true} />
          <div className="flex items-center gap-2 mt-4 text-xs font-semibold text-slate-500">
            <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span>Initializing Platform...</span>
          </div>
        </div>
      </div>
    );
  }

  // If unauthenticated, show the Login Page
  if (!user || !role) {
    return <AuthScreen />;
  }

  // Render role-specific dashboard with clean white background and blue accents
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {role === 'job_seeker' && <JobSeekerDashboard />}
        {role === 'recruiter' && <RecruiterDashboard />}
        {role === 'admin' && <AdminDashboard />}
      </main>
    </div>
  );
}
