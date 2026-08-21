import React, { useMemo, useState } from 'react';
import { ChevronLeft, Menu, User, Briefcase, Home, LogOut } from 'lucide-react';

const DashboardLayout = ({
  appName = 'AI Mock Interview',
  activeKey,
  items,
  headerTitle,
  headerSubtitle,
  onNavigate,
  headerRight,
  candidateUser,
  onNavigateJobSetup,
  onNavigateHome,
  children
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const safeItems = useMemo(() => (Array.isArray(items) ? items : []), [items]);

  const handleNavigate = (key, disabled) => {
    if (disabled) return;
    if (typeof onNavigate === 'function') onNavigate(key);
    setIsSidebarOpen(false);
  };

  return (
    <div className="ds-root">
      <div
        className={`ds-overlay ${isSidebarOpen ? 'is-open' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <aside className={`ds-sidebar ${isSidebarOpen ? 'is-open' : ''}`}>
        <div className="ds-sidebar-top">
          <div className="ds-brand" onClick={onNavigateHome} style={{ cursor: 'pointer' }}>
            <div className="ds-brand-mark" />
            <div className="ds-brand-text">
              <div className="ds-brand-name">{appName}</div>
              <div className="ds-brand-caption">Studio Dashboard</div>
            </div>
          </div>

          <button
            type="button"
            className="ds-sidebar-collapse"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        <nav className="ds-nav">
          {safeItems.map((item) => {
            const isActive = item.key === activeKey;
            const disabled = Boolean(item.disabled);
            const Icon = item.icon;

            return (
              <button
                key={item.key}
                type="button"
                className={`ds-nav-item ${isActive ? 'is-active' : ''}`}
                onClick={() => handleNavigate(item.key, disabled)}
                disabled={disabled}
              >
                <span className="ds-nav-icon">{Icon ? <Icon className="w-5 h-5" /> : null}</span>
                <span className="ds-nav-label">{item.label}</span>
                {item.badge ? <span className="ds-nav-badge">{item.badge}</span> : null}
              </button>
            );
          })}
        </nav>

        {/* Candidate User Card in Sidebar Bottom */}
        <div className="ds-sidebar-bottom">
          {candidateUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '12px', marginBottom: '8px' }}>
              <div style={{ width: 34, height: 34, borderRadius: '10px', background: '#6366f1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13 }}>
                {candidateUser.name ? candidateUser.name[0] : 'C'}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'white', textOverflow: 'ellipsis', overflow: 'hidden', whitespace: 'nowrap' }}>
                  {candidateUser.name}
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', textOverflow: 'ellipsis', overflow: 'hidden', whitespace: 'nowrap' }}>
                  {candidateUser.role || candidateUser.email}
                </div>
              </div>
            </div>
          ) : null}

          <div style={{ display: 'flex', gap: '6px' }}>
            {onNavigateJobSetup && (
              <button
                type="button"
                onClick={onNavigateJobSetup}
                style={{ flex: 1, padding: '6px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#cbd5e1', fontSize: '11px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
              >
                <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                <span>JD Setup</span>
              </button>
            )}
            {onNavigateHome && (
              <button
                type="button"
                onClick={onNavigateHome}
                style={{ flex: 1, padding: '6px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#cbd5e1', fontSize: '11px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
              >
                <Home className="w-3.5 h-3.5 text-indigo-400" />
                <span>Home</span>
              </button>
            )}
          </div>
        </div>
      </aside>

      <div className="ds-main">
        <header className="ds-header">
          <button
            type="button"
            className="ds-menu-btn"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="ds-header-titles">
            <div className="ds-header-title">{headerTitle}</div>
            {headerSubtitle ? <div className="ds-header-subtitle">{headerSubtitle}</div> : null}
          </div>

          <div className="ds-header-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {onNavigateJobSetup && (
              <button
                type="button"
                onClick={onNavigateJobSetup}
                className="ds-header-btn"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', background: '#e0e7ff', border: '1px solid #c7d2fe', color: '#3730a3', fontWeight: 700 }}
              >
                <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                <span>Change JD Setup</span>
              </button>
            )}

            {headerRight}
          </div>
        </header>

        <main className="ds-content">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
