"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function QuizModal({ quiz, onClose }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  const handleAnswer = (option) => {
    setSelectedOption(option);
    if (option === quiz.answer) {
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
    }
  };

  if (!quiz) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-zinc-900 border border-white/10 rounded-2xl shadow-lg p-8 w-full max-w-2xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
        >
          <h2 className="text-2xl font-bold text-white mb-4">Knowledge Check</h2>
          <p className="text-zinc-300 mb-6">{quiz.question}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quiz.options.map((option, index) => {
              const isSelected = selectedOption === option;
              const isAnswer = quiz.answer === option;

              let buttonClass = "p-4 rounded-lg text-left transition-all duration-300 border";

              if (isSelected) {
                buttonClass += isCorrect ? " bg-green-500/20 border-green-500" : " bg-red-500/20 border-red-500";
              } else if (selectedOption !== null && isAnswer) {
                buttonClass += " bg-green-500/20 border-green-500"; // Show correct answer after selection
              } else {
                buttonClass += " bg-white/5 hover:bg-white/10 border-white/10";
              }
              
              return (
                <button key={index} onClick={() => handleAnswer(option)} disabled={selectedOption !== null} className={buttonClass}>
                  {option}
                </button>
              );
            })}
          </div>

          <button onClick={onClose} className="mt-8 w-full bg-white text-black font-bold py-2 px-4 rounded-lg">
            Close
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
