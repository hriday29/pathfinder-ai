"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// A simple component to show a loading state
const CardSkeleton = () => (
  <div className="bg-zinc-900/50 border border-white/10 rounded-lg p-6 animate-pulse">
    <div className="h-5 bg-zinc-700 rounded w-1/3 mb-4"></div>
    <div className="h-8 bg-zinc-700 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-zinc-700 rounded w-1/2 mb-6"></div>
    <div className="h-10 bg-zinc-700 rounded-lg w-full"></div>
  </div>
);

export default function ContinueLearningCard() {
  const [nextLessonData, setNextLessonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchNextLesson = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const res = await fetch(`${baseUrl}/api/dashboard/getNextLesson`);
        const data = await res.json();
        setNextLessonData(data);
      } catch (error) {
        console.error("Failed to fetch next lesson data:", error);
        setNextLessonData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchNextLesson();
  }, []);

  if (loading) {
    return <CardSkeleton />;
  }

  if (!nextLessonData || !nextLessonData.lesson) {
    // This handles cases where the user has no paths or has completed their latest path
    return (
      <div className="bg-zinc-900/50 border border-white/10 rounded-lg p-6 text-center">
        <h2 className="text-lg font-bold text-white mb-2">All Caught Up!</h2>
        <p className="text-zinc-400">
          {nextLessonData?.message || "Start a new path to continue your journey."}
        </p>
      </div>
    );
  }

  const { pathId, pathTopic, lesson } = nextLessonData;

  const handleJumpBackIn = () => {
    router.push(`/path/${pathId}`);
  };

  return (
    <div className="bg-zinc-900/50 border border-white/10 rounded-lg p-6">
      <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">Continue Learning</h2>
      <p className="text-lg font-bold text-white mb-1">{pathTopic}</p>
      <p className="text-md text-zinc-300 mb-6">Next up: {lesson.lesson_title}</p>
      <button 
        onClick={handleJumpBackIn}
        className="w-full text-center bg-white hover:bg-zinc-200 text-black font-bold py-3 px-6 rounded-lg transition-all duration-300"
      >
        Jump Back In
      </button>
    </div>
  );
}
