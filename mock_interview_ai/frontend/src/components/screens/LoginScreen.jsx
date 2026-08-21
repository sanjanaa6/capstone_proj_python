import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Mail, ArrowRight, Sparkles, ShieldCheck, Zap, LogIn } from 'lucide-react';

const LoginScreen = ({ onLoginSuccess, onNavigateHome }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      onLoginSuccess({
        name: name.trim() || 'Alex Morgan',
        email: email.trim() || 'alex.morgan@example.com',
        role: targetRole || 'Software Engineer',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      });
      setIsLoading(false);
    }, 600);
  };

  const handleDemoLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      onLoginSuccess({
        name: 'Sanjana Singh',
        email: 'sanjana.demo@aimock.ai',
        role: 'Full Stack Software Engineer',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
      });
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="screen" style={{ background: 'var(--bg-gradient)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        style={{ width: '100%', maxWidth: 460 }}
      >
        {/* Top Brand Logo & Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            onClick={onNavigateHome}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              marginBottom: '12px'
            }}
          >
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
              boxShadow: '0 8px 20px rgba(99, 102, 241, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <Sparkles className="w-6 h-6" />
            </div>
            <span style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-heading)' }}>
              AI Mock Interview
            </span>
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
            {isSignUp ? 'Create your Account' : 'Welcome Back'}
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b' }}>
            {isSignUp ? 'Join thousands of engineers practicing with AI' : 'Sign in to access custom Job Description mock interviews'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="card" style={{ padding: '32px', background: 'rgba(255, 255, 255, 0.95)' }}>
          
          {/* Quick Demo Login Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #e0e7ff 0%, #fae8ff 100%)',
            border: '1px solid #c7d2fe',
            borderRadius: '14px',
            padding: '14px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Zap className="w-5 h-5 text-amber-500 flex-shrink-0 animate-pulse" />
              <div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#3730a3' }}>Instant Demo Access</div>
                <div style={{ fontSize: '11px', color: '#4f46e5' }}>Bypass login & start practicing immediately</div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={isLoading}
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                background: '#4f46e5',
                color: 'white',
                border: 'none',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
                whiteSpace: 'nowrap'
              }}
            >
              1-Click Demo
            </button>
          </div>

          {/* Form Tabs Switcher */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: '#f1f5f9',
            padding: '4px',
            borderRadius: '12px',
            marginBottom: '20px'
          }}>
            <button
              type="button"
              onClick={() => setIsSignUp(false)}
              style={{
                padding: '8px',
                borderRadius: '10px',
                border: 'none',
                background: !isSignUp ? '#ffffff' : 'transparent',
                color: !isSignUp ? '#0f172a' : '#64748b',
                fontWeight: 700,
                fontSize: '13px',
                boxShadow: !isSignUp ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsSignUp(true)}
              style={{
                padding: '8px',
                borderRadius: '10px',
                border: 'none',
                background: isSignUp ? '#ffffff' : 'transparent',
                color: isSignUp ? '#0f172a' : '#64748b',
                fontWeight: 700,
                fontSize: '13px',
                boxShadow: isSignUp ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Register
            </button>
          </div>

          {/* Form Fields */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {isSignUp && (
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <User style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: '#94a3b8' }} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Sanjana Singh"
                    className="input-field"
                    style={{ paddingLeft: 44, height: 46, fontSize: 14 }}
                  />
                </div>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: '#94a3b8' }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="candidate@example.com"
                  className="input-field"
                  style={{ paddingLeft: 44, height: 46, fontSize: 14 }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: '#94a3b8' }} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="input-field"
                  style={{ paddingLeft: 44, height: 46, fontSize: 14 }}
                />
              </div>
            </div>

            {isSignUp && (
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Target Role / Specialty
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Full Stack Engineer, ML Developer"
                  className="input-field"
                  style={{ height: 46, fontSize: 14 }}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
              style={{ width: '100%', height: 48, marginTop: '8px', fontSize: '15px' }}
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>{isSignUp ? 'Create Account & Continue' : 'Sign In'}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Back link */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            type="button"
            onClick={onNavigateHome}
            style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
          >
            ← Back to Home Page
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginScreen;
