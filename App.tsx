
import React, { useState, useEffect } from 'react';
import { LEVELS } from './constants';
import { GameStatus, FeedbackData } from './types';

const Firework: React.FC = () => {
  const pieces = Array.from({ length: 50 });
  const colors = ['#f43f5e', '#fbbf24', '#34d399', '#38bdf8', '#818cf8', '#f472b6'];
  
  return (
    <div className="fixed inset-0 pointer-events-none z-[120] flex items-center justify-center">
      {pieces.map((_, i) => {
        const rotation = i * (360 / pieces.length);
        const color = colors[i % colors.length];
        return (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: color,
              boxShadow: `0 0 12px ${color}`,
              transform: `rotate(${rotation}deg) translateY(0)`,
              animation: `explode 1.2s cubic-bezier(0.1, 0.8, 0.3, 1) forwards`,
            }}
          />
        );
      })}
      <style>{`
        @keyframes explode {
          0% { transform: rotate(var(--rotation)) translateY(0); opacity: 1; scale: 1; }
          100% { 
            transform: rotate(var(--rotation)) translateY(250px); 
            opacity: 0;
            scale: 0.2;
          }
        }
      `}</style>
      {pieces.map((_, i) => (
        <style key={`style-${i}`}>{`
          div:nth-child(${i + 1}) { --rotation: ${i * (360 / pieces.length)}deg; }
        `}</style>
      ))}
    </div>
  );
};

const Confetti: React.FC = () => {
  const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
  const pieces = Array.from({ length: 80 });

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {pieces.map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-5 rounded-sm opacity-80"
          style={{
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            left: `${Math.random() * 100}%`,
            top: `-20px`,
            transform: `rotate(${Math.random() * 360}deg)`,
            animation: `fall ${2.5 + Math.random() * 3}s linear forwards`,
            animationDelay: `${Math.random() * 1}s`
          }}
        />
      ))}
      <style>{`
        @keyframes fall {
          to {
            top: 110%;
            transform: rotate(1080deg) translateX(${Math.random() * 150 - 75}px);
          }
        }
      `}</style>
    </div>
  );
};

const CameraFlash: React.FC = () => (
  <div className="fixed inset-0 pointer-events-none z-[130] bg-white animate-flash">
    <style>{`
      @keyframes flash {
        0% { opacity: 0; }
        10% { opacity: 0.8; }
        100% { opacity: 0; }
      }
      .animate-flash {
        animation: flash 0.5s ease-out forwards;
      }
    `}</style>
  </div>
);

const App: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>('start');
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [showFirework, setShowFirework] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [streakModal, setStreakModal] = useState<{ show: boolean; text: string; hasConfetti: boolean }>({
    show: false,
    text: '',
    hasConfetti: false,
  });

  const currentLevel = LEVELS[currentLevelIdx];
  const currentQuestion = currentLevel.questions[currentQuestionIdx];

  const startLevel = () => {
    setStatus('playing');
    setCurrentLevelIdx(0);
    setCurrentQuestionIdx(0);
    setScore(0);
    setStreak(0);
    setTotalQuestions(LEVELS.reduce((acc, lvl) => acc + lvl.questions.length, 0));
    setFeedback(null);
  };

  const handleAnswer = (selectedIdx: number) => {
    const isCorrect = selectedIdx === currentQuestion.correctIndex;
    
    let newStreak = 0;
    if (isCorrect) {
      setScore(prev => prev + 1);
      newStreak = streak + 1;
      setStreak(newStreak);
      setShowFirework(true);
      setShowFlash(true);
      setTimeout(() => setShowFirework(false), 1200);
      setTimeout(() => setShowFlash(false), 500);
    } else {
      setStreak(0);
    }

    setFeedback({
      isCorrect,
      praise: isCorrect ? currentQuestion.correctFeedback : currentQuestion.incorrectFeedback,
      explanation: currentQuestion.explanation
    });
    
    setStatus('feedback');

    if (newStreak === 3) {
      setStreakModal({ show: true, text: "哇塞书涵你也太棒了！连对三道！📸", hasConfetti: false });
    } else if (newStreak === 5) {
      setStreakModal({ show: true, text: "绝了！五连绝世！书涵你就是法律界的攀岩大神！🧗‍♀️", hasConfetti: true });
    }
  };

  const proceed = () => {
    if (currentQuestionIdx < currentLevel.questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setFeedback(null);
      setStatus('playing');
    } else {
      setStatus('levelComplete');
    }
  };

  const nextLevel = () => {
    if (currentLevelIdx < LEVELS.length - 1) {
      setCurrentLevelIdx(prev => prev + 1);
      setCurrentQuestionIdx(0);
      setFeedback(null);
      setStatus('playing');
    } else {
      setStatus('finished');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#fcfaf2]">
      {streakModal.hasConfetti && <Confetti />}
      {showFirework && <Firework />}
      {showFlash && <CameraFlash />}
      
      {/* Streak Modal */}
      {streakModal.show && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white artistic-shadow p-12 max-w-sm w-full text-center space-y-10 rounded-2xl scale-in">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-600 shadow-inner">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
            </div>
            <h2 className="text-3xl font-black text-slate-800 leading-tight">{streakModal.text}</h2>
            <button 
              onClick={() => setStreakModal({ ...streakModal, show: false })}
              className="w-full py-5 bg-slate-900 text-white font-black tracking-[0.3em] text-sm uppercase hover:bg-slate-700 transition-all rounded-xl shadow-lg hover:-translate-y-1 active:translate-y-0"
            >
              继续保持
            </button>
          </div>
        </div>
      )}

      <header className="fixed top-8 text-center space-y-3 pointer-events-none w-full z-20">
        <h1 className="text-3xl font-black tracking-[0.5em] text-slate-400 uppercase opacity-30">Juris Prudentia</h1>
        <div className="h-0.5 w-32 bg-slate-200 mx-auto"></div>
      </header>

      <main className="w-full max-w-3xl z-10 py-24">
        {status === 'start' && (
          <div className="text-center space-y-16 fade-in">
            <div className="space-y-8">
              <p className="text-slate-400 font-medium text-2xl tracking-widest italic opacity-80">“对焦正义，攀登法学之巅”</p>
              <div className="space-y-6">
                <h2 className="text-6xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none">
                  嗨，书涵！✨<br/>
                  <span className="text-slate-400">准备好冲刺了吗？</span>🧗‍♀️
                </h2>
                <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-sm">International Public Law · Final Exam</p>
              </div>
            </div>
            <button 
              onClick={startLevel}
              className="group relative px-20 py-6 bg-slate-900 text-white overflow-hidden transition-all duration-500 hover:scale-110 active:scale-95 rounded-full shadow-2xl"
            >
              <span className="relative z-10 tracking-[0.6em] text-lg font-black">现在出发 🚀</span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-gradient"></div>
            </button>
          </div>
        )}

        {status === 'playing' && (
          <div className="space-y-12 fade-in">
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-end">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-0.5 bg-slate-800"></span>
                    <span className="text-slate-900 text-xs font-black uppercase tracking-[0.3em]">{currentLevel.title}</span>
                  </div>
                  <p className="text-slate-400 text-xs uppercase tracking-widest font-bold">关卡进度: {currentQuestionIdx + 1} / {currentLevel.questions.length}</p>
                </div>
                <div className="flex flex-col items-end gap-3">
                  {streak > 0 && (
                    <div className="flex items-center gap-2 text-rose-500 animate-bounce">
                      <span className="text-xs font-black tracking-widest uppercase">COMBO X {streak}</span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
                    </div>
                  )}
                  <div className="h-1.5 w-48 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                    <div 
                      className="h-full bg-slate-800 transition-all duration-1000 ease-out" 
                      style={{ width: `${((currentQuestionIdx + 1) / currentLevel.questions.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-16 bg-white artistic-shadow rounded-3xl border border-slate-100/50 backdrop-blur-sm relative">
              <div className="absolute top-8 left-8 text-slate-100 pointer-events-none select-none">
                <span className="text-9xl font-black italic">Q</span>
              </div>
              <h3 className="text-4xl leading-snug text-slate-800 font-black mb-16 tracking-tight relative z-10">
                {currentQuestion.question}
              </h3>
              <div className="grid grid-cols-1 gap-6 relative z-10">
                {currentQuestion.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    className="text-left px-12 py-8 border-2 border-slate-100 hover:border-slate-900 hover:bg-slate-900 transition-all text-slate-900 hover:text-white group flex items-center justify-between rounded-2xl shadow-sm bg-[#fafafa] hover:-translate-y-1 active:translate-y-0"
                  >
                    <span className="text-2xl font-black tracking-tight leading-relaxed pr-8 select-none">
                      <span className="text-slate-300 group-hover:text-slate-500 mr-4 font-normal">{String.fromCharCode(65 + idx)}</span>
                      {option}
                    </span>
                    <span className="opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0 scale-150">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {status === 'feedback' && feedback && (
          <div className="space-y-10 fade-in text-center">
            <div className={`p-16 ${feedback.isCorrect ? 'bg-emerald-50/50' : 'bg-orange-50/50'} artistic-shadow rounded-3xl border border-white text-left relative overflow-hidden`}>
              <div className="absolute -top-10 -right-10 opacity-5 pointer-events-none text-slate-900">
                 <svg width="300" height="300" viewBox="0 0 24 24" fill="currentColor"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              </div>
              <div className="flex items-center gap-4 mb-10">
                {feedback.isCorrect ? (
                  <span className="px-6 py-2 bg-emerald-600 text-white text-xs font-black rounded-full uppercase tracking-[0.3em] shadow-lg">Bingo</span>
                ) : (
                  <span className="px-6 py-2 bg-rose-500 text-white text-xs font-black rounded-full uppercase tracking-[0.3em] shadow-lg">Re-Focus</span>
                )}
              </div>
              <p className="text-3xl font-black leading-snug text-slate-900 mb-10 border-l-[12px] border-slate-900 pl-10 tracking-tight">
                {feedback.praise}
              </p>
              <div className="h-px bg-slate-200/60 my-10"></div>
              <div className="space-y-6 text-slate-700 leading-relaxed font-bold">
                <p className="text-xs uppercase tracking-[0.5em] text-slate-400 font-black mb-6 flex items-center gap-4">
                  <span className="w-12 h-1 bg-slate-300 rounded-full"></span>
                  法理显影 / Analysis
                </p>
                <p className="text-xl leading-relaxed">{feedback.explanation}</p>
              </div>
            </div>
            <button 
              onClick={proceed}
              className="px-24 py-6 bg-slate-900 text-white hover:bg-slate-700 transition-all tracking-[0.5em] text-lg font-black shadow-2xl rounded-full hover:scale-105 active:scale-95"
            >
              继续攀登
            </button>
          </div>
        )}

        {status === 'levelComplete' && (
          <div className="text-center space-y-12 fade-in py-16">
            <div className="inline-block px-6 py-2 bg-white artistic-shadow text-xs text-slate-900 font-black tracking-[0.4em] uppercase mb-6 rounded-full border border-slate-100">Camp Reached</div>
            <h2 className="text-5xl font-black text-slate-900 tracking-tight leading-tight px-12 italic">{currentLevel.levelCompletionPraise}</h2>
            <div className="h-1 w-24 bg-slate-900 mx-auto rounded-full"></div>
            <p className="text-slate-400 text-lg font-bold uppercase tracking-[0.3em]">
              Next Objective / 下一站：<span className="text-slate-800">{currentLevelIdx < LEVELS.length - 1 ? LEVELS[currentLevelIdx + 1].title : "巅峰决战"}</span>
            </p>
            <button 
              onClick={nextLevel}
              className="px-20 py-6 border-4 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white transition-all duration-500 tracking-[0.5em] text-lg font-black rounded-full"
            >
              前往更高处
            </button>
          </div>
        )}

        {status === 'finished' && (
          <div className="text-center space-y-20 fade-in py-16">
            <div className="space-y-12">
              <div className="inline-block px-8 py-3 bg-slate-900 text-white text-sm font-black tracking-[0.5em] uppercase mb-6 rounded-full shadow-2xl animate-bounce">SUMMIT CONQUERED</div>
              <div className="space-y-4">
                <h2 className="text-8xl font-black text-slate-900 tracking-tighter italic">万物皆有裂痕</h2>
                <h2 className="text-6xl font-black text-slate-400 tracking-tighter">那是光照进来的地方</h2>
              </div>
              <div className="max-w-xl mx-auto text-slate-500 leading-relaxed font-bold text-2xl px-10">
                书涵，攀登已毕。你在国际公法的博弈里，已经展现出了攀岩者挑战极限的坚韧。<br/>
                <span className="font-black text-slate-900 block mt-16 text-4xl tracking-[0.4em] uppercase underline decoration-slate-300 underline-offset-[16px] decoration-8">
                  去考试吧，巅峰就在脚下！🏆
                </span>
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-8 pt-12">
                <div className="px-10 py-4 bg-white artistic-shadow rounded-2xl border border-slate-100">
                  <span className="text-slate-300 text-sm tracking-[0.3em] uppercase font-black mr-4">Final Score:</span>
                  <span className="text-3xl font-black text-slate-900">{score} / {totalQuestions}</span>
                </div>
                <button 
                  onClick={startLevel}
                  className="px-12 py-4 text-slate-400 hover:text-slate-900 transition-all text-sm tracking-[0.4em] font-black uppercase border-b-2 border-transparent hover:border-slate-900"
                >
                  再次挑战巅峰
                </button>
            </div>
          </div>
        )}
      </main>

      <footer className="fixed bottom-8 text-slate-400 text-[10px] tracking-[0.6em] uppercase w-full text-center font-black opacity-40 select-none">
        FOR SHUHAN &middot; JURIS PRUDENTIA &middot; EST. 2025
      </footer>

      <style>{`
        .fade-in {
          animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .scale-in {
          animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default App;
