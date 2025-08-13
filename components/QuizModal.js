"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function QuizModal({ quiz, onClose, onQuizComplete }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // This useEffect hook now triggers when the quiz is finished.
  // It calls the onQuizComplete function and passes the final score up.
  useEffect(() => {
    if (isFinished) {
      onQuizComplete(score);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished]); // We only want this to run once when isFinished becomes true


  if (!quiz || !quiz.questions || quiz.questions.length === 0) return null;

  const currentQuestion = quiz.questions[currentQuestionIndex];

  const handleAnswer = (option) => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedOption(option);
    if (option === currentQuestion.answer) {
      setScore(prevScore => prevScore + 1);
    }
  };

  const handleNextQuestion = () => {
    setIsAnswered(false);
    setSelectedOption(null);
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  const handleFinishQuiz = () => {
    setIsFinished(true);
  };

  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

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
          onClick={(e) => e.stopPropagation()}
        >
          {!isFinished ? (
            <>
              <h2 className="text-xl font-bold text-white mb-1">Knowledge Check ({currentQuestionIndex + 1}/{quiz.questions.length})</h2>
              <p className="text-zinc-300 mb-6">{currentQuestion.question}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedOption === option;
                  const isCorrectAnswer = currentQuestion.answer === option;
                  let buttonClass = "p-4 rounded-lg text-left transition-all duration-300 border";
                  if (isAnswered) {
                    if (isCorrectAnswer) {
                      buttonClass += " bg-green-500/20 border-green-500";
                    } else if (isSelected) {
                      buttonClass += " bg-red-500/20 border-red-500";
                    } else {
                      buttonClass += " bg-white/5 border-white/10 opacity-50";
                    }
                  } else {
                    buttonClass += " bg-white/5 hover:bg-white/10 border-white/10";
                  }
                  return (
                    <button key={index} onClick={() => handleAnswer(option)} disabled={isAnswered} className={buttonClass}>
                      {option}
                    </button>
                  );
                })}
              </div>
              {isAnswered && (
                <div className="mt-6 text-center">
                  {!isLastQuestion ? (
                    <button onClick={handleNextQuestion} className="bg-white text-black font-bold py-2 px-8 rounded-lg">Next Question</button>
                  ) : (
                    <button onClick={handleFinishQuiz} className="bg-white text-black font-bold py-2 px-8 rounded-lg">Finish Quiz</button>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Quiz Complete!</h2>
              <p className="text-4xl font-black text-white mb-2">{score} / {quiz.questions.length}</p>
              <p className="text-zinc-400 mb-6">You have completed the knowledge check.</p>
              <button onClick={onClose} className="bg-white text-black font-bold py-2 px-8 rounded-lg">Close</button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
