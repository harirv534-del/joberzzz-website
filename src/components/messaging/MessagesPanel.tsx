import React, { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { api } from '../../lib/api';

interface Msg { id: number; body: string; mine: boolean; is_read: boolean; created_at: string }

/** One-to-one conversation tied to a single job application. Polls every 5s. */
export const MessagesPanel: React.FC<{ applicationId: string; jobTitle: string; otherName: string }> = ({ applicationId, jobTitle, otherName }) => {
  const [convId, setConvId] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api('/conversations/', { method: 'POST', body: JSON.stringify({ application_id: applicationId }) })
      .then(c => setConvId(c.id)).catch(e => setError(e.message));
  }, [applicationId]);

  useEffect(() => {
    if (!convId) return;
    const load = () => api(`/conversations/${convId}/messages/`).then(setMsgs).catch(() => {});
    load(); const t = setInterval(load, 5000); return () => clearInterval(t);
  }, [convId]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs.length]);

  const send = async () => {
    if (!text.trim() || !convId) return;
    try {
      const m = await api(`/conversations/${convId}/messages/`, { method: 'POST', body: JSON.stringify({ message: text.trim() }) });
      setMsgs(p => [...p, m]); setText('');
    } catch (e: any) { setError(e.message); }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      <div className="px-4 py-3 border-b border-slate-200">
        <p className="text-sm font-bold text-slate-900">Chat with {otherName}</p>
        <p className="text-xs text-slate-500">Regarding application: <strong className="text-blue-700">{jobTitle}</strong></p>
      </div>
      <div className="h-64 overflow-y-auto p-4 space-y-2 bg-slate-50">
        {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
        {!error && msgs.length === 0 && <p className="text-xs text-slate-500 text-center mt-8">No messages yet. Say hello!</p>}
        {msgs.map(m => (
          <div key={m.id} className={`flex ${m.mine ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${m.mine ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-800'}`}>
              <p className="whitespace-pre-wrap break-words">{m.body}</p>
              <p className={`text-[10px] mt-1 ${m.mine ? 'text-blue-100' : 'text-slate-400'}`}>
                {new Date(m.created_at).toLocaleString()} {m.mine && (m.is_read ? '• Read' : '• Sent')}
              </p>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="p-3 border-t border-slate-200 flex gap-2">
        <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
          maxLength={4000} placeholder="Type a message..."
          className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <button onClick={send} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold flex items-center gap-1.5 cursor-pointer">
          <Send className="w-4 h-4" /> Send
        </button>
      </div>
    </div>
  );
};
