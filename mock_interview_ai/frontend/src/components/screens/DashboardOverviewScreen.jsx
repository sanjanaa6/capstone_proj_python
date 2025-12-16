import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, ClipboardList, Star, Target } from 'lucide-react';

const DashboardOverviewScreen = ({
  topic,
  totalQuestions,
  answeredCount,
  averageScore,
  latestScore,
  onContinue
}) => {
  const progressPct = useMemo(() => {
    if (!totalQuestions) return 0;
    return Math.round((answeredCount / totalQuestions) * 100);
  }, [answeredCount, totalQuestions]);

  const formatScore = (score) => {
    if (typeof score !== 'number' || !Number.isFinite(score)) return '—';
    return score.toFixed(1);
  };

  const cards = [
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Topic',
      value: topic || '—'
    },
    {
      icon: <ClipboardList className="w-6 h-6" />,
      title: 'Progress',
      value: totalQuestions ? `${answeredCount}/${totalQuestions} (${progressPct}%)` : '—'
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Avg. Score',
      value: formatScore(averageScore)
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: 'Latest Score',
      value: formatScore(latestScore)
    }
  ];

  return (
    <div className="ds-page">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="ds-page-inner"
      >
        <div className="card ds-hero">
          <div className="ds-hero-left">
            <div className="ds-hero-title">Your interview workspace</div>
            <div className="ds-hero-subtitle">
              Track your progress, review feedback, and jump back into the interview anytime.
            </div>

            <button
              type="button"
              className="btn-primary"
              onClick={onContinue}
              disabled={!totalQuestions}
            >
              Continue Interview
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <div className="ds-hero-right">
            <div className="ds-progress">
              <div className="ds-progress-top">
                <span className="ds-progress-label">Completion</span>
                <span className="ds-progress-value">{progressPct}%</span>
              </div>
              <div className="ds-progress-bar">
                <div className="ds-progress-fill" style={{ width: `${progressPct}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="ds-cards">
          {cards.map((c) => (
            <div key={c.title} className="card ds-metric">
              <div className="ds-metric-icon">{c.icon}</div>
              <div>
                <div className="ds-metric-title">{c.title}</div>
                <div className={`ds-metric-value ${c.title === 'Topic' ? 'is-topic' : ''}`}>{c.value}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardOverviewScreen;
