"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, 
  Target, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  BookOpen, 
  Play, 
  BrainCircuit,
  Calendar
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function LearningDashboard() {
  const [profile, setProfile] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [profileRes, recRes] = await Promise.all([
          fetch("/api/user/learning-profile"),
          fetch("/api/user/recommendations")
        ]);
        
        if (profileRes.ok && recRes.ok) {
          setProfile(await profileRes.json());
          setRecommendations(await recRes.json());
        }
      } catch (err) {
        toast.error("Failed to load learning insights");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            AI Learning Insights
          </h1>
          <p className="text-gray-500 mt-1">Adaptive mastery tracking & personalized growth path</p>
        </div>
        
        <div className="flex gap-4">
          <StreakCounter streak={profile?.streaks?.current || 0} />
          <Link href="/dashboard/flashcards" className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl font-medium hover:bg-indigo-100 transition-colors">
            <BrainCircuit className="w-5 h-5" />
            Study Deck
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Mastery & Stats */}
        <div className="lg:col-span-2 space-y-8">
          {/* Mastery Radar/List */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Target className="text-blue-500" />
                Topic Mastery
              </h2>
              <span className="text-sm text-gray-400">Based on recent quiz performance</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profile?.mastery?.map((m, idx) => (
                <MasteryCard key={idx} data={m} />
              )) || <EmptyState message="No mastery data yet. Take some quizzes to start tracking!" />}
            </div>
          </div>

          {/* Gap Analysis */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <AlertCircle className="text-orange-500" />
              Identified Learning Gaps
            </h2>
            <div className="flex flex-wrap gap-3">
              {profile?.weakTopics?.map((topic, idx) => (
                <span key={idx} className="bg-orange-50 text-orange-700 px-4 py-2 rounded-full text-sm font-medium border border-orange-100 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  {topic}
                </span>
              )) || <span className="text-gray-400">No weak topics identified yet. Great job!</span>}
            </div>
          </div>
        </div>

        {/* Right Column: Recommendations */}
        <div className="space-y-8">
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-6 text-white shadow-lg">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Zap className="text-yellow-400 fill-yellow-400" />
              Personalized for You
            </h2>
            <p className="text-blue-100 text-sm mb-6">
              Resources selected to help you master your current weak topics.
            </p>
            
            <div className="space-y-4">
              {recommendations?.remediation?.map((item, idx) => (
                <RecommendationItem key={idx} item={item} />
              )) || <p className="text-blue-200 text-sm italic">Taking a moment to find resources...</p>}
            </div>
          </div>

          {/* Activity Streak Details */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="text-green-500" />
              Consistency
            </h2>
            <div className="flex items-end gap-1 h-12">
              {[...Array(7)].map((_, i) => (
                <div 
                  key={i} 
                  className={`flex-1 rounded-sm ${i < 4 ? 'bg-green-500' : 'bg-gray-100'}`} 
                  style={{ height: `${Math.random() * 100}%` }}
                />
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">Active {profile?.streaks?.current || 0} days in a row</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MasteryCard({ data }) {
  return (
    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-800 capitalize">{data.topic}</h3>
        <span className="text-xs font-bold bg-white text-blue-600 px-2 py-1 rounded-lg border border-blue-50">
          {data.score}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${data.score}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full ${data.score > 80 ? 'bg-green-500' : data.score > 50 ? 'bg-blue-500' : 'bg-orange-500'}`}
        />
      </div>
      <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-wider font-semibold">
        {data.attempts} attempts • Last: {new Date(data.lastTested).toLocaleDateString()}
      </p>
    </div>
  );
}

function RecommendationItem({ item }) {
  const Icon = item.type === "video" ? Play : item.type === "note" ? BookOpen : Target;
  const href = item.type === "video" ? `/videos/${item._id}` : item.type === "note" ? `/notes/${item._id}` : `/videos/${item.video}/quiz`;

  return (
    <Link href={href}>
      <motion.div 
        whileHover={{ x: 5 }}
        className="flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-colors cursor-pointer group"
      >
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium truncate">{item.title}</h4>
          <p className="text-[10px] text-blue-200 uppercase">{item.type} • {item.subject || item.topic}</p>
        </div>
        <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white" />
      </motion.div>
    </Link>
  );
}

function StreakCounter({ streak }) {
  return (
    <div className="flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-xl font-bold border border-orange-100">
      <Zap className="w-5 h-5 fill-orange-500 text-orange-500" />
      {streak} Day Streak
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen p-8 space-y-8 animate-pulse">
      <div className="h-10 bg-gray-200 w-64 rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 h-96 bg-gray-100 rounded-3xl" />
        <div className="h-96 bg-gray-100 rounded-3xl" />
      </div>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="col-span-full py-12 text-center">
      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <Target className="text-gray-300 w-8 h-8" />
      </div>
      <p className="text-gray-400 italic">{message}</p>
    </div>
  );
}
