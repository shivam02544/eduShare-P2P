"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  BrainCircuit,
  LayoutGrid
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function FlashcardStudyPage() {
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCards() {
      try {
        const res = await fetch("/api/user/flashcards");
        if (res.ok) setCards(await res.json());
      } catch (err) {
        toast.error("Failed to load flashcards");
      } finally {
        setLoading(false);
      }
    }
    fetchCards();
  }, []);

  const handleReview = async (wasCorrect) => {
    const card = cards[currentIndex];
    setIsFlipped(false);
    
    // Optimistic update
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      toast.success("Study session complete!");
      // Reset or redirect
    }

    // Sync with server
    try {
      await fetch("/api/user/flashcards", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId: card._id, wasCorrect })
      });
    } catch (err) {
      console.error("Failed to sync progress");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><BrainCircuit className="animate-pulse text-indigo-600 w-12 h-12" /></div>;

  if (cards.length === 0) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center space-y-6">
      <div className="w-24 h-24 bg-indigo-50 rounded-[2rem] flex items-center justify-center text-indigo-600 shadow-inner">
        <LayoutGrid className="w-12 h-12" />
      </div>
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Your Deck is Empty</h1>
        <p className="text-gray-500 mt-2 max-w-md mx-auto">Generate flashcards from AI quizzes or video explanations to start your personalized study session.</p>
      </div>
      <Link href="/explore" className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all">
        Find a Quiz
      </Link>
    </div>
  );

  const currentCard = cards[currentIndex];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-12 flex flex-col items-center">
      {/* Navigation Header */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-12">
        <Link href="/dashboard/learning" className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors font-medium">
          <ChevronLeft className="w-5 h-5" /> Dashboard
        </Link>
        <div className="text-sm font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100">
          {currentIndex + 1} / {cards.length} Cards
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-md bg-gray-200 dark:bg-slate-800 h-1.5 rounded-full mb-12 overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
          className="h-full bg-indigo-600"
        />
      </div>

      {/* Flashcard Container */}
      <div className="relative w-full max-w-md aspect-[3/4] perspective-1000">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ x: 300, opacity: 0, rotate: 10 }}
            animate={{ x: 0, opacity: 1, rotate: 0 }}
            exit={{ x: -300, opacity: 0, rotate: -10 }}
            className="w-full h-full cursor-pointer"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <motion.div 
              className="relative w-full h-full transition-all duration-500 preserve-3d"
              animate={{ rotateY: isFlipped ? 180 : 0 }}
            >
              {/* Front */}
              <div className="absolute inset-0 backface-hidden bg-white dark:bg-slate-900 rounded-[3rem] p-12 flex flex-col items-center justify-center text-center shadow-2xl border border-white dark:border-slate-800">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 mb-6 px-4 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-full">{currentCard.topic}</span>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                  {currentCard.front}
                </h2>
                <div className="absolute bottom-12 text-gray-400 text-xs flex items-center gap-2 font-medium">
                  <RotateCcw className="w-4 h-4" /> Tap to reveal answer
                </div>
              </div>

              {/* Back */}
              <div className="absolute inset-0 backface-hidden bg-indigo-600 rounded-[3rem] p-12 flex flex-col items-center justify-center text-center shadow-2xl rotate-y-180">
                <h3 className="text-xl md:text-2xl font-medium text-white leading-relaxed">
                  {currentCard.back}
                </h3>
                <div className="absolute bottom-12 flex gap-4 w-full px-12">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleReview(false); }}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white border border-white/20 py-4 rounded-2xl font-bold transition-all active:scale-95 flex flex-col items-center gap-1"
                  >
                    <XCircle className="w-6 h-6 text-rose-300" />
                    <span className="text-[10px] uppercase">Review Soon</span>
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleReview(true); }}
                    className="flex-1 bg-white text-indigo-600 py-4 rounded-2xl font-bold transition-all active:scale-95 shadow-lg flex flex-col items-center gap-1"
                  >
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    <span className="text-[10px] uppercase">Got it!</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      <p className="mt-12 text-gray-400 text-sm font-medium">
        Powered by AI Spaced Repetition Engine
      </p>

      <style jsx global>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
}
