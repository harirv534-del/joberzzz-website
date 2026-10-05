import React, { useEffect, useState } from 'react';
import { X, FileText, Download, MessageSquare } from 'lucide-react';
import { api, getToken, fetchResumeBlob } from '../../lib/api';
import { MessagesPanel } from '../messaging/MessagesPanel';

interface Props { jobTitle: string; candidateName: string; candidate?: any; matchPct?: number; status?: string; coverLetter?: string | null; onClose: () => void }

export const ApplicantProfileModal: React.FC<Props> = ({ jobTitle, candidateName, candidate, matchPct, status, coverLetter, onClose }) => {
  const authed = !!getToken();
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [resumeUrl, setResumeUrl] = useState<{ url: string; type: string } | null>(null);

  useEffect(() => {
    if (!authed) return;
    (async () => {
      try {
        const list = await api('/applications/');
        const match = list.find((a: any) => a.job_title === jobTitle && a.candidate_name === candidateName);
        if (!match) throw new Error('This application is not on the secure server yet.');
        setProfile(await api(`/applications/${match.id}/profile/`));
      } catch (e: any) { setError(e.message); }
    })();
  }, [authed, jobTitle, candidateName]);

  const openResume = async () => { try { setResumeUrl(await fetchResumeBlob(profile.id)); } catch (e: any) { setError(e.message); } };
  const download = async () => {
    try { const r = await fetchResumeBlob(profile.id, true); const a = document.createElement('a'); a.href = r.url; a.download = profile.resume.file_name; a.click(); }
    catch (e: any) { setError(e.message); }
  };
  const c = profile?.candidate || (candidate && { email: candidate.email, phone: candidate.phone, location: candidate.location,
    experience_years: candidate.experience_years ?? 0, headline: candidate.headline, bio: candidate.bio, skills: candidate.skills || [] });
  const view = profile || { match_percentage: matchPct ?? 0, status, cover_letter: coverLetter, resume: null };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{candidateName}</h3>
            <p className="text-xs text-slate-500">Applied for <strong className="text-blue-700">{jobTitle}</strong></p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"><X className="w-5 h-5" /></button>
        </div>
        {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
        {c && (
          <>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <p><span className="text-slate-500">Email:</span> {c.email}</p>
              <p><span className="text-slate-500">Phone:</span> {c.phone || '—'}</p>
              <p><span className="text-slate-500">Location:</span> {c.location || '—'}</p>
              <p><span className="text-slate-500">Experience:</span> {c.experience_years} yrs</p>
              <p><span className="text-slate-500">Match:</span> <strong className="text-emerald-700">{Math.round(view.match_percentage)}%</strong></p>
              <p><span className="text-slate-500">Status:</span> {view.status}</p>
            </div>
            {c.headline && <p className="text-sm font-semibold text-slate-800">{c.headline}</p>}
            {c.bio && <p className="text-sm text-slate-600">{c.bio}</p>}
            <div className="flex flex-wrap gap-1.5">
              {c.skills.map((s: string) => <span key={s} className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">{s}</span>)}
            </div>
            {view.cover_letter && <p className="text-sm text-slate-600 p-3 rounded-xl bg-slate-50 border border-slate-200">{view.cover_letter}</p>}
            <div className="flex flex-wrap gap-2">
              {profile?.resume && <>
                <button onClick={openResume} className="px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"><FileText className="w-4 h-4" /> View Resume</button>
                <button onClick={download} className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"><Download className="w-4 h-4" /> Download</button>
              </>}
              {profile && <button onClick={() => setShowChat(s => !s)} className="px-3 py-2 rounded-xl border border-blue-300 text-blue-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"><MessageSquare className="w-4 h-4" /> Message</button>}
            </div>
            {resumeUrl && (resumeUrl.type.includes('pdf')
              ? <iframe src={resumeUrl.url} title="Resume" className="w-full h-[60vh] rounded-xl border border-slate-200" />
              : <a href={resumeUrl.url} download className="text-sm text-blue-700 underline">Open file</a>)}
            {profile && showChat && <MessagesPanel applicationId={profile.id} jobTitle={jobTitle} otherName={candidateName} />}
          </>
        )}
      </div>
    </div>
  );
};
