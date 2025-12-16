import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, TrendingUp, Lightbulb, ArrowRight, Star } from 'lucide-react';

const ReviewScreen = ({ 
  review, 
  question, 
  answer, 
  onNextQuestion, 
  isLastQuestion = false 
}) => {
  const score = typeof review?.score === 'number' && Number.isFinite(review.score) ? review.score : undefined;
  const strengths = Array.isArray(review?.strengths) ? review.strengths.filter(Boolean) : [];
  const improvements = Array.isArray(review?.improvements) ? review.improvements.filter(Boolean) : [];
  const feedback = typeof review?.feedback === 'string' ? review.feedback.trim() : '';
  const confidenceTip = typeof review?.confidenceTip === 'string' ? review.confidenceTip.trim() : '';

  const hasAnyFeedback = score !== undefined || strengths.length > 0 || improvements.length > 0 || Boolean(feedback);

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 8) return 'bg-green-100';
    if (score >= 6) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getScoreProgress = (score) => {
    return (score / 10) * 100;
  };

  return (
    <div className="screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="screen-inner"
      >
        {/* Score display */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Performance</h2>
          
          {/* Circular progress */}
          {score !== undefined ? (
            <div className="relative inline-flex items-center justify-center w-32 h-32 mb-4">
              <svg className="transform -rotate-90 w-32 h-32">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200"
                />
                <motion.circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - getScoreProgress(score) / 100)}`}
                  className={getScoreColor(score)}
                  initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 56 * (1 - getScoreProgress(score) / 100) }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-bold ${getScoreColor(score)}`}>
                  {score.toFixed(1)}
                </span>
                <span className="text-sm text-gray-600">/ 10</span>
              </div>
            </div>
          ) : (
            <div className="text-gray-600 text-sm mb-4">No score available.</div>
          )}
        </motion.div>

        {/* Feedback sections */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Strengths */}
          {strengths.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="card bg-green-50 border border-green-200"
            >
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-800">Strengths</h3>
              </div>
              <ul className="space-y-2">
                {strengths.map((strength, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                    className="flex items-start gap-2 text-green-700"
                  >
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-sm">{strength}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ) : null}

          {/* Improvements */}
          {improvements.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="card bg-yellow-50 border border-yellow-200"
            >
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                <h3 className="font-semibold text-yellow-800">Areas for Improvement</h3>
              </div>
              <ul className="space-y-2">
                {improvements.map((improvement, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                    className="flex items-start gap-2 text-yellow-700"
                  >
                    <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-sm">{improvement}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ) : null}
        </div>

        {!hasAnyFeedback ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="card mb-8"
          >
            <h3 className="font-semibold text-gray-800 mb-3">Detailed Feedback</h3>
            <p className="text-gray-600 leading-relaxed">No feedback available for this question.</p>
          </motion.div>
        ) : null}

        {/* Detailed feedback */}
        {feedback ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="card mb-8"
          >
            <h3 className="font-semibold text-gray-800 mb-3">Detailed Feedback</h3>
            <p className="text-gray-600 leading-relaxed">{feedback}</p>
          </motion.div>
        ) : null}

        {/* Confidence tip */}
        {confidenceTip ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="card mb-8"
            style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #faf5ff 100%)', border: '1px solid #e9d5ff' }}
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-purple-800 mb-1">Confidence Tip</h4>
                <p className="text-purple-700 text-sm">{confidenceTip}</p>
              </div>
            </div>
          </motion.div>
        ) : null}

        {/* Next button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNextQuestion}
            className="btn-primary flex items-center gap-2 mx-auto"
          >
            {isLastQuestion ? 'View Summary' : 'Next Question'}
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ReviewScreen;
