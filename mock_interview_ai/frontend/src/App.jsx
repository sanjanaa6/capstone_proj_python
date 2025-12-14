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
        return data.review || generateMockReview(question, answer);
      } catch (error) {
        console.error('Error submitting answer:', error);
        return generateMockReview(question, answer);
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
    const totalScore = interviewData.reviews.reduce((acc, review) => acc + review.score, 0);
    return totalScore / interviewData.reviews.length;
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
