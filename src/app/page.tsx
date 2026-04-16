import Link from 'next/link';
import { Hexagon } from 'lucide-react';
import { ClientStartButton } from '@/components/ClientStartButton';

export default function Home() {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center p-6 bg-[#f4f5f7] relative">
      <Link href="/admin" className="absolute top-6 right-6 text-slate-300 hover:text-slate-400 opacity-30 hover:opacity-100 transition-all p-2 rounded-full hover:bg-slate-200" title="Admin">
        <Hexagon className="w-5 h-5" />
      </Link>
      <div className="max-w-lg w-full p-10 text-center flex flex-col items-center space-y-6 rounded-[1.75rem] shadow-sm" style={{background: 'linear-gradient(145deg, #eff6ff 0%, #dbeafe 60%, #e0f2fe 100%)'}}>
        <h1 className="text-[2.2rem] leading-tight font-extrabold text-slate-800 tracking-tight">
          Discover your Enneagram Type
        </h1>
        
        <p className="text-slate-500 text-lg leading-relaxed">
          Take the comprehensive Enneagram assessment to understand your deep motivations, personality type, and paths to growth.
        </p>

        <div className="w-full pt-6">
          <ClientStartButton />
        </div>
      </div>
    </main>
  );
}
