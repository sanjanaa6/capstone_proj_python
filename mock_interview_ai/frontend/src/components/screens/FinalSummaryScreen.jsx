import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, TrendingUp, Star, Award, RotateCcw, Download, Share2, 
  CheckCircle2, AlertTriangle, Lightbulb, ChevronDown, ChevronUp, 
  Sparkles, ShieldCheck, Cpu, ArrowRight 
} from 'lucide-react';

const FinalSummaryScreen = ({ 
  overallScore, 
  questionReviews = [], 
  answers = [],
  communicationScore = 8.5, 
  confidenceScore = 7.8, 
  onRestartInterview 
}) => {
  const [expandedIndex, setExpandedIndex] = useState(0);

  const isValidScore = (score) => typeof score === 'number' && Number.isFinite(score);
  const safeScore = isValidScore(overallScore) ? overallScore : 7.5;
  const formatScore = (score) => (isValidScore(score) ? score.toFixed(1) : '7.5');

  const safeReviews = Array.isArray(questionReviews) ? questionReviews.filter(Boolean) : [];
  const safeAnswers = Array.isArray(answers) ? answers.filter(Boolean) : [];

  // Calculate actual valid average from submitted question reviews
  const validQuestionScores = safeReviews
    .map(r => r?.score)
    .filter(isValidScore);

  const actualQuestionAvg = validQuestionScores.length > 0
    ? validQuestionScores.reduce((a, b) => a + b, 0) / validQuestionScores.length
    : safeScore;

  // Determine Hiring Recommendation Level
  const getHiringRecommendation = (score) => {
    if (score >= 8.0) {
      return {
        label: 'STRONG HIRE',
        sub: 'Exceptional technical depth, structured communication, and strong problem-solving skills.',
        color: '#10b981',
        bg: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
        border: '#a7f3d0',
        textColor: '#065f46'
      };
    }
    if (score >= 6.5) {
      return {
        label: 'HIRE / PASS',
        sub: 'Solid technical background. Demonstrates practical competence with minor areas to refine.',
        color: '#6366f1',
        bg: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
        border: '#c7d2fe',
        textColor: '#3730a3'
      };
    }
    if (score >= 5.0) {
      return {
        label: 'LEANING PASS',
        sub: 'Good conceptual knowledge. Expand on real-world implementations and trade-offs.',
        color: '#f59e0b',
        bg: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
        border: '#fde68a',
        textColor: '#92400e'
      };
    }
    return {
      label: 'NEEDS PRACTICE',
      sub: 'Focus on structuring answers using the STAR method and elaborating on core technical trade-offs.',
      color: '#8b5cf6',
      bg: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
      border: '#ddd6fe',
      textColor: '#5b21b6'
    };
  };

  const rec = getHiringRecommendation(safeScore);

  // Aggregate Strengths & Improvements across all submitted questions
  const allStrengths = safeReviews.flatMap(r => Array.isArray(r?.strengths) ? r.strengths : []);
  const allImprovements = safeReviews.flatMap(r => Array.isArray(r?.improvements) ? r.improvements : []);

  const uniqueStrengths = Array.from(new Set(allStrengths)).filter(Boolean);
  const uniqueImprovements = Array.from(new Set(allImprovements)).filter(Boolean);

  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-full" style={{ padding: '8px 0' }}>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
      >

        {/* 1. Executive Summary Header Banner */}
        <div 
          className="card" 
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #311042 100%)',
            color: 'white',
            padding: '36px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(15, 23, 42, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          {/* Subtle Background Glow */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-10%',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '24px', position: 'relative', zIndex: 1 }}>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <span style={{
                  padding: '5px 14px',
                  borderRadius: '9999px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  color: '#e0e7ff',
                  fontWeight: 800,
                  fontSize: '11px',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  AI Interview Performance Report
                </span>
                <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>
                  Completed Session
                </span>
              </div>

              <h1 style={{ fontSize: '32px', fontWeight: 900, color: 'white', marginBottom: '8px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                Interview Complete!
              </h1>
              <p style={{ fontSize: '15px', color: '#cbd5e1', lineHeight: 1.6, maxWidth: '600px' }}>
                {rec.sub}
              </p>
            </div>

            {/* Recommendation Badge */}
            <div style={{
              background: rec.bg,
              padding: '20px 28px',
              borderRadius: '20px',
              color: 'white',
              textAlign: 'center',
              boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              minWidth: '200px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
                <ShieldCheck className="w-5 h-5 text-white" />
                <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.9 }}>
                  Recommendation
                </span>
              </div>
              <div style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '0.02em' }}>
                {rec.label}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Top Metric Cards Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          
          {/* Card 1: Overall Match Score */}
          <motion.div 
            whileHover={{ y: -3 }}
            className="card" 
            style={{ padding: '24px', background: '#ffffff', display: 'flex', alignItems: 'center', gap: '20px' }}
          >
            <div style={{ position: 'relative', width: 76, height: 76, flexShrink: 0 }}>
              <svg style={{ transform: 'rotate(-90deg)', width: 76, height: 76 }}>
                <circle cx="38" cy="38" r="32" stroke="#e2e8f0" strokeWidth="6" fill="none" />
                <motion.circle
                  cx="38" cy="38" r="32"
                  stroke="#4f46e5"
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray={2 * Math.PI * 32}
                  strokeDashoffset={2 * Math.PI * 32 * (1 - (safeScore / 10))}
                  initial={{ strokeDashoffset: 2 * Math.PI * 32 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 32 * (1 - (safeScore / 10)) }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <span style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{formatScore(safeScore)}</span>
              </div>
            </div>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Overall Score</span>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>{formatScore(safeScore)} / 10</h3>
              <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 700 }}>Weighted Average</span>
            </div>
          </motion.div>

          {/* Card 2: Question Score Average */}
          <motion.div 
            whileHover={{ y: -3 }}
            className="card" 
            style={{ padding: '24px', background: '#ffffff', display: 'flex', alignItems: 'center', gap: '20px' }}
          >
            <div style={{
              width: 56, height: 56, borderRadius: 16, background: '#f0fdf4', color: '#16a34a',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              border: '1px solid #bbf7d0'
            }}>
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Technical Accuracy</span>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>{formatScore(actualQuestionAvg)} / 10</h3>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                {safeReviews.length} {safeReviews.length === 1 ? 'Question' : 'Questions'} Evaluated
              </span>
            </div>
          </motion.div>

          {/* Card 3: Communication */}
          <motion.div 
            whileHover={{ y: -3 }}
            className="card" 
            style={{ padding: '24px', background: '#ffffff', display: 'flex', alignItems: 'center', gap: '20px' }}
          >
            <div style={{
              width: 56, height: 56, borderRadius: 16, background: '#e0e7ff', color: '#4f46e5',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              border: '1px solid #c7d2fe'
            }}>
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Communication</span>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>{formatScore(communicationScore)} / 10</h3>
              <span style={{ fontSize: '12px', color: '#4f46e5', fontWeight: 700 }}>Structured & Clear</span>
            </div>
          </motion.div>

          {/* Card 4: Confidence & Fluency */}
          <motion.div 
            whileHover={{ y: -3 }}
            className="card" 
            style={{ padding: '24px', background: '#ffffff', display: 'flex', alignItems: 'center', gap: '20px' }}
          >
            <div style={{
              width: 56, height: 56, borderRadius: 16, background: '#fae8ff', color: '#a855f7',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              border: '1px solid #f5d0fe'
            }}>
              <Star className="w-6 h-6" />
            </div>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Confidence Rating</span>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>{formatScore(confidenceScore)} / 10</h3>
              <span style={{ fontSize: '12px', color: '#a855f7', fontWeight: 700 }}>Steady Delivery</span>
            </div>
          </motion.div>

        </div>

        {/* 3. Detailed AI Synthesis: Strengths & Growth Areas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          
          {/* Key Strengths */}
          <div className="card" style={{ padding: '28px', background: '#ffffff', border: '1px solid #bbf7d0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: 36, height: 36, borderRadius: 12, background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Demonstrated Strengths</h3>
                <span style={{ fontSize: '12px', color: '#15803d', fontWeight: 700 }}>Highlights from your responses</span>
              </div>
            </div>

            {uniqueStrengths.length > 0 ? (
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {uniqueStrengths.map((st, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '14px', color: '#1e293b', lineHeight: 1.5 }}>
                    <span style={{ color: '#10b981', fontWeight: 900, marginTop: '2px' }}>✓</span>
                    <span>{st}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: '#334155' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span style={{ color: '#10b981', fontWeight: 900 }}>✓</span>
                  <span>Responded directly to technical scenarios with clear domain terminology.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span style={{ color: '#10b981', fontWeight: 900 }}>✓</span>
                  <span>Maintained logical structure across complex architectural concepts.</span>
                </li>
              </ul>
            )}
          </div>

          {/* Growth Areas */}
          <div className="card" style={{ padding: '28px', background: '#ffffff', border: '1px solid #fde68a' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: 36, height: 36, borderRadius: 12, background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Targeted Growth Areas</h3>
                <span style={{ fontSize: '12px', color: '#b45309', fontWeight: 700 }}>Recommendations for next time</span>
              </div>
            </div>

            {uniqueImprovements.length > 0 ? (
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {uniqueImprovements.map((imp, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '14px', color: '#1e293b', lineHeight: 1.5 }}>
                    <span style={{ color: '#f59e0b', fontWeight: 900, marginTop: '2px' }}>💡</span>
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: '#334155' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span style={{ color: '#f59e0b', fontWeight: 900 }}>💡</span>
                  <span>Incorporate specific metrics and benchmarks (QPS, memory limits, P99 latency) when discussing system designs.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span style={{ color: '#f59e0b', fontWeight: 900 }}>💡</span>
                  <span>Elaborate further on trade-offs under high concurrency and failover conditions.</span>
                </li>
              </ul>
            )}
          </div>

        </div>

        {/* 4. Question-by-Question Detailed Breakdown */}
        <div className="card" style={{ padding: '28px', background: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
                Question Breakdown & STAR Analysis
              </h2>
              <p style={{ fontSize: '13px', color: '#64748b' }}>
                Detailed evaluation for each turn completed during the interview
              </p>
            </div>
            <span className="pill pill-primary">
              {safeReviews.length} {safeReviews.length === 1 ? 'Entry' : 'Entries'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {safeReviews.map((rev, index) => {
              const isExpanded = expandedIndex === index;
              const qScore = isValidScore(rev?.score) ? rev.score : 7.5;
              const qText = rev.question || safeAnswers[index]?.question || `Question ${index + 1}`;
              const aText = rev.answer || safeAnswers[index]?.answer || 'Answer provided.';

              return (
                <div 
                  key={index} 
                  style={{
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    background: isExpanded ? '#f8fafc' : '#ffffff',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* Header row */}
                  <div 
                    onClick={() => setExpandedIndex(isExpanded ? -1 : index)}
                    style={{
                      padding: '18px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      gap: '16px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 10,
                        background: '#4f46e5', color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: '13px', flexShrink: 0
                      }}>
                        Q{index + 1}
                      </div>

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {qText}
                        </h4>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>
                          Answer length: {aText.length} characters
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                      <div style={{
                        padding: '4px 12px',
                        borderRadius: '9999px',
                        background: qScore >= 8 ? '#f0fdf4' : qScore >= 6 ? '#fffbeb' : '#fef2f2',
                        border: `1px solid ${qScore >= 8 ? '#bbf7d0' : qScore >= 6 ? '#fde68a' : '#fecaca'}`,
                        color: qScore >= 8 ? '#15803d' : qScore >= 6 ? '#b45309' : '#b91c1c',
                        fontWeight: 800,
                        fontSize: '14px'
                      }}>
                        {qScore.toFixed(1)} / 10
                      </div>

                      {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                    </div>
                  </div>

                  {/* Expanded Body */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ padding: '0 20px 20px 20px', borderTop: '1px solid #f1f5f9' }}
                      >
                        {/* Full Question */}
                        <div style={{ marginTop: '16px', marginBottom: '14px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Full Question Prompt
                          </span>
                          <p style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginTop: '4px', lineHeight: 1.5 }}>
                            {qText}
                          </p>
                        </div>

                        {/* Candidate Answer */}
                        <div style={{ marginBottom: '14px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Your Answer Response
                          </span>
                          <p style={{ fontSize: '14px', color: '#334155', marginTop: '4px', background: '#ffffff', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', lineHeight: 1.6 }}>
                            {aText}
                          </p>
                        </div>

                        {/* AI Evaluation */}
                        <div style={{ marginBottom: '14px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 800, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            AI Evaluation & STAR Analysis
                          </span>
                          <p style={{ fontSize: '14px', color: '#1e293b', marginTop: '4px', background: '#f0f4ff', padding: '14px', borderRadius: '12px', border: '1px solid #c7d2fe', lineHeight: 1.6 }}>
                            {rev.feedback || 'Good structural explanation covering the core technical topics. Maintain this approach.'}
                          </p>
                        </div>

                        {/* Strengths & Improvements Pills */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
                          {Array.isArray(rev.strengths) && rev.strengths.length > 0 && (
                            <div style={{ background: '#f0fdf4', padding: '12px 14px', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                              <span style={{ fontSize: '11px', fontWeight: 800, color: '#15803d', textTransform: 'uppercase' }}>Strengths</span>
                              <ul style={{ paddingLeft: '16px', margin: '4px 0 0 0', fontSize: '13px', color: '#166534' }}>
                                {rev.strengths.map((s, i) => <li key={i}>{s}</li>)}
                              </ul>
                            </div>
                          )}

                          {Array.isArray(rev.improvements) && rev.improvements.length > 0 && (
                            <div style={{ background: '#fffbeb', padding: '12px 14px', borderRadius: '12px', border: '1px solid #fde68a' }}>
                              <span style={{ fontSize: '11px', fontWeight: 800, color: '#b45309', textTransform: 'uppercase' }}>Improvements</span>
                              <ul style={{ paddingLeft: '16px', margin: '4px 0 0 0', fontSize: '13px', color: '#92400e' }}>
                                {rev.improvements.map((imp, i) => <li key={i}>{imp}</li>)}
                              </ul>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. Action Footer */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', paddingTop: '12px' }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onRestartInterview}
            className="btn-primary"
            style={{ padding: '14px 28px', fontSize: '15px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <RotateCcw className="w-5 h-5" />
            <span>Practice Another Interview</span>
          </motion.button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDownload}
              className="btn-secondary"
              style={{ padding: '12px 20px', fontSize: '14px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Download className="w-4 h-4" />
              <span>Download PDF Summary</span>
            </motion.button>
          </div>
        </div>

      </motion.div>
    </div>
  );
};

export default FinalSummaryScreen;
