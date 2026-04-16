"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';

type SafeQuestion = {
  id: number;
  text: string;
};

interface QuizClientProps {
  sessionId: string;
  questions: SafeQuestion[];
  initialAnswers: Record<number, number>;
}

export default function QuizClient({ sessionId, questions, initialAnswers }: QuizClientProps) {
  const router = useRouter();
  
  // Calculate starting index based on completed answers
  const answeredCountInit = Object.keys(initialAnswers).length;
  const startingIndex = Math.min(answeredCountInit, questions.length - 1);
  
  const [currentIndex, setCurrentIndex] = useState(startingIndex);
  const [answers, setAnswers] = useState<Record<number, number>>(initialAnswers);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // If we already answered all of them before loading
  useEffect(() => {
    if (answeredCountInit >= questions.length && Object.keys(answers).length >= questions.length) {
      router.push(`/quiz/${sessionId}/results`);
    }
  }, [answeredCountInit, questions.length, sessionId, router, answers]);

  if (currentIndex >= questions.length) {
    return (
      <div className="premium-card p-12 text-center animate-pulse">
        <h2 className="text-2xl font-bold text-slate-800">Calculating your results...</h2>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const percentage = Math.round((currentIndex / questions.length) * 100);

  const handleAnswer = async (value: number) => {
    if (isSubmitting) return;
    
    // Optimistic UI updates
    setAnswers(prev => ({ ...prev, [currentQ.id]: value }));
    const nextIdx = currentIndex + 1;
    
    setIsSubmitting(true);
    
    try {
      fetch('/api/quiz/answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId,
          questionId: currentQ.id,
          value
        })
      }).catch(console.error);

      if (nextIdx >= questions.length) {
        setCurrentIndex(nextIdx); // Trigger the calculating view
        router.push(`/quiz/${sessionId}/results`);
      } else {
        setTimeout(() => {
            setCurrentIndex(nextIdx);
            setIsSubmitting(false);
        }, 300); // 300ms delay to let the user see their click
      }
      
    } catch (e) {
      console.error(e);
      alert('Error saving answer');
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-sm max-w-2xl w-full p-8 sm:p-12 relative flex flex-col mx-auto">
      
      {/* Header section */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">
          Question {currentIndex + 1} <span className="text-slate-300 font-medium">/ {questions.length}</span>
        </h2>
        <div className="bg-indigo-50 text-indigo-600 font-bold px-3 py-1 rounded-md text-sm">
          {percentage}%
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-slate-100 rounded-full mb-10 overflow-hidden">
        <div 
          className="h-full bg-indigo-600 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Question Text */}
      <h1 className="text-2xl sm:text-[1.75rem] font-extrabold text-[#111827] text-center leading-[1.3] my-8 sm:my-12 min-h-[120px] flex items-center justify-center transition-all">
        {currentQ.text}
      </h1>

      {/* Answer Scale Labels */}
      <div className="flex justify-between w-full px-2 mb-3">
        <span className="text-[10px] font-bold text-slate-400 tracking-[0.15em] uppercase">Strongly Disagree</span>
        <span className="text-[10px] font-bold text-slate-400 tracking-[0.15em] uppercase">Strongly Agree</span>
      </div>

      {/* Numbered Buttons */}
      <div className="flex justify-between w-full gap-2 sm:gap-4 mb-4">
        {[1, 2, 3, 4, 5].map(val => {
           const isSelected = answers[currentQ.id] === val;
           return (
             <button
               key={val}
               onClick={() => handleAnswer(val)}
               className={`flex-1 aspect-square sm:aspect-auto sm:h-20 rounded-2xl sm:rounded-3xl border-[2px] flex items-center justify-center text-xl sm:text-2xl font-bold transition-all duration-200 transform hover:-translate-y-1 hover:shadow-md ${
                 isSelected 
                   ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm' 
                   : 'border-slate-100 text-slate-800 hover:border-slate-200 bg-white'
               }`}
             >
               {val}
             </button>
           );
        })}
      </div>

      {/* Footer Actions */}
      <div className="mt-10 pt-6 border-t border-slate-50 flex justify-between items-center w-full text-xs font-bold text-slate-300 uppercase tracking-wider">
        <button 
          onClick={handleBack} 
          disabled={currentIndex === 0 || isSubmitting}
          className={`hover:text-slate-500 transition-colors uppercase font-bold tracking-widest ${currentIndex === 0 ? 'opacity-0 cursor-default' : ''}`}
        >
          Back
        </button>
        
        <a href="/" className="text-slate-300 hover:text-red-400 transition-colors text-[10px] uppercase font-bold tracking-widest">
          Stop Quiz
        </a>

        <div className="flex items-center gap-1.5 opacity-60">
           <Lock className="w-3.5 h-3.5" />
           <span>Secure Connection</span>
        </div>
      </div>
    </div>
  );
}
