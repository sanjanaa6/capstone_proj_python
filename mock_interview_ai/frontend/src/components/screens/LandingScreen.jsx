import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mic, Brain, Target, Sparkles, ArrowRight, Cpu, ShieldCheck, Zap, Award, 
  Briefcase, CheckCircle2, User, LogIn, FileText 
} from 'lucide-react';

const LandingScreen = ({ onStartInterview, onNavigateLogin, onNavigateJobSetup, candidateUser }) => {
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
      icon: <FileText className="w-6 h-6" />,
      title: "Job Description Customization",
      description: "Paste any target Job Description (JD) to generate exact technical, system design, and behavioral questions.",
      gradient: "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)",
      color: "#4338ca"
    },
    {
      icon: <Cpu className="w-6 h-6" />,
      title: "RL Adaptive Agent Engine",
      description: "Q-Learning Bellman agent dynamically tuning question difficulty & probe depth in real time based on your score.",
      gradient: "linear-gradient(135deg, #fae8ff 0%, #f5d0fe 100%)",
      color: "#86198f"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "AI Video Proctoring & Feedback",
      description: "Live camera focus detection, facial landmarks analysis, and detailed score breakdown (1–10).",
      gradient: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)",
      color: "#15803d"
    }
  ];

  return (
    <div style={{ background: 'var(--bg-gradient)', minHeight: '100vh', width: '100%' }}>
      
      {/* Top Navbar */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
        padding: '16px 32px'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
              boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-heading)' }}>
                AI Mock Interview
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, letterSpacing: '0.04em' }}>
                JOB-TAILORED AI PLATFORM
              </div>
            </div>
          </div>

          {/* Right Header Navigation Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {candidateUser ? (
              <button
                type="button"
                onClick={onNavigateJobSetup}
                style={{
                  padding: '8px 16px',
                  borderRadius: '12px',
                  background: '#e0e7ff',
                  color: '#3730a3',
                  border: '1px solid #c7d2fe',
                  fontWeight: 700,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <User className="w-4 h-4 text-indigo-600" />
                <span>{candidateUser.name}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onNavigateLogin}
                style={{
                  padding: '9px 18px',
                  borderRadius: '12px',
                  background: '#ffffff',
                  color: '#334155',
                  border: '1.5px solid #cbd5e1',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                <LogIn className="w-4 h-4 text-indigo-600" />
                <span>Sign In</span>
              </button>
            )}

            <button
              type="button"
              onClick={onNavigateJobSetup}
              className="btn-primary"
              style={{ padding: '9px 20px', fontSize: '14px', borderRadius: '12px' }}
            >
              <Briefcase className="w-4 h-4" />
              <span>Paste Job Description</span>
            </button>
          </div>

        </div>
      </header>

      {/* Hero Section */}
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 24px 80px', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '9999px',
            background: 'linear-gradient(135deg, #e0e7ff 0%, #fae8ff 100%)',
            color: '#4338ca',
            border: '1px solid #c7d2fe',
            fontSize: '13px',
            fontWeight: 800,
            marginBottom: '20px',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.12)'
          }}>
            <Zap className="w-4 h-4 text-amber-500 animate-pulse" /> Next-Gen Job-Specific AI Interviewer
          </div>

          <h1 className="title-xl text-gradient" style={{ fontSize: '52px', fontWeight: 800, lineHeight: 1.1, marginBottom: '20px' }}>
            Master Any Technical Interview <br /> Tailored to Your Job Description
          </h1>

          <p className="subtitle-lg" style={{ maxWidth: 720, margin: '0 auto 36px', fontSize: '19px', color: '#475569', lineHeight: 1.6 }}>
            Upload or paste any target Job Description (JD). Practice real-world scenario questions evaluated by live <strong>Reinforcement Learning Q-Learning Agents</strong> and AI Proctoring.
          </p>

          {/* Primary Action Button Options */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '48px' }}>
            <button
              type="button"
              onClick={onNavigateJobSetup}
              className="btn-primary"
              style={{ padding: '16px 36px', fontSize: '17px', borderRadius: '18px', boxShadow: '0 12px 30px rgba(99, 102, 241, 0.45)' }}
            >
              <Briefcase className="w-5 h-5" />
              <span>Enter Job Description & Start</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={onNavigateLogin}
              style={{
                padding: '16px 28px',
                fontSize: '16px',
                borderRadius: '18px',
                background: '#ffffff',
                border: '1.5px solid #cbd5e1',
                color: '#1e293b',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0,0,0,0.04)'
              }}
            >
              Candidate Login
            </button>
          </div>

          {/* Quick Demo Search Input */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{ maxWidth: 520, margin: '0 auto 60px', position: 'relative' }}
          >
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#64748b', marginBottom: '10px' }}>
              Or enter a quick topic to practice instantly:
            </div>
            
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. 'Python System Design' or 'React Architecture'"
                className="input-field"
                style={{ paddingRight: 56, fontSize: 15, height: 54 }}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !topic.trim()}
                style={{
                  position: 'absolute',
                  right: 6,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  border: 'none',
                  cursor: isLoading || !topic.trim() ? 'not-allowed' : 'pointer',
                  opacity: isLoading || !topic.trim() ? 0.5 : 1,
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.form>
        </motion.div>

        {/* Feature Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '40px', textAlign: 'left' }}>
          {features.map((feat, idx) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + idx * 0.1 }}
              className="card"
              style={{ padding: '28px' }}
            >
              <div style={{
                width: 50,
                height: 50,
                borderRadius: 16,
                background: feat.gradient,
                color: feat.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '18px',
                boxShadow: '0 8px 20px rgba(0,0,0,0.06)'
              }}>
                {feat.icon}
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                {feat.title}
              </h3>
              <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6 }}>
                {feat.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Platform Trust Stats */}
        <div style={{
          marginTop: '60px',
          padding: '32px',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
          color: 'white',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '24px',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#818cf8' }}>500+</div>
            <div style={{ fontSize: '13px', color: '#94a3b8' }}>Job Descriptions Processed</div>
          </div>
          <div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#34d399' }}>98.4%</div>
            <div style={{ fontSize: '13px', color: '#94a3b8' }}>Scoring Evaluation Accuracy</div>
          </div>
          <div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#f472b6' }}>Real-time</div>
            <div style={{ fontSize: '13px', color: '#94a3b8' }}>RL Adaptive Difficulty Curve</div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default LandingScreen;
