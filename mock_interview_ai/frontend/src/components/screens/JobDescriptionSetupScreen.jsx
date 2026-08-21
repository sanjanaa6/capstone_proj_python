import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Briefcase, FileText, Cpu, ArrowRight, Sparkles, Layers, Award, Target, 
  CheckCircle2, FileCode, Sliders 
} from 'lucide-react';

const PRESET_ROLES = [
  { id: 'fullstack', title: 'Senior Full Stack Engineer', tech: 'React, Node.js, Python, PostgreSQL, System Design' },
  { id: 'backend', title: 'Backend Systems Developer', tech: 'Python, FastAPI, Distributed Systems, Microservices' },
  { id: 'frontend', title: 'Frontend Architecture Specialist', tech: 'React 19, TypeScript, Web Vitals, Design Systems' },
  { id: 'ai_ml', title: 'AI / Machine Learning Engineer', tech: 'Python, PyTorch, LLMs, RL, Model Deployment' },
  { id: 'devops', title: 'DevOps & Cloud Architect', tech: 'Kubernetes, Docker, AWS, CI/CD Pipelines, Terraform' }
];

const SAMPLE_JDS = {
  fullstack: `Target Role: Senior Full Stack Engineer
Key Responsibilities:
- Design and build high-throughput microservices in Python (FastAPI/Django) and scalable React frontends.
- Optimize database queries (PostgreSQL/Redis) for real-time analytics.
- Conduct code reviews, system architecture design, and ensure CI/CD reliability.
Requirements:
- 4+ years of professional full-stack development experience.
- Deep expertise in state management, async Python, REST/GraphQL APIs, and cloud infrastructure.`,

  backend: `Target Role: Backend Systems Developer
Key Responsibilities:
- Architect microservice ecosystems handling 50k+ QPS with low latency guarantees.
- Implement distributed caching, queue workers (Celery/Kafka), and database indexing strategies.
Requirements:
- Strong mastery of Python 3.11+, async framework paradigms, algorithms, and system design trade-offs.`
};

const JobDescriptionSetupScreen = ({ onStartInterview, candidateProfile }) => {
  const [selectedRole, setSelectedRole] = useState(PRESET_ROLES[0].title);
  const [jobDescription, setJobDescription] = useState(SAMPLE_JDS.fullstack);
  const [experienceLevel, setExperienceLevel] = useState('Senior (5+ yrs)');
  const [focusArea, setFocusArea] = useState('Full-Loop Comprehensive');
  const [useRLMode, setUseRLMode] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectPreset = (role) => {
    setSelectedRole(role.title);
    if (SAMPLE_JDS[role.id]) {
      setJobDescription(SAMPLE_JDS[role.id]);
    }
  };

  const handleLaunch = async (e) => {
    e.preventDefault();
    if (!jobDescription.trim()) return;

    setIsSubmitting(true);

    // Build rich combined prompt topic for question generator backend
    const combinedTopic = `Job Role: ${selectedRole} | Level: ${experienceLevel} | Focus: ${focusArea} | Job Description Summary: ${jobDescription.slice(0, 300)}...`;

    try {
      await onStartInterview(combinedTopic, useRLMode);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-full" style={{ padding: '8px' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
      >
        {/* Banner Header */}
        <div className="ds-hero" style={{ borderRadius: '24px', padding: '32px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 14px', borderRadius: '9999px', background: 'rgba(255, 255, 255, 0.15)', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
              <Sparkles className="w-4 h-4 text-amber-300" /> AI Job Customizer
            </div>
            <h1 className="ds-hero-title">Job Description & Role Setup</h1>
            <p className="ds-hero-subtitle" style={{ maxWidth: 650 }}>
              Tailor your AI Mock Interview to an exact target job posting. Paste any Job Description (JD) text to generate real-world questions, difficulty curves, and evaluation metrics.
            </p>
          </div>

          {candidateProfile && (
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '16px 20px', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.2)', textAlign: 'right', flexShrink: 0 }} className="hidden sm:block">
              <div style={{ fontSize: '12px', color: '#c7d2fe', fontWeight: 600 }}>Active Candidate</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'white' }}>{candidateProfile.name}</div>
              <div style={{ fontSize: '12px', color: '#a5b4fc' }}>{candidateProfile.role}</div>
            </div>
          )}
        </div>

        <form onSubmit={handleLaunch} style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }} className="studio-grid">
          
          {/* Main Column: Job Role & Job Description Inputs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Preset Roles Selector */}
            <div className="card" style={{ padding: '24px' }}>
              <label style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <Briefcase className="w-5 h-5 text-indigo-600" />
                <span>1. Select Target Job Role</span>
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                {PRESET_ROLES.map((role) => {
                  const isSelected = selectedRole === role.title;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => handleSelectPreset(role)}
                      style={{
                        padding: '14px 16px',
                        borderRadius: '14px',
                        border: isSelected ? '2px solid #6366f1' : '1px solid #e2e8f0',
                        background: isSelected ? 'linear-gradient(135deg, #e0e7ff 0%, #f5f3ff 100%)' : '#ffffff',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: isSelected ? '0 4px 12px rgba(99, 102, 241, 0.15)' : 'none'
                      }}
                    >
                      <div style={{ fontSize: '14px', fontWeight: 800, color: isSelected ? '#3730a3' : '#0f172a', marginBottom: '4px' }}>
                        {role.title}
                      </div>
                      <div style={{ fontSize: '11px', color: isSelected ? '#4f46e5' : '#64748b' }}>
                        {role.tech}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Job Description Textarea */}
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <label style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <span>2. Paste Job Description (JD) Text</span>
                </label>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setJobDescription(SAMPLE_JDS.fullstack)}
                    style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '8px', background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', cursor: 'pointer' }}
                  >
                    Sample Fullstack JD
                  </button>
                  <button
                    type="button"
                    onClick={() => setJobDescription(SAMPLE_JDS.backend)}
                    style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '8px', background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', cursor: 'pointer' }}
                  >
                    Sample Backend JD
                  </button>
                </div>
              </div>

              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description text here... (e.g. required skills, technologies, experience levels, job responsibilities)"
                className="input-field"
                style={{
                  minHeight: 220,
                  fontSize: 14,
                  lineHeight: 1.6,
                  resize: 'vertical'
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', fontSize: '12px', color: '#64748b' }}>
                <span>The AI engine uses this text to create role-specific scenario questions.</span>
                <span>{jobDescription.length} chars</span>
              </div>
            </div>

          </div>

          {/* Right Sidebar Column: Interview Options & Launch */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Experience Level & Focus Config Card */}
            <div className="card" style={{ padding: '22px' }}>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Sliders className="w-5 h-5 text-indigo-600" />
                <span>3. Experience & Focus</span>
              </div>

              {/* Experience Selector */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Target Level
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {['Entry Level (0-2 yrs)', 'Mid-Level (3-5 yrs)', 'Senior (5+ yrs)', 'Lead / Staff Architect'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setExperienceLevel(lvl)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: 700,
                        textAlign: 'left',
                        border: experienceLevel === lvl ? '1.5px solid #6366f1' : '1px solid #e2e8f0',
                        background: experienceLevel === lvl ? '#e0e7ff' : '#f8fafc',
                        color: experienceLevel === lvl ? '#3730a3' : '#334155',
                        cursor: 'pointer'
                      }}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Focus Area */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Interview Focus
                </label>
                <select
                  value={focusArea}
                  onChange={(e) => setFocusArea(e.target.value)}
                  className="input-field"
                  style={{ height: 42, fontSize: 13, padding: '8px 12px' }}
                >
                  <option value="Full-Loop Comprehensive">Full-Loop Comprehensive</option>
                  <option value="Technical Coding & Algorithms">Technical Coding & Algorithms</option>
                  <option value="System Design & Architecture">System Design & Architecture</option>
                  <option value="Behavioral & Situational">Behavioral & Leadership</option>
                </select>
              </div>

              {/* RL Adaptive Mode Toggle */}
              <div style={{
                background: useRLMode ? 'linear-gradient(135deg, #fae8ff 0%, #f5d0fe 100%)' : '#f1f5f9',
                border: useRLMode ? '1px solid #e9d5ff' : '1px solid #cbd5e1',
                borderRadius: '14px',
                padding: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
              onClick={() => setUseRLMode(!useRLMode)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Cpu className="w-5 h-5 text-purple-600" />
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#7e22ce' }}>RL Adaptive Engine</div>
                    <div style={{ fontSize: '11px', color: '#6b21a8' }}>Dynamic difficulty scaling</div>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={useRLMode}
                  onChange={(e) => setUseRLMode(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: '#7e22ce', cursor: 'pointer' }}
                />
              </div>
            </div>

            {/* Launch CTA Button */}
            <button
              type="submit"
              disabled={isSubmitting || !jobDescription.trim()}
              className="btn-primary"
              style={{
                height: 56,
                borderRadius: 16,
                fontSize: 16,
                fontWeight: 800,
                width: '100%',
                boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)'
              }}
            >
              {isSubmitting ? (
                <span>Generating Customized Interview...</span>
              ) : (
                <>
                  <span>Start AI Interview for JD</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

        </form>
      </motion.div>
    </div>
  );
};

export default JobDescriptionSetupScreen;
