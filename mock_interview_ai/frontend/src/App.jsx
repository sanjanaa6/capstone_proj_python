import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LandingScreen from './components/screens/LandingScreen';
import InterviewScreen from './components/screens/InterviewScreen';
import ReviewScreen from './components/screens/ReviewScreen';
import FinalSummaryScreen from './components/screens/FinalSummaryScreen';
import './index.css';

function App() {
  const [currentScreen, setCurrentScreen] = useState('landing');
  const [interviewData, setInterviewData] = useState({
    topic: '',
    questions: [],
    currentQuestionIndex: 0,
    answers: [],
    reviews: []
  });

  const parseReviewText = (reviewText, question) => {
    if (!reviewText || typeof reviewText !== 'string') return null;

    const normalized = reviewText.replace(/\r\n/g, '\n');
    const lines = normalized.split('\n').map((l) => l.trim()).filter(Boolean);
    const joined = lines.join('\n');

    const scoreMatch = joined.match(/Score\s*:\s*(\d+(?:\.\d+)?)\s*\/\s*10/i);
    const score = scoreMatch ? Number(scoreMatch[1]) : undefined;

    const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const pickSection = (labels) => {
      const allLabels = Array.isArray(labels) ? labels : [labels];
      const labelAlternation = allLabels.map((l) => escapeRegExp(l)).join('|');

      // Allow variants like:
      // "Strengths: ...", "**Strengths**: ...", "Strengths - ...", "### Strengths"
      const header = `(?:\\*{0,2}\\s*)?(?:${labelAlternation})(?:\\s*\\*{0,2})?`;
      const after = `(?:\\s*(?::|-|—)\\s*)?`;
      const stopLabels = ['Score', 'Feedback', 'Strengths', 'Improvements', 'Areas for Improvement', 'Areas of Improvement', 'Suggestions', 'Suggestions for Improvement', 'Weaknesses', 'Opportunities', 'Opportunity Areas', 'What went well', 'What to improve'];
      const stopAlt = stopLabels.map((l) => escapeRegExp(l)).join('|');

      const regex = new RegExp(
        `(?:^|\\n)(?:#{1,6}\\s*)?${header}${after}([\\s\\S]*?)(?=(?:\\n(?:#{1,6}\\s*)?(?:\\*{0,2}\\s*)?(?:${stopAlt})(?:\\s*\\*{0,2})?\\s*(?::|-|—)\\s*)|$)`,
        'i'
      );
      const m = joined.match(regex);
      return m && m[1] ? m[1].trim() : '';
    };

    const feedback = pickSection(['Feedback']);
    const strengthsRaw = pickSection(['Strengths', 'What went well', 'Pros', 'Positives']);
    const improvementsRaw = pickSection([
      'Improvements',
      'Areas for Improvement',
      'Areas of Improvement',
      'What to improve',
      'Suggestions',
      'Suggestions for Improvement',
      'Weaknesses',
      'Opportunity Areas',
      'Opportunities'
    ]);

    const toList = (raw) => {
      if (!raw) return [];

      const cleaned = raw
        .replace(/\r\n/g, '\n')
        .replace(/\*\*/g, '')
        .trim();

      // Prefer line-based bullets/numbering
      const byLines = cleaned
        .split('\n')
        .map((ln) => ln.trim())
        .filter(Boolean)
        .map((ln) => ln.replace(/^\s*(?:[-*•]|\u2022|\d+\.|\d+\)|\d+\-)\s+/, '').trim())
        .filter(Boolean);

      if (byLines.length > 1) return byLines;

      // Fallback: comma-separated or single-line bullets
      return cleaned
        .split(/,|•|\u2022|\s+-\s+/g)
        .map((s) => s.trim())
        .filter(Boolean);
    };

    const strengths = toList(strengthsRaw);
    const improvements = toList(improvementsRaw);

    return {
      score: typeof score === 'number' && Number.isFinite(score) ? score : undefined,
      feedback: feedback || '',
      strengths,
      improvements,
      question
    };
  };

  const normalizeReview = (review, question, answer) => {
    const fallback = generateMockReview(question, answer);
    if (!review) return { ...fallback, answer };
    if (typeof review === 'string') {
      const parsed = parseReviewText(review, question);
      return { ...(parsed || fallback), answer, question };
    }
    if (typeof review === 'object') {
      const merged = {
        ...review,
        question: review.question || question,
        answer
      };
      if (typeof merged.score === 'string') merged.score = Number(merged.score);
      if (!Array.isArray(merged.strengths) && typeof merged.strengths === 'string') {
        merged.strengths = merged.strengths.split(',').map((s) => s.trim()).filter(Boolean);
      }
      if (!Array.isArray(merged.improvements) && typeof merged.improvements === 'string') {
        merged.improvements = merged.improvements.split(',').map((s) => s.trim()).filter(Boolean);
      }
      return merged;
    }
    return { ...fallback, answer };
  };

  // API service functions
  const apiService = {
    startInterview: async (topic) => {
      try {
        const response = await fetch('http://localhost:8000/start-interview', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ topic }),
        });
        const data = await response.json();
        return data.questions || [];
      } catch (error) {
        console.error('Error starting interview:', error);
        // Fallback questions for demo
        return [
          "Tell me about your experience with React and modern frontend development.",
          "How do you handle state management in large applications?",
          "Describe a challenging technical problem you've solved recently.",
          "How do you ensure code quality and maintainability in your projects?",
          "What are your thoughts on the future of web development?"
        ];
      }
    },

    submitAnswer: async (question, answer) => {
      try {
        const response = await fetch('http://localhost:8000/submit-answer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ question, answer }),
        });
        const data = await response.json();
        return normalizeReview(data.review, question, answer);
      } catch (error) {
        console.error('Error submitting answer:', error);
        return normalizeReview(null, question, answer);
      }
    }
  };

  const generateMockReview = (question, answer) => ({
    score: Math.random() * 4 + 6, // Random score between 6-10
    feedback: "Good answer with room for improvement. Your understanding of the concepts is solid, but adding more real-world examples would strengthen your response.",
    strengths: ["Clear communication", "Good technical understanding", "Structured response"],
    improvements: ["Could provide more specific examples", "Consider mentioning best practices"],
    question: question
  });

  const handleStartInterview = async (topic) => {
    const questions = await apiService.startInterview(topic);
    setInterviewData({
      topic,
      questions,
      currentQuestionIndex: 0,
      answers: [],
      reviews: []
    });
    setCurrentScreen('interview');
  };

  const handleSubmitAnswer = async (answer, timeElapsed) => {
    const currentQuestion = interviewData.questions[interviewData.currentQuestionIndex];
    const review = await apiService.submitAnswer(currentQuestion, answer);
    
    const newAnswers = [...interviewData.answers, { question: currentQuestion, answer, timeElapsed }];
    const newReviews = [...interviewData.reviews, review];
    
    setInterviewData({
      ...interviewData,
      answers: newAnswers,
      reviews: newReviews
    });
    
    setCurrentScreen('review');
  };

  const handleNextQuestion = () => {
    const nextIndex = interviewData.currentQuestionIndex + 1;
    
    if (nextIndex >= interviewData.questions.length) {
      setCurrentScreen('summary');
    } else {
      setInterviewData({
        ...interviewData,
        currentQuestionIndex: nextIndex
      });
      setCurrentScreen('interview');
    }
  };

  const handlePreviousQuestion = () => {
    if (interviewData.currentQuestionIndex > 0) {
      setInterviewData({
        ...interviewData,
        currentQuestionIndex: interviewData.currentQuestionIndex - 1
      });
    }
  };

  const handleRestartInterview = () => {
    setInterviewData({
      topic: '',
      questions: [],
      currentQuestionIndex: 0,
      answers: [],
      reviews: []
    });
    setCurrentScreen('landing');
  };

  const calculateOverallScore = () => {
    if (interviewData.reviews.length === 0) return 0;
    const validScores = interviewData.reviews
      .map((r) => (typeof r?.score === 'number' && Number.isFinite(r.score) ? r.score : null))
      .filter((v) => v !== null);
    if (validScores.length === 0) return 0;
    const totalScore = validScores.reduce((acc, s) => acc + s, 0);
    return totalScore / validScores.length;
  };

  const calculateCommunicationScore = () => {
    // Mock calculation based on answer lengths and quality
    return Math.random() * 2 + 7; // Random between 7-9
  };

  const calculateConfidenceScore = () => {
    // Mock calculation based on response times and consistency
    return Math.random() * 2 + 6; // Random between 6-8
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'landing':
        return (
          <LandingScreen onStartInterview={handleStartInterview} />
        );
      
      case 'interview':
        return (
          <InterviewScreen
            currentQuestion={interviewData.questions[interviewData.currentQuestionIndex]}
            questionNumber={interviewData.currentQuestionIndex + 1}
            totalQuestions={interviewData.questions.length}
            onSubmitAnswer={handleSubmitAnswer}
            onNextQuestion={handleNextQuestion}
            onPreviousQuestion={handlePreviousQuestion}
          />
        );
      
      case 'review':
        const currentReview = interviewData.reviews[interviewData.currentQuestionIndex];
        const currentAnswer = interviewData.answers[interviewData.currentQuestionIndex];
        return (
          <ReviewScreen
            review={currentReview}
            question={currentAnswer.question}
            answer={currentAnswer.answer}
            onNextQuestion={handleNextQuestion}
            isLastQuestion={interviewData.currentQuestionIndex === interviewData.questions.length - 1}
          />
        );
      
      case 'summary':
        return (
          <FinalSummaryScreen
            overallScore={calculateOverallScore()}
            questionReviews={interviewData.reviews}
            answers={interviewData.answers}
            communicationScore={calculateCommunicationScore()}
            confidenceScore={calculateConfidenceScore()}
            onRestartInterview={handleRestartInterview}
          />
        );
      
      default:
        return <LandingScreen onStartInterview={handleStartInterview} />;
    }
  };

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default App;
