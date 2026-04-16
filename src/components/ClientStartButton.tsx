"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export function ClientStartButton() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function startQuiz() {
    if (!name.trim()) {
      alert("Please enter your name to begin.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/quiz/start', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() })
      });
      const data = await res.json();
      if (data.sessionId) {
        router.push(`/quiz/${data.sessionId}`);
      } else {
        alert('Failed to start quiz');
        setIsLoading(false);
      }
    } catch (e) {
      console.error(e);
      alert('Error starting quiz');
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full flex flex-col gap-4">
      <input 
        type="text" 
        placeholder="Enter your first and last name" 
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border-[2px] border-blue-100 bg-white/70 rounded-xl px-4 py-3.5 text-lg font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:bg-white transition-all text-center"
        onKeyDown={(e) => {
          if (e.key === 'Enter') startQuiz();
        }}
      />
      <button 
        onClick={startQuiz}
        disabled={isLoading || !name.trim()}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : null}
        {isLoading ? 'Preparing your test...' : 'Start Assessment'}
      </button>
    </div>
  );
}
