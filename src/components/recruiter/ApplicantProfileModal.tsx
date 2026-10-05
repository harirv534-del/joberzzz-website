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

  // Resume source: secure Django endpoint when the application is synced, otherwise the candidate's stored resume record.
  let localResume: any = null;
  try {
    const list = JSON.parse(localStorage.getItem(`joberzzz_resumes_${candidate?.id}`) || '[]');
    localResume = list.find((r: any) => r.is_primary) || list[0] || null;
  } catch { /* none */ }
  const resumeName: string | null = profile?.resume?.file_name || localResume?.file_name || null;
  const loadFile = async (dl: boolean) => {
    if (profile?.resume) return fetchResumeBlob(profile.id, dl);
    const src = localResume?.file_data || localResume?.file_url;
    const res = await fetch(src);
    if (!res.ok) throw new Error('missing');
    const blob = await res.blob();
    return { url: URL.createObjectURL(blob), type: localResume.file_type || blob.type };
  };
  const unavailable = 'The original resume file is no longer available. Ask the candidate to re-upload it.';
  const openResume = async () => { try { setError(''); setResumeUrl(await loadFile(false)); } catch { setError(unavailable); } };
  const download = async () => {
    try { setError(''); const r = await loadFile(true); const a = document.createElement('a'); a.href = r.url; a.download = resumeName || 'resume'; a.click(); }
    catch { setError(unavailable); }
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

              {profile && <button onClick={() => setShowChat(s => !s)} className="px-3 py-2 rounded-xl border border-blue-300 text-blue-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"><MessageSquare className="w-4 h-4" /> Message</button>}
            </div>
            {resumeName && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Resume</p>
                <p className="text-sm text-slate-800 flex items-center gap-1.5"><FileText className="w-4 h-4 text-blue-600" /> {resumeName}</p>
                <div className="flex flex-wrap gap-2">
                  <button onClick={openResume} className="px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"><FileText className="w-4 h-4" /> View Resume</button>
                  <button onClick={download} className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"><Download className="w-4 h-4" /> Download Resume</button>
                </div>
              </div>
            )}
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
