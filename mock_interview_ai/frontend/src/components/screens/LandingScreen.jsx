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
      gradient: "linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(129, 140, 248, 0.15) 100%)",
      color: "#818cf8"
    },
    {
      icon: <Cpu className="w-6 h-6" />,
      title: "RL Q-Learning Adaptive Engine",
      description: "Autonomous Bellman reinforcement agent dynamically tunes question difficulty & probe depth based on your real-time performance.",
      gradient: "linear-gradient(135deg, rgba(168, 85, 247, 0.25) 0%, rgba(216, 180, 254, 0.15) 100%)",
      color: "#c084fc"
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: "AI Video Proctoring & Focus Guard",
      description: "Subtle facial landmarks analysis detects off-screen glances, multi-face presence, and candidate engagement in real time.",
      gradient: "linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(110, 231, 183, 0.15) 100%)",
      color: "#34d399"
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Paste Job Description",
      desc: "Input target role details, required tech stack, or paste complete JD text."
    },
    {
      number: "02",
      title: "AI Studio Practice",
      desc: "Answer scenario questions using live voice input or code editor with camera proctoring."
    },
    {
      number: "03",
      title: "STAR Method Evaluation",
      desc: "Receive comprehensive scoring (1-10), communication breakdown, and RL difficulty trajectory."
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
    <div className="dark-landing-root">
      
      {/* Full Width Sticky Header Navbar */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(9, 13, 22, 0.9)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '16px 5%',
        width: '100%'
      }}>
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={onNavigateJobSetup}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
              boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-heading)', letterSpacing: '-0.01em' }}>
                AI Mock Interview
              </div>
              <div style={{ fontSize: '10px', color: '#818cf8', fontWeight: 800, letterSpacing: '0.08em' }}>
                JOB-TAILORED STUDIO PLATFORM
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '10px' }} className="hidden md:flex">
            <a href="#features" className="dark-nav-link">Features</a>
            <a href="#how-it-works" className="dark-nav-link">How It Works</a>
            <a href="#rl-engine" className="dark-nav-link">RL Tech</a>
            <a href="#faq" className="dark-nav-link">FAQ</a>
          </nav>

          {/* Action CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {candidateUser ? (
              <button
                type="button"
                onClick={onNavigateJobSetup}
                style={{
                  padding: '8px 16px',
                  borderRadius: '12px',
                  background: 'rgba(99, 102, 241, 0.2)',
                  color: '#a5b4fc',
                  border: '1px solid rgba(129, 140, 248, 0.4)',
                  fontWeight: 700,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <User className="w-4 h-4 text-indigo-400" />
                <span>{candidateUser.name}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onNavigateLogin}
                style={{
                  padding: '9px 20px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#f8fafc',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                <LogIn className="w-4 h-4 text-indigo-400" />
                <span>Sign In</span>
              </button>
            )}

            <button
              type="button"
              onClick={onNavigateJobSetup}
              className="btn-primary"
              style={{ padding: '10px 24px', fontSize: '14px', borderRadius: '12px' }}
            >
              <Briefcase className="w-4 h-4" />
              <span>Paste Job Description</span>
            </button>
          </div>

        </div>
      </header>

      {/* Full Width Hero Section */}
      <section style={{ width: '100%', padding: '60px 5% 80px', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ width: '100%' }}
        >
          {/* Top Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 18px',
            borderRadius: '9999px',
            background: 'rgba(99, 102, 241, 0.18)',
            color: '#a5b4fc',
            border: '1px solid rgba(129, 140, 248, 0.35)',
            fontSize: '13px',
            fontWeight: 800,
            marginBottom: '26px',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.25)'
          }}>
            <Zap className="w-4 h-4 text-amber-400 animate-pulse" /> Autonomous RL-Powered AI Interviewer v2.0
          </div>

          {/* Hero Headline */}
          <h1 className="title-xl text-gradient-hero" style={{ fontSize: '56px', fontWeight: 800, lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-0.02em' }}>
            Ace Every Technical Interview. <br /> Tailored to Your Job Description.
          </h1>

          {/* Subtitle */}
          <p style={{ maxWidth: 800, margin: '0 auto 40px', fontSize: '20px', color: '#94a3b8', lineHeight: 1.6, fontWeight: 400 }}>
            Simulate real-world engineering interviews with adaptive AI proctoring, live Q-Learning difficulty scaling, and instant STAR-method performance feedback.
          </p>

          {/* Primary Action Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '18px', marginBottom: '50px' }}>
            <button
              type="button"
              onClick={onNavigateJobSetup}
              className="btn-primary"
              style={{ padding: '18px 40px', fontSize: '18px', borderRadius: '20px', boxShadow: '0 10px 35px rgba(99, 102, 241, 0.5)' }}
            >
              <Briefcase className="w-5 h-5" />
              <span>Paste Job Description & Start</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={onNavigateLogin}
              style={{
                padding: '18px 32px',
                fontSize: '17px',
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1.5px solid rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
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
            style={{ maxWidth: 560, margin: '0 auto 64px', position: 'relative' }}
          >
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8', marginBottom: '12px' }}>
              Or practice instantly with popular preset topics:
            </div>
            
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. 'Python System Design' or 'React Architecture'"
                className="studio-textarea"
                style={{ minHeight: 56, paddingRight: 56, fontSize: 15, height: 56, padding: '14px 20px' }}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !topic.trim()}
                style={{
                  position: 'absolute',
                  right: 8,
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
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
                }}
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.form>

          {/* Interactive Full-Width AI Studio Preview Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="hero-mockup-card"
            style={{ width: '100%', margin: '0 auto 40px', textAlign: 'left' }}
          >
            {/* Header Preview */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.12)', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: 12, height: 12, borderRadius: 9999, background: '#ef4444' }} />
                <span style={{ width: 12, height: 12, borderRadius: 9999, background: '#f59e0b' }} />
                <span style={{ width: 12, height: 12, borderRadius: 9999, background: '#10b981' }} />
                <span style={{ fontSize: '13px', color: '#cbd5e1', fontWeight: 700, marginLeft: '8px' }}>
                  AI Interview Studio Live Environment
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ padding: '4px 12px', borderRadius: 8, background: 'rgba(16, 185, 129, 0.25)', color: '#6ee7b7', border: '1px solid rgba(16, 185, 129, 0.4)', fontSize: '11px', fontWeight: 800 }}>
                  🟢 FOCUSED
                </span>
                <span style={{ padding: '4px 12px', borderRadius: 8, background: 'rgba(99, 102, 241, 0.25)', color: '#c7d2fe', border: '1px solid rgba(129, 140, 248, 0.4)', fontSize: '11px', fontWeight: 800 }}>
                  ⚡ RL AGENT: Hard
                </span>
              </div>
            </div>

            {/* Mockup Grid */}
            <div className="studio-grid">
              
              {/* Question Box */}
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', gap: '14px', marginBottom: '14px' }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
                    Q1
                  </div>
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: 'white', marginBottom: '6px', lineHeight: 1.4 }}>
                      Given an array of integers nums and an integer k, return total subarrays whose sum equals k.
                    </div>
                    <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                      Analyze time & space complexity for large-scale microservice inputs.
                    </div>
                  </div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.4)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.12)', color: '#94a3b8', fontSize: '14px', fontFamily: 'monospace' }}>
                  Candidate response workspace stream... (Press Ctrl+Enter to submit answer)
                </div>
              </div>

              {/* Camera Preview Box */}
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#c7d2fe' }}>AI Proctor Live Video Stream</div>
                <div style={{ height: 130, background: '#090d16', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.18)' }}>
                  <Camera className="w-8 h-8 text-indigo-400 animate-pulse" />
                </div>
                <div style={{ fontSize: '12px', color: '#34d399', fontWeight: 700 }}>
                  ✓ Face Mesh & Eye Focus Verified
                </div>
              </div>

            </div>
          </motion.div>

        </motion.div>
      </section>

      {/* Full Width Features Section */}
      <section id="features" style={{ width: '100%', padding: '60px 5% 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: '52px' }}>
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Built for Modern Engineers
          </span>
          <h2 style={{ fontSize: '40px', fontWeight: 800, color: '#ffffff', marginTop: '8px' }}>
            Comprehensive AI Interview Suite
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>
          {features.map((feat, idx) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="dark-glass-card"
            >
              <div style={{
                width: 56,
                height: 56,
                borderRadius: 18,
                background: feat.gradient,
                color: feat.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '22px',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                {feat.icon}
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff', marginBottom: '12px' }}>
                {feat.title}
              </h3>
              <p style={{ fontSize: '15px', color: '#94a3b8', lineHeight: 1.65 }}>
                {feat.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Full Width How It Works Section */}
      <section id="how-it-works" style={{ width: '100%', padding: '80px 5%', background: 'rgba(15, 23, 42, 0.6)', borderTop: '1px solid rgba(255, 255, 255, 0.08)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Simple 3-Step Workflow
            </span>
            <h2 style={{ fontSize: '40px', fontWeight: 800, color: '#ffffff', marginTop: '8px' }}>
              How AI Mock Interview Works
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
            {steps.map((st) => (
              <div key={st.number} className="dark-glass-card">
                <div style={{ fontSize: '48px', fontWeight: 800, color: '#818cf8', opacity: 0.4, marginBottom: '14px', fontFamily: 'var(--font-heading)' }}>
                  {st.number}
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff', marginBottom: '10px' }}>
                  {st.title}
                </h3>
                <p style={{ fontSize: '15px', color: '#94a3b8', lineHeight: 1.6 }}>
                  {st.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Full Width RL Engine Section */}
      <section id="rl-engine" style={{ width: '100%', padding: '80px 5%' }}>
        <div className="dark-glass-card studio-grid" style={{ padding: '48px', display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '9999px', background: 'rgba(168, 85, 247, 0.2)', border: '1px solid rgba(216, 180, 254, 0.35)', fontSize: '12px', fontWeight: 800, color: '#d8b4fe', textTransform: 'uppercase', marginBottom: '18px' }}>
              <Cpu className="w-4 h-4 text-purple-300" /> Reinforcement Learning Engine
            </div>

            <h2 style={{ fontSize: '36px', fontWeight: 800, color: 'white', marginBottom: '18px', lineHeight: 1.2 }}>
              Dynamic Difficulty Scaling with Q-Learning
            </h2>

            <p style={{ fontSize: '17px', color: '#cbd5e1', lineHeight: 1.65, marginBottom: '28px' }}>
              Our RL agent models candidate performance states. It applies Bellman equation updates turn-by-turn to select actions (Maintain/Deepen, Increase Difficulty, Behavioral Tradeoff) so you get tested at your exact skill boundary.
            </p>

            <button
              type="button"
              onClick={onNavigateJobSetup}
              className="btn-primary"
              style={{ padding: '14px 32px', fontSize: '16px', borderRadius: '16px' }}
            >
              Test RL Adaptive Interview
            </button>
          </div>

          <div style={{ background: 'rgba(9, 13, 22, 0.9)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.15)', color: 'white' }}>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#c084fc', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Q-Table State Vectors
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', fontFamily: 'monospace' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                <span>Medium_Initial</span>
                <span style={{ color: '#34d399', fontWeight: 700 }}>Q: +3.48</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                <span>Hard_TargetZone</span>
                <span style={{ color: '#34d399', fontWeight: 700 }}>Q: +2.85</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                <span>Expert_Struggling</span>
                <span style={{ color: '#f87171', fontWeight: 700 }}>Q: -0.42</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Full Width FAQ Accordion Section */}
      <section id="faq" style={{ width: '100%', padding: '40px 5% 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '38px', fontWeight: 800, color: '#ffffff' }}>
            Frequently Asked Questions
          </h2>
        </div>

        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {faqs.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div
                key={faq.q}
                className="dark-faq-item"
                onClick={() => setActiveFaq(isOpen ? null : index)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#ffffff' }}>
                    {faq.q}
                  </h3>
                  {isOpen ? <ChevronUp className="w-5 h-5 text-indigo-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </div>

                <AnimatePresence>
                  {isOpen && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ fontSize: '15px', color: '#cbd5e1', marginTop: '14px', lineHeight: 1.6 }}
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
      <footer style={{ background: '#090d16', color: '#94a3b8', padding: '56px 5% 36px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '32px', marginBottom: '40px' }}>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'white', marginBottom: '10px' }}>
              AI Mock Interview Studio
            </div>
            <p style={{ fontSize: '14px', maxWidth: 360, lineHeight: 1.6 }}>
              Autonomous AI technical interviewing powered by Reinforcement Learning Q-agents and Job Description customization.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: 'white', textTransform: 'uppercase', marginBottom: '14px' }}>Platform</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
                <li><a href="#features" style={{ color: '#94a3b8', textDecoration: 'none' }}>Features</a></li>
                <li><a href="#how-it-works" style={{ color: '#94a3b8', textDecoration: 'none' }}>Workflow</a></li>
                <li><a href="#rl-engine" style={{ color: '#94a3b8', textDecoration: 'none' }}>RL Q-Learning</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div style={{ width: '100%', paddingTop: '28px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'center', fontSize: '13px' }}>
          © 2026 AI Mock Interview Studio. Built for technical candidates and recruiters.
        </div>
      </footer>

    </div>
  );
};

export default LandingScreen;
