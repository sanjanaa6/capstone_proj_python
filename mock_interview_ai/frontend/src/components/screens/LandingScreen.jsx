import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, ArrowRight, Cpu, ShieldCheck, Zap, 
  Briefcase, User, LogIn, FileText, ChevronDown, ChevronUp, Camera 
} from 'lucide-react';

const LandingScreen = ({ onStartInterview, onNavigateLogin, onNavigateJobSetup, candidateUser }) => {
  const [topic, setTopic] = useState('');
  const [useRL, setUseRL] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

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
      title: "Custom Job Description AI Prompting",
      description: "Paste job postings directly from LinkedIn or company career pages to generate tailored technical, architectural, and behavioral questions.",
      gradient: "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)",
      color: "#4338ca"
    },
    {
      icon: <Cpu className="w-6 h-6" />,
      title: "RL Q-Learning Adaptive Engine",
      description: "Autonomous Bellman reinforcement agent dynamically tunes question difficulty & probe depth based on your real-time performance.",
      gradient: "linear-gradient(135deg, #fae8ff 0%, #f5d0fe 100%)",
      color: "#86198f"
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: "AI Video Proctoring & Focus Guard",
      description: "Subtle facial landmarks analysis detects off-screen glances, multi-face presence, and candidate engagement.",
      gradient: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)",
      color: "#15803d"
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Paste Job Description",
      desc: "Input target role details, required technologies, or paste full JD text."
    },
    {
      number: "02",
      title: "AI Studio Practice",
      desc: "Answer scenario questions using voice input or text with live camera proctoring."
    },
    {
      number: "03",
      title: "STAR Method Feedback",
      desc: "Receive actionable scoring (1-10), strength breakdowns, and RL progression graphs."
    }
  ];

  const faqs = [
    {
      q: "How does the AI customize questions to my Job Description?",
      a: "Our AI engine parses key skills, tech stacks, experience requirements, and responsibilities from the pasted Job Description. It generates realistic interview scenarios matching that exact candidate profile."
    },
    {
      q: "What is the RL Adaptive Engine?",
      a: "It's a Q-Learning Reinforcement Learning agent. If you answer strongly, it dynamically increases difficulty to test your depth. If you struggle, it adjusts probe questions to assess core fundamentals."
    },
    {
      q: "Can I use voice input during the interview?",
      a: "Yes! The AI Studio features built-in continuous Speech Recognition so you can speak your answers naturally as in a real video interview."
    },
    {
      q: "Is camera proctoring mandatory?",
      a: "No, camera proctoring is optional. You can toggle the AI proctor camera on or off at any time using the header controls."
    }
  ];

  return (
    <div style={{ background: 'var(--bg-gradient)', minHeight: '100vh', width: '100%' }}>
      
      {/* Top Navbar */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
        padding: '14px 32px'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
              boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div style={{ fontSize: '19px', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-heading)' }}>
                AI Mock Interview
              </div>
              <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, letterSpacing: '0.06em' }}>
                JOB-TAILORED STUDIO PLATFORM
              </div>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="hidden md:flex">
            <a href="#features" className="nav-link">Features</a>
            <a href="#how-it-works" className="nav-link">How It Works</a>
            <a href="#rl-engine" className="nav-link">RL Tech</a>
            <a href="#faq" className="nav-link">FAQ</a>
          </nav>

          {/* Right Action CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
              style={{ padding: '10px 22px', fontSize: '14px', borderRadius: '12px' }}
            >
              <Briefcase className="w-4 h-4" />
              <span>Paste Job Description</span>
            </button>
          </div>

        </div>
      </header>

      {/* Hero Section */}
      <section style={{ maxWidth: 1180, margin: '0 auto', padding: '54px 24px 70px', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Badge */}
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
            marginBottom: '22px',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.15)'
          }}>
            <Zap className="w-4 h-4 text-amber-500 animate-pulse" /> Autonomous RL-Powered AI Interviewer v2.0
          </div>

          {/* Hero Headline */}
          <h1 className="title-xl text-gradient" style={{ fontSize: '54px', fontWeight: 800, lineHeight: 1.1, marginBottom: '22px', letterSpacing: '-0.02em' }}>
            Ace Every Technical Interview. <br /> Tailored to Your Job Description.
          </h1>

          {/* Subtitle */}
          <p className="subtitle-lg" style={{ maxWidth: 740, margin: '0 auto 36px', fontSize: '19px', color: '#475569', lineHeight: 1.6 }}>
            Simulate real-world engineering interviews with adaptive AI proctoring, live Q-Learning difficulty scaling, and instant STAR-method performance feedback.
          </p>

          {/* Primary Action Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '44px' }}>
            <button
              type="button"
              onClick={onNavigateJobSetup}
              className="btn-primary"
              style={{ padding: '16px 36px', fontSize: '17px', borderRadius: '18px', boxShadow: '0 12px 30px rgba(99, 102, 241, 0.45)' }}
            >
              <Briefcase className="w-5 h-5" />
              <span>Paste Job Description & Start</span>
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

          {/* Quick Search Form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{ maxWidth: 520, margin: '0 auto 60px', position: 'relative' }}
          >
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#64748b', marginBottom: '10px' }}>
              Or try quick instant practice for popular topics:
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

          {/* Interactive UI Studio Preview Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="hero-mockup-card"
            style={{ maxWidth: 1000, margin: '0 auto 60px', textAlign: 'left' }}
          >
            {/* Top Bar Preview */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: 12, height: 12, borderRadius: 9999, background: '#ef4444' }} />
                <span style={{ width: 12, height: 12, borderRadius: 9999, background: '#f59e0b' }} />
                <span style={{ width: 12, height: 12, borderRadius: 9999, background: '#10b981' }} />
                <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 700, marginLeft: '8px' }}>
                  AI Interview Studio Live Environment
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ padding: '3px 10px', borderRadius: 8, background: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7', border: '1px solid rgba(16, 185, 129, 0.4)', fontSize: '11px', fontWeight: 800 }}>
                  🟢 FOCUSED
                </span>
                <span style={{ padding: '3px 10px', borderRadius: 8, background: 'rgba(99, 102, 241, 0.2)', color: '#c7d2fe', border: '1px solid rgba(99, 102, 241, 0.4)', fontSize: '11px', fontWeight: 800 }}>
                  ⚡ RL AGENT: Hard
                </span>
              </div>
            </div>

            {/* Main Content Mockup Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px' }} className="studio-grid">
              
              {/* Question Preview */}
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#6366f1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                    Q1
                  </div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: 'white', marginBottom: '4px' }}>
                      Given an array of integers nums and an integer k, return total subarrays whose sum equals k.
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                      Analyze time & space complexity for large-scale microservice inputs.
                    </div>
                  </div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: '13px', fontFamily: 'monospace' }}>
                  Candidate response stream... (Ctrl+Enter to submit)
                </div>
              </div>

              {/* Camera Preview */}
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#c7d2fe' }}>AI Proctor Live Video Feed</div>
                <div style={{ height: 110, background: '#090d16', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.15)' }}>
                  <Camera className="w-8 h-8 text-indigo-400 animate-pulse" />
                </div>
                <div style={{ fontSize: '11px', color: '#34d399', fontWeight: 700 }}>
                  ✓ Face Mesh & Eye Focus Verified
                </div>
              </div>

            </div>
          </motion.div>

        </motion.div>
      </section>

      {/* Features Showcase Section */}
      <section id="features" style={{ maxWidth: 1180, margin: '0 auto', padding: '40px 24px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Built for Modern Engineers
          </span>
          <h2 style={{ fontSize: '38px', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
            Comprehensive AI Interview Suite
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {features.map((feat, idx) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="card"
              style={{ padding: '32px' }}
            >
              <div style={{
                width: 54,
                height: 54,
                borderRadius: 18,
                background: feat.gradient,
                color: feat.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
                boxShadow: '0 8px 20px rgba(0,0,0,0.06)'
              }}>
                {feat.icon}
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
                {feat.title}
              </h3>
              <p style={{ fontSize: '15px', color: '#64748b', lineHeight: 1.6 }}>
                {feat.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" style={{ background: '#ffffff', padding: '80px 24px', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Simple 3-Step Workflow
            </span>
            <h2 style={{ fontSize: '38px', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
              How AI Mock Interview Works
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
            {steps.map((st) => (
              <div key={st.number} style={{ position: 'relative', background: '#f8fafc', padding: '32px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '42px', fontWeight: 800, color: '#6366f1', opacity: 0.25, marginBottom: '12px' }}>
                  {st.number}
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                  {st.title}
                </h3>
                <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6 }}>
                  {st.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RL Adaptive Engine Highlights */}
      <section id="rl-engine" style={{ maxWidth: 1180, margin: '0 auto', padding: '80px 24px' }}>
        <div className="ds-hero studio-grid" style={{ borderRadius: '28px', padding: '48px', display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '9999px', background: 'rgba(255,255,255,0.15)', fontSize: '12px', fontWeight: 800, color: '#c7d2fe', textTransform: 'uppercase', marginBottom: '16px' }}>
              <Cpu className="w-4 h-4 text-purple-300" /> Reinforcement Learning Engine
            </div>

            <h2 style={{ fontSize: '34px', fontWeight: 800, color: 'white', marginBottom: '16px', lineHeight: 1.2 }}>
              Dynamic Difficulty Scaling with Q-Learning
            </h2>

            <p style={{ fontSize: '16px', color: '#c7d2fe', lineHeight: 1.6, marginBottom: '24px' }}>
              Our RL agent models candidate performance states. It applies Bellman equation updates turn-by-turn to select actions (Maintain/Deepen, Increase Difficulty, Behavioral Tradeoff) so you get tested at your exact skill boundary.
            </p>

            <button
              type="button"
              onClick={onNavigateJobSetup}
              style={{
                padding: '14px 28px',
                borderRadius: '14px',
                background: 'white',
                color: '#312e81',
                border: 'none',
                fontWeight: 800,
                fontSize: '15px',
                cursor: 'pointer'
              }}
            >
              Test RL Adaptive Interview
            </button>
          </div>

          <div style={{ background: 'rgba(15,23,42,0.8)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.15)', color: 'white' }}>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#a855f7', marginBottom: '12px', textTransform: 'uppercase' }}>
              Q-Table State Vectors
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', fontFamily: 'monospace' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                <span>Medium_Initial</span>
                <span style={{ color: '#34d399' }}>Q: +3.48</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                <span>Hard_TargetZone</span>
                <span style={{ color: '#34d399' }}>Q: +2.85</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                <span>Expert_Struggling</span>
                <span style={{ color: '#f87171' }}>Q: -0.42</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 800, color: '#0f172a' }}>
            Frequently Asked Questions
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {faqs.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div
                key={faq.q}
                className="faq-accordion-item"
                onClick={() => setActiveFaq(isOpen ? null : index)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                    {faq.q}
                  </h3>
                  {isOpen ? <ChevronUp className="w-5 h-5 text-indigo-600" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </div>

                <AnimatePresence>
                  {isOpen && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ fontSize: '14px', color: '#64748b', marginTop: '12px', lineHeight: 1.6 }}
                    >
                      {faq.a}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '48px 32px 32px', borderTop: '1px solid #1e293b' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '32px', marginBottom: '32px' }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'white', marginBottom: '8px' }}>
              AI Mock Interview Studio
            </div>
            <p style={{ fontSize: '13px', maxWidth: 320, lineHeight: 1.6 }}>
              Autonomous AI technical interviewing powered by Reinforcement Learning Q-agents and Job Description customization.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: 'white', textTransform: 'uppercase', marginBottom: '12px' }}>Platform</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <li><a href="#features" style={{ color: '#94a3b8', textDecoration: 'none' }}>Features</a></li>
                <li><a href="#how-it-works" style={{ color: '#94a3b8', textDecoration: 'none' }}>Workflow</a></li>
                <li><a href="#rl-engine" style={{ color: '#94a3b8', textDecoration: 'none' }}>RL Q-Learning</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1180, margin: '0 auto', paddingTop: '24px', borderTop: '1px solid #1e293b', textAlign: 'center', fontSize: '12px' }}>
          © 2026 AI Mock Interview Studio. Built for technical candidates and recruiters.
        </div>
      </footer>

    </div>
  );
};

export default LandingScreen;
