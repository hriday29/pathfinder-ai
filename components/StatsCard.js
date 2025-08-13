"use client";

import { useState, useEffect } from 'react';

// A simple component to show a loading state
const StatSkeleton = () => (
  <div className="bg-zinc-800/50 p-4 rounded-lg animate-pulse">
    <div className="h-6 bg-zinc-700 rounded w-1/4 mb-2"></div>
    <div className="h-4 bg-zinc-700 rounded w-1/2"></div>
  </div>
);

export default function StatsCard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const res = await fetch(`${baseUrl}/api/dashboard/getStats`);
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
        // Set stats to null or some default error state
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="bg-zinc-900/50 border border-white/10 rounded-lg p-6">
      <h2 className="text-lg font-bold text-white mb-4">Your Progress</h2>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatSkeleton />
          <StatSkeleton />
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Paths Started Stat */}
          <div className="bg-zinc-800/50 p-4 rounded-lg">
            <p className="text-3xl font-black text-white">{stats.pathsStarted}</p>
            <p className="text-sm text-zinc-400">Paths Started</p>
          </div>
          {/* Lessons Completed Stat */}
          <div className="bg-zinc-800/50 p-4 rounded-lg">
            <p className="text-3xl font-black text-white">{stats.lessonsCompleted}</p>
            <p className="text-sm text-zinc-400">Lessons Completed</p>
          </div>
        </div>
      ) : (
        <p className="text-zinc-400">Could not load your stats.</p>
      )}
    </div>
  );
}
