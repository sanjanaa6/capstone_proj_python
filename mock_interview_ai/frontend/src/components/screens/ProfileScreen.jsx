import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Briefcase, Layers, Tag } from 'lucide-react';

const STORAGE_KEY = 'mock_interview_profile_v1';

const ProfileScreen = () => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Fresher');
  const [preferredTopics, setPreferredTopics] = useState('');
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (typeof parsed?.name === 'string') setName(parsed.name);
      if (typeof parsed?.role === 'string') setRole(parsed.role);
      if (typeof parsed?.experienceLevel === 'string') setExperienceLevel(parsed.experienceLevel);
      if (typeof parsed?.preferredTopics === 'string') setPreferredTopics(parsed.preferredTopics);
      if (typeof parsed?.savedAt === 'number') setSavedAt(parsed.savedAt);
    } catch {
      // ignore
    }
  }, []);

  const canSave = useMemo(() => {
    return Boolean(name.trim()) || Boolean(role.trim()) || Boolean(preferredTopics.trim());
  }, [name, role, preferredTopics]);

  const save = () => {
    const payload = {
      name: name.trim(),
      role: role.trim(),
      experienceLevel,
      preferredTopics: preferredTopics.trim(),
      savedAt: Date.now()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    setSavedAt(payload.savedAt);
  };

  const clear = () => {
    localStorage.removeItem(STORAGE_KEY);
    setName('');
    setRole('');
    setExperienceLevel('Fresher');
    setPreferredTopics('');
    setSavedAt(null);
  };

  return (
    <div className="ds-page">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="ds-page-inner"
      >
        <div className="card">
          <div className="ds-settings-title">Profile</div>
          <div className="ds-settings-subtitle">Set your details to personalize interview prep.</div>

          <div className="ds-settings-list">
            <div className="ds-setting">
              <div className="ds-setting-left">
                <div className="ds-setting-icon">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="ds-setting-title">Name</div>
                  <div className="ds-setting-subtitle">Your display name</div>
                </div>
              </div>
              <input
                className="input-field"
                style={{ maxWidth: 320 }}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Sanjana"
              />
            </div>

            <div className="ds-setting">
              <div className="ds-setting-left">
                <div className="ds-setting-icon">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <div className="ds-setting-title">Target Role</div>
                  <div className="ds-setting-subtitle">What role are you preparing for?</div>
                </div>
              </div>
              <input
                className="input-field"
                style={{ maxWidth: 320 }}
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g., Java Developer"
              />
            </div>

            <div className="ds-setting">
              <div className="ds-setting-left">
                <div className="ds-setting-icon">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <div className="ds-setting-title">Experience Level</div>
                  <div className="ds-setting-subtitle">Used for difficulty calibration</div>
                </div>
              </div>
              <select
                className="input-field"
                style={{ maxWidth: 320, background: 'white' }}
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
              >
                <option value="Fresher">Fresher</option>
                <option value="Junior">Junior</option>
                <option value="Mid">Mid</option>
                <option value="Senior">Senior</option>
              </select>
            </div>

            <div className="ds-setting">
              <div className="ds-setting-left">
                <div className="ds-setting-icon">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <div className="ds-setting-title">Preferred Topics</div>
                  <div className="ds-setting-subtitle">Comma-separated (e.g., OOP, Spring, SQL)</div>
                </div>
              </div>
              <input
                className="input-field"
                style={{ maxWidth: 320 }}
                value={preferredTopics}
                onChange={(e) => setPreferredTopics(e.target.value)}
                placeholder="e.g., OOP, Spring Boot, Microservices"
              />
            </div>
          </div>

          <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button type="button" className="btn-primary" onClick={save} disabled={!canSave}>
              Save Profile
            </button>
            <button type="button" className="btn-secondary" onClick={clear}>
              Clear
            </button>
            <div className="muted" style={{ fontSize: 12, alignSelf: 'center' }}>
              {savedAt ? `Saved ${new Date(savedAt).toLocaleString()}` : 'Not saved yet'}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileScreen;
