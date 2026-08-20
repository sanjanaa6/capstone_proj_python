import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Zap, Activity, RefreshCw, BarChart2, CheckCircle2, TrendingUp, Layers } from 'lucide-react';
import { getRLTelemetry } from '../../api';

const RLAnalyticsScreen = ({ rlHistory = [] }) => {
  const [telemetry, setTelemetry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTelemetry = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRLTelemetry();
      setTelemetry(data);
    } catch (err) {
      console.error('Error fetching RL telemetry:', err);
      setError('Could not load RL Agent telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, []);

  const actionNames = telemetry?.action_names || {
    0: 'DECREASE_DIFFICULTY',
    1: 'MAINTAIN_DEEPEN',
    2: 'INCREASE_DIFFICULTY',
    3: 'BEHAVIORAL_TRADEOFF'
  };

  const qTable = telemetry?.q_table || {};
  const states = Object.keys(qTable);

  return (
    <div className="ds-page">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="ds-page-inner"
      >
        {/* Hero Banner */}
        <div className="card ds-hero" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)', color: '#ffffff' }}>
          <div className="ds-hero-left">
            <div className="flex items-center gap-2 mb-2" style={{ color: '#a5b4fc', fontSize: '0.875rem', fontWeight: 600, letterSpacing: '0.05em' }}>
              <Cpu className="w-5 h-5" /> REINFORCEMENT LEARNING ENGINE
            </div>
            <div className="ds-hero-title" style={{ color: '#ffffff', fontSize: '1.75rem' }}>
              Autonomous Adaptive Agent Policy
            </div>
            <div className="ds-hero-subtitle" style={{ color: '#c7d2fe' }}>
              Q-Learning Bellman optimization dynamically tuning question difficulty, probing trade-offs, and keeping candidates in the optimal learning range (6.5–8.5/10 score).
            </div>
            <button
              type="button"
              className="btn-primary"
              onClick={fetchTelemetry}
              style={{ marginTop: '1rem', background: '#6366f1', borderColor: '#818cf8' }}
            >
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh Q-Table
            </button>
          </div>
          <div className="ds-hero-right flex flex-col justify-center gap-3">
            <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)' }}>
              <div style={{ fontSize: '0.8rem', color: '#e0e7ff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Target Score Zone</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#38bdf8' }}>6.5 – 8.5 / 10</div>
              <div style={{ fontSize: '0.75rem', color: '#c7d2fe' }}>Zone of Proximal Development</div>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="ds-cards">
          <div className="card ds-metric">
            <div className="ds-metric-icon" style={{ background: '#e0e7ff', color: '#4338ca' }}>
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="ds-metric-title">Exploration Rate (ε)</div>
              <div className="ds-metric-value">{((telemetry?.current_exploration_rate || 0.15) * 100).toFixed(0)}%</div>
            </div>
          </div>

          <div className="card ds-metric">
            <div className="ds-metric-icon" style={{ background: '#dcfce7', color: '#15803d' }}>
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="ds-metric-title">Observed States</div>
              <div className="ds-metric-value">{telemetry?.states_count || 0}</div>
            </div>
          </div>

          <div className="card ds-metric">
            <div className="ds-metric-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="ds-metric-title">Bellman Q-Updates</div>
              <div className="ds-metric-value">{telemetry?.total_updates || 0}</div>
            </div>
          </div>

          <div className="card ds-metric">
            <div className="ds-metric-icon" style={{ background: '#fae8ff', color: '#86198f' }}>
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="ds-metric-title">Session Steps</div>
              <div className="ds-metric-value">{rlHistory.length}</div>
            </div>
          </div>
        </div>

        {/* Q-Table Visualizer */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div className="flex justify-between items-center mb-4">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart2 className="w-5 h-5 text-indigo-600" /> Live Q-Table Policy Matrix
            </h3>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              \(Q(s, a) \leftarrow Q(s, a) + \alpha [R + \gamma \max Q(s', a') - Q(s, a)]\)
            </span>
          </div>

          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading Q-Table telemetry...</div>
          ) : error ? (
            <div style={{ padding: '1.5rem', background: '#fef2f2', color: '#991b1b', borderRadius: '8px' }}>{error}</div>
          ) : states.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
              No Q-table entries yet. Start an <b>RL Adaptive Interview</b> to observe live Bellman updates!
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '0.75rem 1rem', color: '#475569' }}>State (Difficulty & Performance)</th>
                    {Object.values(actionNames).map((name) => (
                      <th key={name} style={{ padding: '0.75rem 1rem', color: '#475569', textAlign: 'center' }}>
                        {name.replace('_', ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {states.map((st) => {
                    const row = qTable[st] || {};
                    const maxVal = Math.max(...Object.values(row).map(Number));
                    return (
                      <tr key={st} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#334155' }}>
                          <span style={{ background: '#e0e7ff', color: '#3730a3', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                            {st}
                          </span>
                        </td>
                        {Object.keys(actionNames).map((actKey) => {
                          const val = row[actKey] !== undefined ? row[actKey] : 1.0;
                          const isMax = Number(val) === maxVal;
                          return (
                            <td key={actKey} style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                              <span
                                style={{
                                  display: 'inline-block',
                                  padding: '0.35rem 0.75rem',
                                  borderRadius: '6px',
                                  fontWeight: isMax ? 700 : 500,
                                  background: isMax ? '#dcfce7' : '#f8fafc',
                                  color: isMax ? '#15803d' : '#64748b',
                                  border: isMax ? '1px solid #86efac' : '1px solid #e2e8f0'
                                }}
                              >
                                {typeof val === 'number' ? val.toFixed(2) : val}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Live Session Adaptation Stream */}
        {rlHistory.length > 0 && (
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Current Session Adaptation Timeline
            </h3>

            <div className="flex flex-col gap-3">
              {rlHistory.map((step, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '1rem',
                    borderRadius: '10px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span style={{ fontWeight: 700, color: '#1e293b' }}>
                      Turn #{idx + 1}
                    </span>
                    <span
                      style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        background: step.reward >= 0 ? '#dcfce7' : '#fee2e2',
                        color: step.reward >= 0 ? '#166534' : '#991b1b'
                      }}
                    >
                      Reward: {step.reward >= 0 ? `+${step.reward}` : step.reward}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '0.5rem' }}>
                    {step.explanation || `Action: ${step.action_name} | Score: ${step.score}/10`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default RLAnalyticsScreen;
