import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Mic, Settings, Star, Trophy, User, Cpu, Briefcase } from 'lucide-react';
import LandingScreen from './components/screens/LandingScreen';
import LoginScreen from './components/screens/LoginScreen';
import JobDescriptionSetupScreen from './components/screens/JobDescriptionSetupScreen';
import InterviewScreen from './components/screens/InterviewScreen';
import ReviewScreen from './components/screens/ReviewScreen';
import FinalSummaryScreen from './components/screens/FinalSummaryScreen';
import DashboardOverviewScreen from './components/screens/DashboardOverviewScreen';
import ChatbotScreen from './components/screens/ChatbotScreen';
import SettingsScreen from './components/screens/SettingsScreen';
import ProfileScreen from './components/screens/ProfileScreen';
import RLAnalyticsScreen from './components/screens/RLAnalyticsScreen';
import DashboardLayout from './components/layout/DashboardLayout';
import { startInterview, submitAnswer, startRLInterview, submitRLStep } from './api';
import './index.css';

function App() {
  const [currentScreen, setCurrentScreen] = useState('landing');
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);
  const [candidateUser, setCandidateUser] = useState(null);

  const [interviewData, setInterviewData] = useState({
    topic: '',
    questions: [],
    currentQuestionIndex: 0,
    answers: [],
    reviews: [],
    isRLMode: false,
    rlDifficulty: 'Medium',
    rlActionName: '',
    rlHistory: []
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

      const byLines = cleaned
        .split('\n')
        .map((ln) => ln.trim())
        .filter(Boolean)
        .map((ln) => ln.replace(/^\s*(?:[-*•]|\u2022|\d+\.|\d+\)|\d+\-)\s+/, '').trim())
        .filter(Boolean);

      if (byLines.length > 1) return byLines;

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

  const handleLoginSuccess = (userData) => {
    setCandidateUser(userData);
    setCurrentScreen('job-setup');
  };

  const handleStartInterview = async (topic, isRLMode = true) => {
    let questions = [];
    let initialDifficulty = 'Medium';
    let initialAction = 'MAINTAIN_DEEPEN';

    if (isRLMode) {
      try {
        const data = await startRLInterview({ topic });
        if (data?.initial_question) {
          questions = [data.initial_question];
        }
        initialDifficulty = data?.initial_difficulty || 'Medium';
        initialAction = data?.initial_action || 'MAINTAIN_DEEPEN';
      } catch (error) {
        console.error('Error starting RL interview, falling back:', error);
      }
    }

    if (questions.length === 0) {
      try {
        const data = await startInterview({ topic });
        questions = data?.questions || [];
      } catch (error) {
        console.error('Error starting standard interview:', error);
        questions = [
          `Tell me about your experience with ${topic}.`,
          `How do you handle performance challenges in ${topic}?`,
          `Describe a challenging problem involving ${topic} you solved recently.`,
          `What are best practices when building systems with ${topic}?`,
          `Where do you see ${topic} evolving in the future?`
        ];
      }
    }

    setInterviewData({
      topic,
      questions,
      currentQuestionIndex: 0,
      answers: [],
      reviews: [],
      isRLMode,
      rlDifficulty: initialDifficulty,
      rlActionName: initialAction,
      rlHistory: []
    });
    setActiveReviewIndex(0);
    setCurrentScreen('interview');
  };

  const handleSubmitAnswer = async (answer, timeElapsed) => {
    const currentQuestion = interviewData.questions[interviewData.currentQuestionIndex];
    let review;
    let nextQuestion = null;
    let newDifficulty = interviewData.rlDifficulty;
    let newActionName = interviewData.rlActionName;
    let updatedHistory = [...(interviewData.rlHistory || [])];

    if (interviewData.isRLMode) {
      try {
        const prevScore = getLatestScore();
        const rlRes = await submitRLStep({
          topic: interviewData.topic,
          question: currentQuestion,
          answer,
          previous_score: prevScore,
          current_difficulty: interviewData.rlDifficulty,
          turn_index: interviewData.currentQuestionIndex + 1,
          total_questions: 5
        });

        review = normalizeReview(rlRes, currentQuestion, answer);
        nextQuestion = rlRes.next_question;
        newDifficulty = rlRes.new_difficulty;
        newActionName = rlRes.action_name;
        updatedHistory.push({
          turn: interviewData.currentQuestionIndex + 1,
          question: currentQuestion,
          score: rlRes.score,
          reward: rlRes.reward,
          action_name: rlRes.action_name,
          new_difficulty: rlRes.new_difficulty,
          explanation: rlRes.explanation
        });
      } catch (err) {
        console.error('Error in RL submit step:', err);
        try {
          const data = await submitAnswer({ question: currentQuestion, answer });
          review = normalizeReview(data?.review, currentQuestion, answer);
        } catch (e) {
          review = normalizeReview(null, currentQuestion, answer);
        }
      }
    } else {
      try {
        const data = await submitAnswer({ question: currentQuestion, answer });
        review = normalizeReview(data?.review, currentQuestion, answer);
      } catch (error) {
        console.error('Error submitting answer:', error);
        review = normalizeReview(null, currentQuestion, answer);
      }
    }

    const newAnswers = [...interviewData.answers, { question: currentQuestion, answer, timeElapsed }];
    const newReviews = [...interviewData.reviews, review];
    const nextIndex = interviewData.currentQuestionIndex + 1;
    
    let updatedQuestions = [...interviewData.questions];
    if (nextQuestion && !updatedQuestions[nextIndex]) {
      updatedQuestions.push(nextQuestion);
    }

    setInterviewData({
      ...interviewData,
      questions: updatedQuestions,
      answers: newAnswers,
      reviews: newReviews,
      currentQuestionIndex: nextIndex,
      rlDifficulty: newDifficulty,
      rlActionName: newActionName,
      rlHistory: updatedHistory
    });

    setActiveReviewIndex(newReviews.length - 1);
    
    if (nextIndex >= 5 || (nextIndex >= updatedQuestions.length && !nextQuestion)) {
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
      reviews: [],
      isRLMode: false,
      rlDifficulty: 'Medium',
      rlActionName: '',
      rlHistory: []
    });
    setActiveReviewIndex(0);
    setCurrentScreen('job-setup');
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
    return Math.random() * 2 + 7;
  };

  const calculateConfidenceScore = () => {
    return Math.random() * 2 + 6;
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
      { key: 'interview', label: 'Interview Studio', icon: Mic, disabled: !hasStarted },
      { key: 'rl', label: 'RL Analytics', icon: Cpu },
      { key: 'chatbot', label: 'Chatbot', icon: Star },
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
      rl: 'RL Analytics',
      chatbot: 'Chatbot',
      interview: 'Interview Studio',
      review: 'Review',
      summary: 'Summary',
      profile: 'Profile',
      settings: 'Settings'
    };
    const headerTitle = headerTitleByKey[currentScreen] || 'Dashboard';
    const headerSubtitle = hasStarted ? `Topic: ${interviewData.topic || '—'}` : 'Configure Job Setup to start practice.';

    const dashboardHeaderRight = hasStarted ? (
      <button type="button" className="ds-header-btn" onClick={handleRestartInterview}>
        New Setup
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
        candidateUser={candidateUser}
        onNavigateJobSetup={() => setCurrentScreen('job-setup')}
        onNavigateHome={() => setCurrentScreen('landing')}
      >
        {node}
      </DashboardLayout>
    );

    switch (currentScreen) {
      case 'landing':
        return (
          <LandingScreen
            onStartInterview={handleStartInterview}
            onNavigateLogin={() => setCurrentScreen('login')}
            onNavigateJobSetup={() => setCurrentScreen('job-setup')}
            candidateUser={candidateUser}
          />
        );

      case 'login':
        return (
          <LoginScreen
            onLoginSuccess={handleLoginSuccess}
            onNavigateHome={() => setCurrentScreen('landing')}
          />
        );

      case 'job-setup':
        return wrapDashboard(
          <JobDescriptionSetupScreen
            onStartInterview={handleStartInterview}
            candidateProfile={candidateUser}
          />
        );

      case 'dashboard':
        return wrapDashboard(
          <DashboardOverviewScreen
            topic={interviewData.topic}
            totalQuestions={Math.max(interviewData.questions.length, 5)}
            answeredCount={interviewData.answers.length}
            averageScore={calculateOverallScore()}
            latestScore={getLatestScore()}
            onContinue={() => setCurrentScreen('interview')}
          />
        );

      case 'rl':
        return wrapDashboard(
          <RLAnalyticsScreen rlHistory={interviewData.rlHistory} />
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
            totalQuestions={Math.max(interviewData.questions.length, 5)}
            onSubmitAnswer={handleSubmitAnswer}
            onNextQuestion={handleNextQuestion}
            onPreviousQuestion={handlePreviousQuestion}
            isRLMode={interviewData.isRLMode}
            rlDifficulty={interviewData.rlDifficulty}
            rlActionName={interviewData.rlActionName}
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
        return (
          <LandingScreen
            onStartInterview={handleStartInterview}
            onNavigateLogin={() => setCurrentScreen('login')}
            onNavigateJobSetup={() => setCurrentScreen('job-setup')}
            candidateUser={candidateUser}
          />
        );
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
