import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, Brain, Target, Sparkles, ArrowRight, Cpu } from 'lucide-react';

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
      description: "Contextual questions tailored to your role and experience"
    },
    {
      icon: <Cpu className="w-6 h-6" />,
      title: "RL Adaptive Agent",
      description: "Q-Learning Bellman agent dynamically tuning difficulty & probe depth"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Detailed Feedback",
      description: "Get comprehensive analysis of your interview performance"
    }
  ];

  return (
    <div className="screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="screen-inner text-center"
      >
        {/* Floating decoration */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{ position: 'absolute', top: 40, right: 40, opacity: 0.1 }}
        >
          <Sparkles style={{ width: 80, height: 80, color: '#2563eb' }} />
        </motion.div>

        {/* Main content */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="stack-8"
        >
          <h1 className="title-xl text-gradient mb-4">
            AI Mock Interview
          </h1>
          <p className="subtitle-lg mb-8 mx-auto" style={{ maxWidth: 672 }}>
            Practice interviews. Build confidence. Powered by Reinforcement Learning.
          </p>
        </motion.div>

        {/* Input form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mx-auto mb-8"
          style={{ maxWidth: 460 }}
        >
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter job role or topic (e.g., 'Python System Design')"
              className="input-field"
              style={{ paddingRight: 48, fontSize: 18 }}
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
                padding: 8,
                borderRadius: 10,
                border: 'none',
                cursor: isLoading || !topic.trim() ? 'not-allowed' : 'pointer',
                opacity: isLoading || !topic.trim() ? 0.5 : 1,
                background: '#2563eb',
                color: 'white'
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
                <ArrowRight style={{ width: 20, height: 20 }} />
              )}
            </motion.button>
          </div>

          {/* RL Toggle Box */}
          <div
            onClick={() => setUseRL(!useRL)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              background: useRL ? 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' : '#f8fafc',
              border: useRL ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div className="flex items-center gap-2" style={{ textAlign: 'left' }}>
              <Cpu className="w-5 h-5" style={{ color: useRL ? '#2563eb' : '#64748b' }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: useRL ? '#1e3a8a' : '#334155' }}>
                  Enable RL Adaptive Agent Mode
                </div>
                <div style={{ fontSize: '0.75rem', color: useRL ? '#3b82f6' : '#64748b' }}>
                  Q-learning agent dynamically tunes question difficulty
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={useRL}
              onChange={() => {}}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>
        </motion.form>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="grid-3 mx-auto"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
              whileHover={{ y: -5 }}
              className="card text-center"
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 9999,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                  color: '#2563eb'
                }}
              >
                {feature.icon}
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="mt-8 muted"
          style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16, fontSize: 14 }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, background: '#22c55e', borderRadius: 9999 }}></span>
            No registration required
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, background: '#3b82f6', borderRadius: 9999 }}></span>
            Q-Learning RL Agent Active
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, background: '#a855f7', borderRadius: 9999 }}></span>
            Free to use
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LandingScreen;
