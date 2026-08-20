import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, Brain, Target, Sparkles, ArrowRight, Cpu, ShieldCheck, Zap, Award } from 'lucide-react';

const LandingScreen = ({ onStartInterview }) => {
  const [topic, setTopic] = useState('');
  const [useRL, setUseRL] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;
    
    setIsLoading(true);
    await onStartInterview(topic, useRL);
    setIsLoading(false);
  };

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI-Powered Questions",
      description: "Contextual questions tailored to your exact role, skill level, and experience.",
      gradient: "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)",
      color: "#4338ca"
    },
    {
      icon: <Cpu className="w-6 h-6" />,
      title: "RL Adaptive Agent",
      description: "Q-Learning Bellman agent dynamically tuning question difficulty & probe depth in real time.",
      gradient: "linear-gradient(135deg, #fae8ff 0%, #f5d0fe 100%)",
      color: "#86198f"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Comprehensive Feedback",
      description: "Detailed breakdown of scoring (1–10), communication clarity, strengths, and actionable tips.",
      gradient: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)",
      color: "#15803d"
    }
  ];

  return (
    <div className="screen">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, cubicBezier: [0.16, 1, 0.3, 1] }}
        className="screen-inner text-center"
      >
        {/* Decorative Floating Ambient Blobs */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          style={{ position: 'absolute', top: -40, right: -40, opacity: 0.15, pointerEvents: 'none' }}
        >
          <Sparkles style={{ width: 120, height: 120, color: '#4f46e5' }} />
        </motion.div>

        {/* Hero Header */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="stack-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-sm font-semibold"
            style={{
              background: 'linear-gradient(135deg, #e0e7ff 0%, #fae8ff 100%)',
              color: '#4338ca',
              border: '1px solid #c7d2fe',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.12)'
            }}
          >
            <Zap className="w-4 h-4 text-amber-500 animate-pulse" /> Next-Gen Autonomous AI Interviewer
          </div>

          <h1 className="title-xl text-gradient mb-4">
            Master Your Technical Interviews
          </h1>
          <p className="subtitle-lg mb-8 mx-auto" style={{ maxWidth: 680, lineHeight: 1.6 }}>
            Practice real-world scenario questions. Build career confidence. Powered by live <b>Reinforcement Learning Q-Learning Agents</b>.
          </p>
        </motion.div>

        {/* Input Form Box */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mx-auto mb-10"
          style={{ maxWidth: 480 }}
        >
          <div style={{ position: 'relative', marginBottom: '1.2rem' }}>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter job role or topic (e.g., 'Python System Design')"
              className="input-field"
              style={{ paddingRight: 56, fontSize: 17, height: 56 }}
              disabled={isLoading}
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isLoading || !topic.trim()}
              style={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 40,
                height: 40,
                borderRadius: 12,
                border: 'none',
                cursor: isLoading || !topic.trim() ? 'not-allowed' : 'pointer',
                opacity: isLoading || !topic.trim() ? 0.5 : 1,
                background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.35)'
              }}
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              ) : (
                <ArrowRight className="w-5 h-5" />
              )}
            </motion.button>
          </div>

          {/* Interactive RL Toggle Box */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setUseRL(!useRL)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.85rem 1.25rem',
              borderRadius: '16px',
              background: useRL
                ? 'linear-gradient(135deg, #e0e7ff 0%, #e0f2fe 100%)'
                : 'rgba(248, 250, 252, 0.8)',
              border: useRL ? '1.5px solid #a5b4fc' : '1.5px solid #e2e8f0',
              boxShadow: useRL ? '0 10px 25px -5px rgba(99, 102, 241, 0.15)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.25s ease'
            }}
          >
            <div className="flex items-center gap-3" style={{ textAlign: 'left' }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: useRL ? '#4f46e5' : '#cbd5e1',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: useRL ? '0 4px 12px rgba(79, 70, 229, 0.4)' : 'none'
                }}
              >
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.925rem', color: useRL ? '#1e1b4b' : '#334155' }}>
                  Enable RL Adaptive Agent Mode
                </div>
                <div style={{ fontSize: '0.775rem', color: useRL ? '#4338ca' : '#64748b' }}>
                  Q-learning agent dynamically tunes question difficulty & probe depth
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={useRL}
              onChange={() => {}}
              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#4f46e5' }}
            />
          </motion.div>
        </motion.form>

        {/* Feature Cards Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="grid-3 mx-auto"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
              whileHover={{ y: -6, boxShadow: '0 20px 35px -10px rgba(99, 102, 241, 0.18)' }}
              className="card text-center"
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  background: feature.gradient,
                  color: feature.color,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}
              >
                {feature.icon}
              </div>
              <h3 className="font-bold text-lg mb-2" style={{ color: '#0f172a' }}>{feature.title}</h3>
              <p className="text-slate-600 text-sm" style={{ lineHeight: 1.5 }}>{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust Badges Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-10 muted"
          style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 20, fontSize: 14, fontWeight: 500 }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#334155' }}>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            No registration required
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#334155' }}>
            <Cpu className="w-4 h-4 text-indigo-500 animate-pulse" />
            Q-Learning RL Agent Active
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#334155' }}>
            <Award className="w-4 h-4 text-purple-500" />
            Free to use
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LandingScreen;
