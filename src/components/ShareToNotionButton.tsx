"use client";

import { useState } from 'react';
import { BookOpen, Loader2, ExternalLink } from 'lucide-react';

export default function ShareToNotionButton({ sessionId }: { sessionId: string }) {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [notionUrl, setNotionUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const share = async () => {
    setState('loading');
    try {
      const res = await fetch(`/api/notion/share/${sessionId}`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setNotionUrl(data.url);
      setState('done');
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : 'Unknown error');
      setState('error');
    }
  };

  if (state === 'done') {
    return (
      <a
        href={notionUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors whitespace-nowrap"
      >
        <ExternalLink className="w-3.5 h-3.5" />
        Open in Notion
      </a>
    );
  }

  if (state === 'error') {
    return (
      <span className="text-red-500 text-xs font-semibold max-w-[200px] text-right">{errorMsg}</span>
    );
  }

  return (
    <button
      onClick={share}
      disabled={state === 'loading'}
      className="inline-flex items-center gap-2 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 text-sm font-bold px-4 py-2 rounded-xl transition-colors whitespace-nowrap disabled:opacity-50"
    >
      {state === 'loading'
        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
        : <BookOpen className="w-3.5 h-3.5" />
      }
      {state === 'loading' ? 'Sharing...' : 'Share to Notion'}
    </button>
  );
}
