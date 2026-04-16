"use client";

import { useState, useEffect } from 'react';
import { Save, CheckCircle, ExternalLink } from 'lucide-react';

export default function NotionSettings() {
  const [token, setToken] = useState('');
  const [dbId, setDbId] = useState('');
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(data => {
        setToken(data.notion_token || '');
        setDbId(data.notion_database_id || '');
      });
  }, []);

  const save = async () => {
    setIsSaving(true);
    await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notion_token: token, notion_database_id: dbId })
    });
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="mt-12 border-t border-slate-100 pt-10">
      <h2 className="text-lg font-extrabold text-slate-700 mb-1">Notion Integration</h2>
      <p className="text-slate-400 text-sm mb-6">
        Results can be shared directly to a Notion database. 
        <a href="https://www.notion.so/my-integrations" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline ml-1 inline-flex items-center gap-0.5">
          Create an integration <ExternalLink className="w-3 h-3" />
        </a>
      </p>
      <div className="flex flex-col gap-4 max-w-xl">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Notion API Token</label>
          <input
            type="password"
            value={token}
            onChange={e => setToken(e.target.value)}
            placeholder="secret_xxxxxxxxxxxxxxxxx"
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono text-slate-700 focus:outline-none focus:border-indigo-400 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Notion Database ID</label>
          <input
            type="text"
            value={dbId}
            onChange={e => setDbId(e.target.value)}
            placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono text-slate-700 focus:outline-none focus:border-indigo-400 transition-colors"
          />
          <p className="text-xs text-slate-400 mt-1.5">Found in the URL of your Notion database: notion.so/your-workspace/<strong>DATABASE_ID</strong>?v=...</p>
        </div>
        <button
          onClick={save}
          disabled={isSaving}
          className="self-start flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50"
        >
          {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Saved!' : isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
