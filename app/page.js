"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from "../components/Header";
import RecentPaths from "../components/RecentPaths";
import { motion } from "framer-motion";
import StatsCard from '../components/StatsCard';
import ContinueLearningCard from '../components/ContinueLearningCard';

export default function Home() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topic || loading) return;

    setLoading(true);

    try {
      const response = await fetch('/api/generatePath', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }
      
      router.push(`/path/${data.pathId}`);

    } catch (error) {
      console.error("Submission error:", error);
      alert(`Error: ${error.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="text-white flex flex-col min-h-screen antialiased overflow-x-hidden">
      <Header />
      <main className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-8 container mx-auto p-4 sm:p-6 items-start">
        
        {/* --- COLUMN 1: HERO & FORM --- */}
        <motion.div 
          className="flex flex-col items-start text-left"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-400">
            Turn Ambition Into Mastery
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 mb-12 max-w-2xl">
            Stop searching, start learning. Pathfinder instantly builds a personalized curriculum from the best content on the internet.
          </p>
          <form onSubmit={handleSubmit} className="w-full max-w-md relative">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-zinc-100 to-zinc-400 rounded-xl blur-lg opacity-20 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative flex items-center w-full bg-black/80 border border-white/20 rounded-xl shadow-lg backdrop-blur-sm">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
                <input 
                  id="learning-goal-input" 
                  className="w-full text-lg p-4 pl-11 bg-transparent rounded-xl focus:outline-none" 
                  type="text" 
                  placeholder="What do you want to master?"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  disabled={loading}
                />
                <button 
                  type="submit"
                  disabled={loading}
                  className="m-1.5 flex-shrink-0 bg-white hover:bg-zinc-200 text-black font-bold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? 'Building...' : 'Build Path'}
                </button>
              </div>
            </div>
          </form>
        </motion.div>

        {/* --- COLUMN 2: THE ENTIRE DASHBOARD --- */}
        <div className="flex flex-col gap-8">
          <StatsCard />
          <ContinueLearningCard />
          <RecentPaths />
        </div>

      </main>
      <footer className="p-4 sm:p-6 text-center text-zinc-600 text-sm z-10 container mx-auto">
        <p>&copy; 2025 Pathfinder AI. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
