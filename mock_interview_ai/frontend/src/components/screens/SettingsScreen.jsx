import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Shield, Volume2 } from 'lucide-react';

const SettingsScreen = () => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(false);

  const ToggleRow = ({ icon, title, subtitle, value, onChange }) => (
    <div className="ds-setting">
      <div className="ds-setting-left">
        <div className="ds-setting-icon">{icon}</div>
        <div>
          <div className="ds-setting-title">{title}</div>
          <div className="ds-setting-subtitle">{subtitle}</div>
        </div>
      </div>

      <button
        type="button"
        className={`ds-toggle ${value ? 'is-on' : ''}`}
        onClick={() => onChange(!value)}
        aria-pressed={value}
      >
        <span className="ds-toggle-knob" />
      </button>
    </div>
  );

  return (
    <div className="ds-page">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="ds-page-inner"
      >
        <div className="card">
          <div className="ds-settings-title">Settings</div>
          <div className="ds-settings-subtitle">Personalize your experience.</div>

          <div className="ds-settings-list">
            <ToggleRow
              icon={<Volume2 className="w-5 h-5" />}
              title="Sound"
              subtitle="Play sounds and voice prompts"
              value={soundEnabled}
              onChange={setSoundEnabled}
            />
            <ToggleRow
              icon={<Bell className="w-5 h-5" />}
              title="Notifications"
              subtitle="Get reminders for practice sessions"
              value={notificationsEnabled}
              onChange={setNotificationsEnabled}
            />
            <ToggleRow
              icon={<Shield className="w-5 h-5" />}
              title="Privacy mode"
              subtitle="Hide sensitive information on screen"
              value={privacyMode}
              onChange={setPrivacyMode}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsScreen;
