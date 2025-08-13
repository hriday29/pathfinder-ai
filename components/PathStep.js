"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import QuizModal from "./QuizModal";

// PathStep now expects two new props:
// 1. pathId: The ID of the entire learning path.
// 2. onLessonComplete: A function passed down from the parent page to update the state.
export default function PathStep({ step, index, pathId, onLessonComplete }) {
  const { lesson_title: title, description, content, quiz, completed } = step;

  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [showContent, setShowContent] = useState(false);

  const hasContent = content && content.id;
  const isPlaylist = hasContent && content.type === 'playlist';

  // Constructing the correct embed URL
  const embedUrl = hasContent 
    ? (isPlaylist
        ? `https://www.youtube.com/embed/videoseries?list=${content.id}` 
        : `https://www.youtube.com/embed/${content.id}`
      )
    : '';

  // This function will be passed to the QuizModal.
  // When the quiz is successfully completed, it calls the function from the parent page.
  const handleQuizCompletion = () => {
    // Call the function passed from the main page to update the global state
    onLessonComplete(title); 
  };

  return (
    <>
      {/* Added a conditional class for completed steps for visual feedback */}
      <motion.div
        className={`bg-zinc-900/50 border border-white/10 rounded-lg p-6 transition-colors duration-500 ${completed ? 'border-green-500/50' : ''}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
      >
        {/* Renders a checkmark if the lesson is complete */}
        <h3 className="font-bold text-lg text-white flex items-center">
          {completed && <span className="text-green-500 mr-3 text-xl">✓</span>}
          {index + 1}. {title}
        </h3>
        <p className="text-zinc-400 mt-2 text-sm">{description}</p>
        
        <AnimatePresence>
          {showContent && hasContent && (
            <motion.div
              className="aspect-video mt-4 rounded-lg overflow-hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <iframe
                className="w-full h-full"
                src={embedUrl}
                title="YouTube content player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button 
            onClick={() => setShowContent(!showContent)}
            disabled={!hasContent}
            className="w-full text-center bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-4 rounded-lg text-sm transition-all duration-300 disabled:opacity-50"
          >
            {hasContent ? (showContent ? 'Hide Content' : (isPlaylist ? 'Watch Course' : 'Watch Lesson')) : 'Content Not Found'}
          </button>
          
          {/* Button style and text change if lesson is complete */}
          <button 
            onClick={() => setIsQuizOpen(true)}
            disabled={!quiz}
            className={`w-full text-center font-bold py-2 px-4 rounded-lg text-sm transition-all duration-300 disabled:opacity-50 ${completed ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-white text-black hover:bg-zinc-200'}`}
          >
            {completed ? 'Review Knowledge' : 'Test My Knowledge'}
          </button>
        </div>
      </motion.div>

      {/* Pass the handler and pathId down to the QuizModal */}
      {isQuizOpen && quiz && (
        <QuizModal 
          quiz={quiz} 
          pathId={pathId}
          lessonTitle={title}
          onClose={() => setIsQuizOpen(false)} 
          onQuizComplete={handleQuizCompletion}
        />
      )}
    </>
  );
}
