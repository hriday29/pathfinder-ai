"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function RecentPaths() {
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaths = async () => {
      try {
        const response = await fetch('/api/getRecentPaths');
        const data = await response.json();
        if (response.ok) {
          setPaths(data.paths);
        } else {
          console.error(data.error);
        }
      } catch (error) {
        console.error("Failed to fetch recent paths:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaths();
  }, []);

  return (
    <motion.div 
      className="hidden md:flex flex-col mt-10 bg-white/5 border border-white/10 rounded-2xl shadow-lg backdrop-blur-sm p-8"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      <div className="w-full">
        <h2 className="text-2xl font-bold mb-6 text-zinc-200 border-b border-zinc-700 pb-2">
          Your Recent Paths
        </h2>
        
        {loading && (
          <div className="space-y-4">
            <div className="w-full h-16 bg-zinc-700/50 rounded-lg animate-pulse"></div>
            <div className="w-full h-16 bg-zinc-700/50 rounded-lg animate-pulse" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-full h-16 bg-zinc-700/50 rounded-lg animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          </div>
        )}

        {!loading && paths.length > 0 && (
          <div className="space-y-4">
            {paths.map((path) => (
              <Link href={`/path/${path._id}`} key={path._id}>
                <motion.div 
                  className="bg-zinc-900/50 border border-white/10 rounded-lg p-4 hover:bg-zinc-800/50 cursor-pointer transition-colors"
                  whileHover={{ scale: 1.02 }}
                >
                  <h3 className="font-bold text-white truncate">{path.topic}</h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Created on {new Date(path.createdAt).toLocaleDateString()}
                  </p>
                </motion.div>
              </Link>
            ))}
          </div>
        )}

        {!loading && paths.length === 0 && (
           <div className="text-center text-zinc-400 pt-16">
             <p>You haven't created any paths yet.</p>
             <p className="text-sm mt-2">Generate your first one to get started!</p>
           </div>
        )}
      </div>
    </motion.div>
  );
}
