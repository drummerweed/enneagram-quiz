"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trash2, Pencil, Check, X } from 'lucide-react';

type ResultRow = {
  id: string;
  name: string;
  createdAt: string;
  isFinished: boolean;
  progress: number;
  topType: number | null;
};

export default function AdminClient({ initialResults, hideNav = false }: { initialResults: ResultRow[], hideNav?: boolean }) {
  const router = useRouter();
  const [results, setResults] = useState<ResultRow[]>(initialResults);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const deleteSelected = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selected.size} assessment(s)?`)) return;
    setIsDeleting(true);
    try {
      await fetch('/api/admin/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selected) })
      });
      setResults(prev => prev.filter(r => !selected.has(r.id)));
      setSelected(new Set());
    } catch (e) {
      console.error(e);
      alert('Failed to delete sessions.');
    } finally {
      setIsDeleting(false);
    }
  };

  const startEdit = (r: ResultRow) => {
    setEditingId(r.id);
    setEditingName(r.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const saveName = async (id: string) => {
    if (!editingName.trim()) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/rename', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name: editingName.trim() })
      });
      if (!res.ok) throw new Error('Failed');
      setResults(prev => prev.map(r => r.id === id ? { ...r, name: editingName.trim() } : r));
      setEditingId(null);
    } catch (e) {
      console.error(e);
      alert('Failed to save name.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white">
      <div className="max-w-[1000px] mx-auto p-8 sm:p-12">
        {!hideNav && (
          <div className="mb-6">
            <Link href="/" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-sm font-semibold transition-colors">
              <span>←</span> New Assessment
            </Link>
          </div>
        )}
        <div className="flex justify-between items-end mb-8">
           <h1 className="text-[2rem] font-extrabold text-[#1f2937] tracking-tight m-0">Completed Assessments</h1>
           {selected.size > 0 && (
             <button 
                onClick={deleteSelected}
                disabled={isDeleting}
                className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 flex items-center gap-2 rounded-lg font-bold text-sm transition-colors"
             >
                <Trash2 className="w-4 h-4" />
                Delete ({selected.size})
             </button>
           )}
        </div>
        
        <div className="overflow-x-auto border border-slate-100 rounded-3xl shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="p-5 font-bold text-[#8a94a6] uppercase tracking-[0.05em] text-[11px] w-12 text-center">
                  <input 
                    type="checkbox" 
                    onChange={(e) => {
                      if (e.target.checked) setSelected(new Set(initialResults.map(r => r.id)));
                      else setSelected(new Set());
                    }}
                    checked={selected.size === initialResults.length && initialResults.length > 0}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                </th>
                <th className="p-5 font-bold text-[#8a94a6] uppercase tracking-[0.05em] text-[11px]">Name</th>
                <th className="p-5 font-bold text-[#8a94a6] uppercase tracking-[0.05em] text-[11px]">Date</th>
                <th className="p-5 font-bold text-[#8a94a6] uppercase tracking-[0.05em] text-[11px]">Status</th>
                <th className="p-5 font-bold text-[#8a94a6] uppercase tracking-[0.05em] text-[11px]">Top Type</th>
                <th className="p-5 font-bold text-[#8a94a6] uppercase tracking-[0.05em] text-[11px]">Link</th>
              </tr>
            </thead>
            <tbody>
              {results.map(r => (
                <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                  <td className="p-5 text-center">
                    <input 
                      type="checkbox" 
                      onChange={() => toggleSelect(r.id)}
                      checked={selected.has(r.id)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                  </td>
                  <td className="p-5">
                    {editingId === r.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          autoFocus
                          type="text"
                          value={editingName}
                          onChange={e => setEditingName(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') saveName(r.id);
                            if (e.key === 'Escape') cancelEdit();
                          }}
                          className="border border-indigo-300 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 w-44"
                        />
                        <button onClick={() => saveName(r.id)} disabled={isSaving} className="text-green-600 hover:text-green-800 transition-colors p-1">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={cancelEdit} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-800 text-[15px]">{r.name}</span>
                        <button
                          onClick={() => startEdit(r)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-slate-500 p-1"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="p-5 text-slate-500 text-[15px]">{r.createdAt}</td>
                  <td className="p-5">
                    {r.isFinished ? <span className="bg-[#e6f4ea] text-[#1e8e3e] px-3 py-1 rounded font-bold text-xs">Finished</span> : <span className="bg-[#fef7e0] text-[#ea8600] px-3 py-1 rounded font-bold text-xs">{Math.round((r.progress/192)*100)}%</span>}
                  </td>
                  <td className="p-5 font-black text-indigo-700 text-[15px]">{r.topType ? `Type ${r.topType}` : ''}</td>
                  <td className="p-5">
                     <a href={`/quiz/${r.id}/results`} className="text-[13px] font-bold text-indigo-600 hover:text-indigo-800 underline decoration-indigo-200 underline-offset-4">View</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {initialResults.length === 0 && <p className="text-slate-400 p-8 text-center font-bold">No sessions yet.</p>}
        </div>
      </div>
    </div>
  );
}
