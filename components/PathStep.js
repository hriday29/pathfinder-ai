// "use client";
// import { motion } from "framer-motion";
// import { useState } from "react";
// import QuizModal from "./QuizModal"; // Import the new component

// export default function PathStep({ step, index }) {
//   const { title, description, key_takeaways = [], Youtube_query, quiz } = step;
//   const [isQuizOpen, setIsQuizOpen] = useState(false);

//   const handleFindVideo = () => {
//     window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(Youtube_query)}`, "_blank");
//   };

//   return (
//     <>
//       <motion.div
//         className="bg-zinc-900/50 border border-white/10 rounded-lg p-6"
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5, delay: index * 0.1 }}
//       >
//         <h3 className="font-bold text-lg text-white">{index + 1}. {title}</h3>
//         <p className="text-zinc-400 mt-2 text-sm">{description}</p>
        
//         {Array.isArray(key_takeaways) && key_takeaways.length > 0 && (
//           <div className="mt-4">
//             <p className="text-xs font-semibold text-zinc-500 uppercase">Key Takeaways:</p>
//             <ul className="list-disc list-inside mt-2 space-y-1 text-zinc-300 text-sm">
//               {key_takeaways.map((takeaway, i) => (
//                 <li key={i}>{takeaway}</li>
//               ))}
//             </ul>
//           </div>
//         )}

//         {/* New buttons section */}
//         <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
//           <button 
//             onClick={handleFindVideo}
//             className="w-full text-center bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-4 rounded-lg text-sm transition-all duration-300"
//           >
//             Find Video
//           </button>
//           <button 
//             onClick={() => setIsQuizOpen(true)}
//             className="w-full text-center bg-white hover:bg-zinc-200 text-black font-bold py-2 px-4 rounded-lg text-sm transition-all duration-300"
//           >
//             Test My Knowledge
//           </button>
//         </div>
//       </motion.div>

//       {/* Conditionally render the Quiz Modal */}
//       {isQuizOpen && <QuizModal quiz={quiz} onClose={() => setIsQuizOpen(false)} />}
//     </>
//   );
// }

"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import QuizModal from "./QuizModal";

export default function PathStep({ step, index }) {
  const { title, description, key_takeaways = [], videoId, quiz } = step;
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [showVideo, setShowVideo] = useState(false); // State to control video visibility

  return (
    <>
      <motion.div
        className="bg-zinc-900/50 border border-white/10 rounded-lg p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
      >
        <h3 className="font-bold text-lg text-white">{index + 1}. {title}</h3>
        <p className="text-zinc-400 mt-2 text-sm">{description}</p>
        
        {/* Render the embedded video player when showVideo is true */}
        <AnimatePresence>
          {showVideo && videoId && (
            <motion.div
              className="aspect-video mt-4 rounded-lg overflow-hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </motion.div>
          )}
        </AnimatePresence>
        
        {Array.isArray(key_takeaways) && key_takeaways.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-zinc-500 uppercase">Key Takeaways:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-zinc-300 text-sm">
              {key_takeaways.map((takeaway, i) => (
                <li key={i}>{takeaway}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button 
            onClick={() => setShowVideo(!showVideo)}
            disabled={!videoId}
            className="w-full text-center bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-4 rounded-lg text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {videoId ? (showVideo ? "Hide Lesson" : "Watch Lesson") : "Video Not Found"}
          </button>
          <button 
            onClick={() => setIsQuizOpen(true)}
            className="w-full text-center bg-white hover:bg-zinc-200 text-black font-bold py-2 px-4 rounded-lg text-sm transition-all duration-300"
          >
            Test My Knowledge
          </button>
        </div>
      </motion.div>

      {isQuizOpen && <QuizModal quiz={quiz} onClose={() => setIsQuizOpen(false)} />}
    </>
  );
}
