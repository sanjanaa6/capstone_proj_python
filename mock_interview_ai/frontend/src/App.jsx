import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Mic, Settings, Star, Trophy, User } from 'lucide-react';
import LandingScreen from './components/screens/LandingScreen';
import InterviewScreen from './components/screens/InterviewScreen';
import ReviewScreen from './components/screens/ReviewScreen';
import FinalSummaryScreen from './components/screens/FinalSummaryScreen';
import DashboardOverviewScreen from './components/screens/DashboardOverviewScreen';
import ChatbotScreen from './components/screens/ChatbotScreen';
import SettingsScreen from './components/screens/SettingsScreen';
import ProfileScreen from './components/screens/ProfileScreen';
import DashboardLayout from './components/layout/DashboardLayout';
import { startInterview, submitAnswer } from './api';
import './index.css';

function App() {
  const [currentScreen, setCurrentScreen] = useState('landing');
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);
  const [interviewData, setInterviewData] = useState({
    topic: '',
    questions: [],
    currentQuestionIndex: 0,
    answers: [],
    reviews: []
  });

  const getLatestScore = () => {
    if (!Array.isArray(interviewData.reviews) || interviewData.reviews.length === 0) return undefined;
    const last = interviewData.reviews[interviewData.reviews.length - 1];
    const s = last?.score;
    return typeof s === 'number' && Number.isFinite(s) ? s : undefined;
  };

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
    const fallback = {
      score: undefined,
      feedback: '',
      strengths: [],
      improvements: [],
      question
    };
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

  const generateMockReview = (question, answer) => ({
    score: Math.random() * 4 + 6, // Random score between 6-10
    feedback: "Good answer with room for improvement. Your understanding of the concepts is solid, but adding more real-world examples would strengthen your response.",
    strengths: ["Clear communication", "Good technical understanding", "Structured response"],
    improvements: ["Could provide more specific examples", "Consider mentioning best practices"],
    question: question
  });

  const handleStartInterview = async (topic) => {
    let questions = [];
    try {
      const data = await startInterview({ topic });
      questions = data?.questions || [];
    } catch (error) {
      console.error('Error starting interview:', error);
      // Fallback questions for demo
      questions = [
        "Tell me about your experience with React and modern frontend development.",
        "How do you handle state management in large applications?",
        "Describe a challenging technical problem you've solved recently.",
        "How do you ensure code quality and maintainability in your projects?",
        "What are your thoughts on the future of web development?"
      ];
    }
    setInterviewData({
      topic,
      questions,
      currentQuestionIndex: 0,
      answers: [],
      reviews: []
    });
    setActiveReviewIndex(0);
    setCurrentScreen('dashboard');
  };

  const handleSubmitAnswer = async (answer, timeElapsed) => {
    const currentQuestion = interviewData.questions[interviewData.currentQuestionIndex];
    let review;
    try {
      const data = await submitAnswer({ question: currentQuestion, answer });
      review = normalizeReview(data?.review, currentQuestion, answer);
    } catch (error) {
      console.error('Error submitting answer:', error);
      review = normalizeReview(null, currentQuestion, answer);
    }
    
    const newAnswers = [...interviewData.answers, { question: currentQuestion, answer, timeElapsed }];
    const newReviews = [...interviewData.reviews, review];
    const nextIndex = interviewData.currentQuestionIndex + 1;
    
    setInterviewData({
      ...interviewData,
      answers: newAnswers,
      reviews: newReviews,
      currentQuestionIndex: nextIndex
    });

    setActiveReviewIndex(newReviews.length - 1);
    
    if (nextIndex >= interviewData.questions.length) {
      setCurrentScreen('summary');
    } else {
      setCurrentScreen('interview');
    }
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
    setActiveReviewIndex(0);
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
    const hasStarted = Array.isArray(interviewData.questions) && interviewData.questions.length > 0;
    const safeReviewIndex = Math.max(0, Math.min(activeReviewIndex, (interviewData.reviews?.length || 0) - 1));
    const canViewCurrentReview =
      Array.isArray(interviewData.answers) &&
      Array.isArray(interviewData.reviews) &&
      interviewData.answers.length > safeReviewIndex &&
      interviewData.reviews.length > safeReviewIndex;
    const canViewSummary = Array.isArray(interviewData.reviews) && interviewData.reviews.length > 0;

    const navItems = [
      { key: 'dashboard', label: 'Overview', icon: Home, disabled: !hasStarted },
      { key: 'chatbot', label: 'Chatbot', icon: Star },
      { key: 'interview', label: 'Interview', icon: Mic, disabled: !hasStarted },
      {
        key: 'review',
        label: 'Review',
        icon: Star,
        disabled: !canViewCurrentReview,
        badge: canViewCurrentReview ? `${safeReviewIndex + 1}` : undefined
      },
      { key: 'summary', label: 'Summary', icon: Trophy, disabled: !canViewSummary },
      { key: 'profile', label: 'Profile', icon: User },
      { key: 'settings', label: 'Settings', icon: Settings }
    ];

    const activeKey = currentScreen;
    const headerTitleByKey = {
      dashboard: 'Overview',
      chatbot: 'Chatbot',
      interview: 'Interview',
      review: 'Review',
      summary: 'Summary',
      profile: 'Profile',
      settings: 'Settings'
    };
    const headerTitle = headerTitleByKey[currentScreen] || 'Dashboard';
    const headerSubtitle = hasStarted ? `Topic: ${interviewData.topic || '—'}` : 'Start an interview to unlock the dashboard.';

    const dashboardHeaderRight = hasStarted ? (
      <button type="button" className="ds-header-btn" onClick={handleRestartInterview}>
        Restart
      </button>
    ) : null;

    const wrapDashboard = (node) => (
      <DashboardLayout
        activeKey={activeKey}
        items={navItems}
        headerTitle={headerTitle}
        headerSubtitle={headerSubtitle}
        onNavigate={(key) => setCurrentScreen(key)}
        headerRight={dashboardHeaderRight}
      >
        {node}
      </DashboardLayout>
    );

    switch (currentScreen) {
      case 'landing':
        return (
          <LandingScreen onStartInterview={handleStartInterview} />
        );

      case 'dashboard':
        return wrapDashboard(
          <DashboardOverviewScreen
            topic={interviewData.topic}
            totalQuestions={interviewData.questions.length}
            answeredCount={interviewData.answers.length}
            averageScore={calculateOverallScore()}
            latestScore={getLatestScore()}
            onContinue={() => setCurrentScreen('interview')}
          />
        );

      case 'chatbot':
        return wrapDashboard(<ChatbotScreen topic={interviewData.topic} />);

      case 'profile':
        return wrapDashboard(<ProfileScreen />);
      
      case 'interview':
        return wrapDashboard(
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
        {
          const safeReviewIndex = Math.max(0, Math.min(activeReviewIndex, (interviewData.reviews?.length || 0) - 1));
          const currentReview = interviewData.reviews[safeReviewIndex] || {};
          const currentAnswer = interviewData.answers[safeReviewIndex] || {};
          return wrapDashboard(
            <ReviewScreen
              review={currentReview}
              question={currentAnswer.question || ''}
              answer={currentAnswer.answer || ''}
              onNextQuestion={handleNextQuestion}
              isLastQuestion={interviewData.currentQuestionIndex === interviewData.questions.length - 1}
            />
          );
        }
      
      case 'summary':
        return wrapDashboard(
          <FinalSummaryScreen
            overallScore={calculateOverallScore()}
            questionReviews={interviewData.reviews}
            answers={interviewData.answers}
            communicationScore={calculateCommunicationScore()}
            confidenceScore={calculateConfidenceScore()}
            onRestartInterview={handleRestartInterview}
          />
        );

      case 'settings':
        return wrapDashboard(<SettingsScreen />);
      
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
