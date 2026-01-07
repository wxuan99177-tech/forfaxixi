
import React, { useState, useEffect } from 'react';
import { LEVELS } from './constants';
import { GameStatus, FeedbackData } from './types';

const Firework: React.FC = () => {
  const pieces = Array.from({ length: 40 });
  const colors = ['#ff4d4d', '#ffdb4d', '#4dff4d', '#4dffff', '#4d4dff', '#ff4dff'];
  
  return (
    <div className="fixed inset-0 pointer-events-none z-[120] flex items-center justify-center">
      {pieces.map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            boxShadow: '0 0 10px currentColor',
            animation: `explode 1s ease-out forwards`,
            transform: `rotate(${i * (360 / 40)}deg) translateY(0)`,
          }}
        />
      ))}
      <style>{`
        @keyframes explode {
          0% { transform: rotate(var(--rotation)) translateY(0); opacity: 1; }
          100% { 
            transform: rotate(var(--rotation)) translateY(200px); 
            opacity: 0;
            width: 0;
            height: 0;
          }
        }
      `}</style>
      {pieces.map((_, i) => (
        <style key={`style-${i}`}>{`
          div:nth-child(${i + 1}) { --rotation: ${i * (360 / 40)}deg; }
        `}</style>
      ))}
    </div>
  );
};

const Confetti: React.FC = () => {
  const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
  const pieces = Array.from({ length: 60 });

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {pieces.map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-4 rounded-sm opacity-80"
          style={{
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            left: `${Math.random() * 100}%`,
            top: `-20px`,
            transform: `rotate(${Math.random() * 360}deg)`,
            animation: `fall ${2 + Math.random() * 3}s linear forwards`,
            animationDelay: `${Math.random() * 0.5}s`
          }}
        />
      ))}
      <style>{`
        @keyframes fall {
          to {
            top: 110%;
            transform: rotate(720deg) translateX(${Math.random() * 100 - 50}px);
          }
        }
      `}</style>
    </div>
  );
};

const App: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>('start');
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [showFirework, setShowFirework] = useState(false);
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
      setTimeout(() => setShowFirework(false), 1200);
    } else {
      setStreak(0);
    }

    setFeedback({
      isCorrect,
      praise: isCorrect ? currentQuestion.correctFeedback : currentQuestion.incorrectFeedback,
      explanation: currentQuestion.explanation
    });
    
    setStatus('feedback');

    // Check for streak milestones
    if (newStreak === 3) {
      setStreakModal({ show: true, text: "哇塞书涵你也太棒了！连对三道！", hasConfetti: false });
    } else if (newStreak === 5) {
      setStreakModal({ show: true, text: "绝了！五连绝世！书涵你就是法律界的攀岩大神！", hasConfetti: true });
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
      
      {/* Streak Modal */}
      {streakModal.show && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white artistic-shadow p-10 max-w-sm w-full text-center space-y-8 rounded-sm scale-in">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-600">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 leading-snug">{streakModal.text}</h2>
            <button 
              onClick={() => setStreakModal({ ...streakModal, show: false })}
              className="w-full py-4 bg-slate-800 text-white font-bold tracking-[0.2em] text-xs uppercase hover:bg-slate-700 transition-colors"
            >
              继续保持
            </button>
          </div>
        </div>
      )}

      <header className="fixed top-8 text-center space-y-2 pointer-events-none w-full z-20">
        <h1 className="text-2xl font-light tracking-[0.4em] text-slate-400 uppercase">International Law</h1>
        <div className="h-px w-24 bg-slate-300 mx-auto"></div>
      </header>

      <main className="w-full max-w-2xl z-10 py-20">
        {status === 'start' && (
          <div className="text-center space-y-12 fade-in">
            <div className="space-y-6">
              <p className="text-slate-500 font-light text-xl tracking-wide">“书涵，准备好来一场法学大冒险了吗？”</p>
              <div className="space-y-4">
                <h2 className="text-5xl font-bold text-slate-800 tracking-tight leading-tight">嗨！书涵！✨<br/>让我们冲向法学之巅吧！🧗‍♀️</h2>
                <p className="text-slate-400 font-medium uppercase tracking-widest text-xs">Law & Alpinism Adventure Mode</p>
              </div>
            </div>
            <button 
              onClick={startLevel}
              className="group relative px-16 py-5 bg-slate-800 text-white overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <span className="relative z-10 tracking-[0.4em] text-sm font-bold">现在出发！🚀</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        )}

        {status === 'playing' && (
          <div className="space-y-10 fade-in">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">关卡 {currentLevelIdx + 1}: {currentLevel.title}</span>
                  <p className="text-slate-300 text-[9px] uppercase tracking-widest">进度: {currentQuestionIdx + 1} / {currentLevel.questions.length}</p>
                </div>
                <div className="flex items-center gap-4">
                  {streak > 0 && (
                    <div className="flex items-center gap-1 text-orange-500 animate-bounce">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c4.418 0 8 3.582 8 8 0 4.418-3.582 8-8 8s-8-3.582-8-8c0-4.418 3.582-8 8-8zm0 18c5.523 0 10-4.477 10-10S17.523 0 12 0 2 4.477 2 10s4.477 10 10 10zm0-15v5h5v2h-7V5h2z"/></svg>
                      <span className="text-[10px] font-bold tracking-tighter">连击 X {streak}</span>
                    </div>
                  )}
                  <div className="h-0.5 w-32 bg-slate-100 relative">
                    <div 
                      className="h-full bg-slate-400 transition-all duration-700" 
                      style={{ width: `${((currentQuestionIdx + 1) / currentLevel.questions.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-12 bg-white artistic-shadow rounded-sm border border-slate-50">
              <h3 className="text-2xl leading-relaxed text-slate-800 font-medium mb-12">
                {currentQuestion.question}
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {currentQuestion.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    className="text-left px-10 py-6 border border-slate-100 hover:border-slate-800 hover:bg-slate-50 transition-all text-slate-700 hover:text-slate-900 group flex items-center justify-between rounded-md shadow-sm"
                  >
                    <span className="text-lg font-medium tracking-tight leading-snug pr-4">{option}</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0 text-slate-400">→</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {status === 'feedback' && feedback && (
          <div className="space-y-8 fade-in text-center">
            <div className="space-y-10">
              <div className={`p-12 ${feedback.isCorrect ? 'bg-emerald-50/30' : 'bg-orange-50/20'} artistic-shadow rounded-sm border border-slate-100 text-left relative overflow-hidden`}>
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none text-slate-400">
                   <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M12 2L2 22h20L12 2z"/><path d="M12 2l-4 8 4 4 4-4-4-8z"/><circle cx="12" cy="18" r="1"/></svg>
                </div>
                <div className="flex items-center gap-3 mb-6">
                  {feedback.isCorrect ? (
                    <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded-full uppercase tracking-widest">Bingo!</span>
                  ) : (
                    <span className="px-3 py-1 bg-orange-400 text-white text-[10px] font-bold rounded-full uppercase tracking-widest">Keep Going</span>
                  )}
                </div>
                <p className="text-xl font-medium leading-relaxed text-slate-800 mb-8 border-l-4 border-slate-800 pl-6">
                  {feedback.praise}
                </p>
                <div className="h-px bg-slate-100 my-8"></div>
                <div className="space-y-4 text-slate-600 leading-relaxed font-light">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-bold mb-4 flex items-center gap-2">
                    <span className="w-4 h-px bg-slate-300"></span>
                    法律解析
                  </p>
                  <p className="text-sm">{feedback.explanation}</p>
                </div>
              </div>
              <button 
                onClick={proceed}
                className="px-16 py-4 bg-slate-800 text-white hover:bg-slate-700 transition-all tracking-[0.3em] text-xs font-bold shadow-2xl"
              >
                继续攀登
              </button>
            </div>
          </div>
        )}

        {status === 'levelComplete' && (
          <div className="text-center space-y-10 fade-in py-12">
            <div className="inline-block px-4 py-1 border border-slate-200 text-[10px] text-slate-400 tracking-[0.3em] uppercase mb-4">Checkpoint</div>
            <h2 className="text-3xl font-medium text-slate-800 tracking-tight leading-tight px-10">{currentLevel.levelCompletionPraise}</h2>
            <div className="h-px w-12 bg-slate-300 mx-auto"></div>
            <p className="text-slate-400 text-sm font-light uppercase tracking-widest">Next / 下一关：{currentLevelIdx < LEVELS.length - 1 ? LEVELS[currentLevelIdx + 1].title : "巅峰决战"}</p>
            <button 
              onClick={nextLevel}
              className="px-16 py-5 border-2 border-slate-800 text-slate-800 hover:bg-slate-800 hover:text-white transition-all duration-500 tracking-[0.3em] text-xs font-bold"
            >
              前往更高处
            </button>
          </div>
        )}

        {status === 'finished' && (
          <div className="text-center space-y-12 fade-in py-12">
            <div className="space-y-8">
              <div className="inline-block px-4 py-1 border border-slate-200 text-xs text-slate-400 tracking-[0.3em] uppercase mb-4">Summit Success</div>
              <div className="space-y-4">
                <h2 className="text-6xl font-medium text-slate-800">万物皆有裂痕</h2>
                <h2 className="text-4xl font-medium text-slate-800">那是光照进来的地方</h2>
              </div>
              <div className="max-w-md mx-auto text-slate-500 leading-relaxed font-light text-lg">
                书涵，攀登已毕。你在国际公法的博弈里，已经展现出了攀岩者挑战极限的坚韧。<br/>
                <span className="font-bold text-slate-800 block mt-8 text-xl tracking-[0.2em] uppercase">去考试吧，巅峰就在你脚下</span>
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-6 pt-10">
                <div className="text-slate-300 text-xs tracking-widest uppercase">最终成绩: {score} / {totalQuestions}</div>
                <button 
                  onClick={startLevel}
                  className="px-8 py-3 border border-slate-200 text-slate-400 hover:text-slate-800 hover:border-slate-800 transition-all text-[10px] tracking-[0.2em] font-bold"
                >
                  再攀一次
                </button>
            </div>
          </div>
        )}
      </main>

      <footer className="fixed bottom-8 text-slate-300 text-[9px] tracking-[0.4em] uppercase w-full text-center">
        Designed for Shuhan &middot; Juris Prudentia &middot; Est. 2025
      </footer>

      <style>{`
        .fade-in {
          animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .scale-in {
          animation: scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default App;
