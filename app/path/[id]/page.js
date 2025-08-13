"use client"; // This must be a client component to manage state

import { useState, useEffect } from 'react';
import Header from "../../../components/Header";
import PathStep from "../../../components/PathStep";

export default function PathPage({ params }) {
  // --- NEW: State management for path data, loading, and errors ---
  const [pathData, setPathData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pathId = params.id;

  // --- NEW: Fetch data on the client side when the component mounts ---
  useEffect(() => {
    const getPathData = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        // Assuming your API route to get a single path is /api/path/[id]
        const res = await fetch(`${baseUrl}/api/path/${pathId}`, { cache: 'no-store' });
        
        if (!res.ok) {
          throw new Error('Failed to fetch path data');
        }
        const data = await res.json();
        setPathData(data.path); // Set the path data from the response
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (pathId) {
      getPathData();
    }
  }, [pathId]);

  // --- NEW: Function to handle lesson completion ---
  const handleLessonComplete = async (lessonTitle, score) => {
    // 1. Optimistic UI Update: Update the state immediately
    setPathData(currentPathData => {
      const newModules = currentPathData.modules.map(module => ({
        ...module,
        lessons: module.lessons.map(lesson =>
          lesson.lesson_title === lessonTitle ? { ...lesson, completed: true } : lesson
        )
      }));
      return { ...currentPathData, modules: newModules };
    });

    // 2. Backend API Call: Send the update to the server
    try {
      await fetch('/api/markComplete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pathId: pathId, lesson_title: lessonTitle, score: score }),
      });
    } catch (error) {
      console.error("Failed to mark lesson as complete on server:", error);
      // Optional: Add logic to revert the optimistic update if the API call fails
    }
  };

  // --- NEW: Loading and Error states ---
  if (loading) {
    return (
        <div className="text-white flex flex-col min-h-screen antialiased">
            <Header />
            <main className="container mx-auto p-4 sm:p-6 flex-grow flex items-center justify-center">
                <p className="text-xl text-zinc-400">Loading your path...</p>
            </main>
        </div>
    );
  }

  if (error) {
    return (
        <div className="text-white flex flex-col min-h-screen antialiased">
            <Header />
            <main className="container mx-auto p-4 sm:p-6 flex-grow flex items-center justify-center">
                <p className="text-xl text-red-500">Error: {error}</p>
            </main>
        </div>
    );
  }

  return (
    <div className="text-white flex flex-col min-h-screen antialiased">
      <Header />
      <main className="container mx-auto p-4 sm:p-6 flex-grow">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-black tracking-tighter mb-2">
            Your Path to Master <span className="text-zinc-400">{pathData.topic}</span>
          </h1>
          <p className="text-zinc-400 mb-12">
            Generated on {new Date(pathData.createdAt).toLocaleDateString()}
          </p>
          
          <div className="space-y-12">
            {pathData.modules && pathData.modules.map((module, moduleIndex) => (
              <div key={moduleIndex}>
                <h2 className="text-2xl font-bold border-b-2 border-zinc-700 pb-2 mb-6">
                  {module.module_title}
                </h2>
                <div className="space-y-4">
                  {module.lessons && module.lessons.map((lesson, lessonIndex) => (
                    // --- MODIFIED: Pass the new props to PathStep ---
                    <PathStep 
                      key={lesson.lesson_title} // Use a unique key
                      step={lesson} // Pass the whole lesson object
                      index={lessonIndex}
                      pathId={pathId} // Pass the pathId
                      onLessonComplete={handleLessonComplete} // Pass the handler function
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <footer className="p-4 sm:p-6 text-center text-zinc-600 text-sm z-10 container mx-auto">
        <p>&copy; 2025 Pathfinder AI. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
