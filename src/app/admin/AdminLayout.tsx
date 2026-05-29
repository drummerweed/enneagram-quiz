"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TableProperties, BookOpen, MessageSquarePlus, LogOut } from 'lucide-react';
import AdminClient from './AdminClient';
import NotionSettings from './NotionSettings';
import QuestionsManager from './QuestionsManager';

type Tab = 'results' | 'questions' | 'notion';

type ResultRow = {
  id: string;
  name: string;
  createdAt: string;
  isFinished: boolean;
  progress: number;
  topType: number | null;
};

const navItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'results',   label: 'Results',   icon: <TableProperties className="w-4 h-4" /> },
  { id: 'questions', label: 'Questions', icon: <MessageSquarePlus className="w-4 h-4" /> },
  { id: 'notion',    label: 'Notion',    icon: <BookOpen className="w-4 h-4" /> },
];

export default function AdminLayout({ initialResults }: { initialResults: ResultRow[] }) {
  const [tab, setTab] = useState<Tab>('results');
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="flex min-h-screen bg-[#f7f8fa]">
      {/* Sidebar */}
      <aside className="w-52 shrink-0 bg-white border-r border-slate-100 flex flex-col pt-10 px-3 gap-1">
        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest px-3 mb-3">Admin</p>
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all w-full text-left
              ${tab === item.id
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
              }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
        <div className="mt-auto pb-6 px-3 flex flex-col gap-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all w-full text-left text-slate-400 hover:text-slate-700 hover:bg-slate-50"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
          <a href="/" className="text-[11px] text-slate-300 hover:text-slate-500 font-semibold transition-colors mt-2 text-center block">
            ← New Assessment
          </a>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {tab === 'results'   && <AdminClient initialResults={initialResults} hideNav />}
        {tab === 'questions' && <QuestionsManager />}
        {tab === 'notion'    && <div className="max-w-2xl mx-auto px-8 pt-10 pb-16"><NotionSettings /></div>}
      </main>
    </div>
  );
}
