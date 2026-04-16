"use client";

import { useState, useEffect } from 'react';
import { Trash2, PlusCircle, Loader2, Upload, List } from 'lucide-react';

const typeNames: Record<number, string> = {
  1: 'Type 1 — The Reformer',
  2: 'Type 2 — The Helper',
  3: 'Type 3 — The Achiever',
  4: 'Type 4 — The Individualist',
  5: 'Type 5 — The Investigator',
  6: 'Type 6 — The Loyalist',
  7: 'Type 7 — The Enthusiast',
  8: 'Type 8 — The Challenger',
  9: 'Type 9 — The Peacemaker',
};

type CustomQuestion = { id: number; text: string; type: number; createdAt: string };
type ParsedQuestion = { type: number; text: string };

function parseQuestions(raw: string): ParsedQuestion[] {
  const results: ParsedQuestion[] = [];
  // Normalize curly/smart quotes → straight quotes so pasted text always works
  const normalized = raw
    .replace(/[\u201C\u2018\u00AB]/g, '"')  // left double/single/angle → "
    .replace(/[\u201D\u2019\u00BB]/g, '"'); // right double/single/angle → "
  const lines = normalized.split('\n');
  let currentType: number | null = null;

  for (const line of lines) {
    // Detect "Type N" anywhere in the line
    const typeMatch = line.match(/Type\s+(\d)/i);
    if (typeMatch) {
      currentType = parseInt(typeMatch[1]);
    }

    // Grab anything in quotes on this line as a question
    const quotedMatches = [...line.matchAll(/"([^"]+)"/g)];
    for (const match of quotedMatches) {
      const text = match[1].trim();
      if (text && currentType !== null) {
        results.push({ type: currentType, text });
      }
    }

    // Also accept lines starting with "I " (no quotes) when a type is active
    if (!quotedMatches.length && currentType !== null) {
      const trimmed = line.trim();
      if (trimmed.match(/^I\s+/i) && trimmed.length > 10) {
        results.push({ type: currentType, text: trimmed });
      }
    }
  }

  return results;
}

export default function QuestionsManager() {
  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  const [questions, setQuestions] = useState<CustomQuestion[]>([]);

  // Single add state
  const [newText, setNewText] = useState('');
  const [newType, setNewType] = useState<number>(1);
  const [isAdding, setIsAdding] = useState(false);

  // Bulk state
  const [bulkRaw, setBulkRaw] = useState('');
  const [preview, setPreview] = useState<ParsedQuestion[]>([]);
  const [isBulkImporting, setIsBulkImporting] = useState(false);
  const [bulkDone, setBulkDone] = useState(false);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/admin/questions').then(r => r.json()).then(setQuestions);
  }, []);

  // Live parse as user types
  useEffect(() => {
    setPreview(bulkRaw.trim() ? parseQuestions(bulkRaw) : []);
    setBulkDone(false);
  }, [bulkRaw]);

  const add = async () => {
    if (!newText.trim()) return;
    setIsAdding(true);
    const res = await fetch('/api/admin/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: newText.trim(), type: newType })
    });
    const q = await res.json();
    setQuestions(prev => [...prev, q]);
    setNewText('');
    setIsAdding(false);
  };

  const importBulk = async () => {
    if (!preview.length) return;
    setIsBulkImporting(true);
    const added: CustomQuestion[] = [];
    for (const q of preview) {
      const res = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(q)
      });
      added.push(await res.json());
    }
    setQuestions(prev => [...prev, ...added]);
    setBulkRaw('');
    setBulkDone(true);
    setIsBulkImporting(false);
  };

  const remove = async (id: number) => {
    setDeletingId(id);
    await fetch(`/api/admin/questions/${id}`, { method: 'DELETE' });
    setQuestions(prev => prev.filter(q => q.id !== id));
    setDeletingId(null);
  };

  return (
    <div className="max-w-2xl mx-auto px-8 pt-10 pb-16">
      <h1 className="text-2xl font-extrabold text-slate-800 mb-1">Custom Questions</h1>
      <p className="text-slate-400 text-sm mb-6">
        Add questions to the pool. They will be included in future quizzes alongside the standard set.
      </p>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode('single')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border
            ${mode === 'single' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300'}`}
        >
          <List className="w-3.5 h-3.5" /> Single
        </button>
        <button
          onClick={() => setMode('bulk')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border
            ${mode === 'bulk' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300'}`}
        >
          <Upload className="w-3.5 h-3.5" /> Bulk Import
        </button>
      </div>

      {/* Single add form */}
      {mode === 'single' && (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm mb-8">
          <div className="flex flex-col gap-4">
            <textarea
              value={newText}
              onChange={e => setNewText(e.target.value)}
              placeholder="I tend to..."
              rows={3}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-indigo-400 resize-none transition-colors"
            />
            <div className="flex gap-3 items-center">
              <select
                value={newType}
                onChange={e => setNewType(parseInt(e.target.value))}
                className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:border-indigo-400 bg-white transition-colors flex-1"
              >
                {Object.entries(typeNames).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
              <button
                onClick={add}
                disabled={isAdding || !newText.trim()}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk import form */}
      {mode === 'bulk' && (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm mb-8">
          <p className="text-xs text-slate-400 mb-3 leading-relaxed">
            Paste text with <code className="bg-slate-100 px-1 py-0.5 rounded">Type N:</code> lines before questions.
            Quoted text <code className="bg-slate-100 px-1 py-0.5 rounded">"like this"</code> and lines starting with <code className="bg-slate-100 px-1 py-0.5 rounded">I </code> are auto-detected as questions.
          </p>
          <textarea
            value={bulkRaw}
            onChange={e => setBulkRaw(e.target.value)}
            placeholder={`Type 1: The Reformer\n"I feel defective, but if I improve the world, I'll finally feel perfect!"\n\nType 2: The Helper\n"I feel unlovable, but if I help everyone, I'll finally find love!"`}
            rows={10}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:border-indigo-400 resize-y transition-colors font-mono mb-4"
          />

          {/* Live preview */}
          {preview.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Preview — {preview.length} question{preview.length !== 1 ? 's' : ''} detected
              </p>
              <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
                {preview.map((q, i) => (
                  <div key={i} className="bg-slate-50 border border-slate-100 rounded-lg px-4 py-2.5 text-sm">
                    <span className="text-indigo-500 font-bold text-xs mr-2">{typeNames[q.type]}</span>
                    <span className="text-slate-700">{q.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={importBulk}
              disabled={isBulkImporting || preview.length === 0}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50"
            >
              {isBulkImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {isBulkImporting ? 'Importing...' : `Import ${preview.length} Question${preview.length !== 1 ? 's' : ''}`}
            </button>
            {bulkDone && <span className="text-green-600 text-sm font-bold">✓ Imported!</span>}
          </div>
        </div>
      )}

      {/* Existing custom questions */}
      <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">
        Custom Questions ({questions.length})
      </h2>
      {questions.length === 0 ? (
        <p className="text-slate-400 text-sm py-6 text-center border border-dashed border-slate-200 rounded-2xl">
          No custom questions yet. Add one above.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {questions.map(q => (
            <div key={q.id} className="bg-white border border-slate-100 rounded-xl px-5 py-4 shadow-sm flex gap-4 items-start">
              <div className="flex-1">
                <p className="text-slate-800 text-sm leading-relaxed">{q.text}</p>
                <p className="text-[11px] text-indigo-500 font-bold mt-1.5">{typeNames[q.type]}</p>
              </div>
              <button
                onClick={() => remove(q.id)}
                disabled={deletingId === q.id}
                className="text-slate-300 hover:text-red-400 transition-colors mt-0.5 shrink-0"
              >
                {deletingId === q.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
