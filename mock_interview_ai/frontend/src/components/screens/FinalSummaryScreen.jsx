import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Star, Award, RotateCcw, Download, Share2 } from 'lucide-react';

const FinalSummaryScreen = ({ 
  overallScore, 
  questionReviews, 
  communicationScore, 
  confidenceScore, 
  onRestartInterview 
}) => {
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

  const getPerformanceMessage = (score) => {
    if (score >= 8) return "Outstanding performance! You're interview-ready!";
    if (score >= 6) return "Great job! With a bit more practice, you'll be excellent!";
    return "Good effort! Keep practicing to build your confidence.";
  };

  const averageQuestionScore = questionReviews.reduce((acc, review) => acc + review.score, 0) / questionReviews.length;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        {/* Header with trophy animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="inline-block mb-4"
          >
            <Trophy className="w-16 h-16 text-yellow-500" />
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-bold text-gradient mb-2">
            Interview Complete!
          </h1>
          <p className="text-xl text-gray-600">
            {getPerformanceMessage(overallScore)}
          </p>
        </motion.div>

        {/* Overall Score Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="card mb-8 text-center"
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Overall Performance</h2>
          
          <div className="relative inline-flex items-center justify-center w-40 h-40 mb-4">
            <svg className="transform -rotate-90 w-40 h-40">
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="10"
                fill="none"
                className="text-gray-200"
              />
              <motion.circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="10"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 70}`}
                strokeDashoffset={`${2 * Math.PI * 70 * (1 - getScoreProgress(overallScore) / 100)}`}
                className={getScoreColor(overallScore)}
                initial={{ strokeDashoffset: 2 * Math.PI * 70 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 70 * (1 - getScoreProgress(overallScore) / 100) }}
                transition={{ duration: 1.5, delay: 0.5 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>
                {overallScore.toFixed(1)}
              </span>
              <span className="text-sm text-gray-600">/ 10</span>
            </div>
          </div>

          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${getScoreBgColor(overallScore)} ${getScoreColor(overallScore)}`}>
            <Award className="w-4 h-4" />
            <span className="font-medium">
              {overallScore >= 8 ? 'Exceptional' : overallScore >= 6 ? 'Good' : 'Developing'}
            </span>
          </div>
        </motion.div>

        {/* Performance Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid md:grid-cols-3 gap-6 mb-8"
        >
          {/* Communication Score */}
          <div className="card text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Communication</h3>
            <div className={`text-2xl font-bold ${getScoreColor(communicationScore)}`}>
              {communicationScore.toFixed(1)}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${getScoreProgress(communicationScore)}%` }}
                transition={{ duration: 1, delay: 0.6 }}
                className="bg-blue-500 h-2 rounded-full"
              />
            </div>
          </div>

          {/* Confidence Score */}
          <div className="card text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Star className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Confidence</h3>
            <div className={`text-2xl font-bold ${getScoreColor(confidenceScore)}`}>
              {confidenceScore.toFixed(1)}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${getScoreProgress(confidenceScore)}%` }}
                transition={{ duration: 1, delay: 0.7 }}
                className="bg-purple-500 h-2 rounded-full"
              />
            </div>
          </div>

          {/* Average Question Score */}
          <div className="card text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trophy className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Question Average</h3>
            <div className={`text-2xl font-bold ${getScoreColor(averageQuestionScore)}`}>
              {averageQuestionScore.toFixed(1)}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${getScoreProgress(averageQuestionScore)}%` }}
                transition={{ duration: 1, delay: 0.8 }}
                className="bg-green-500 h-2 rounded-full"
              />
            </div>
          </div>
        </motion.div>

        {/* Question-wise Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="card mb-8"
        >
          <h3 className="font-semibold text-gray-800 mb-4">Question-wise Performance</h3>
          <div className="space-y-3">
            {questionReviews.map((review, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Question {index + 1}</p>
                    <p className="text-sm text-gray-600 truncate max-w-md">
                      {review.question?.substring(0, 60)}...
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${getScoreColor(review.score)}`}>
                    {review.score.toFixed(1)}
                  </span>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${getScoreProgress(review.score)}%` }}
                      transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                      className={`h-2 rounded-full ${review.score >= 8 ? 'bg-green-500' : review.score >= 6 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Motivational Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="card bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 mb-8"
        >
          <div className="text-center">
            <h3 className="font-semibold text-blue-800 mb-2">Keep Up the Great Work!</h3>
            <p className="text-blue-700">
              Every interview makes you stronger. Practice regularly, stay confident, and remember that 
              your unique perspective and experiences are valuable. You're doing amazing!
            </p>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRestartInterview}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Practice Again
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Report
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share Results
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default FinalSummaryScreen;
