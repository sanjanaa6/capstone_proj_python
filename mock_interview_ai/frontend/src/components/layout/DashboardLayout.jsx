import React, { useMemo, useState } from 'react';
import { ChevronLeft, Menu } from 'lucide-react';

const DashboardLayout = ({
  appName = 'AI Mock Interview',
  activeKey,
  items,
  headerTitle,
  headerSubtitle,
  onNavigate,
  headerRight,
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
          <div className="ds-brand">
            <div className="ds-brand-mark" />
            <div className="ds-brand-text">
              <div className="ds-brand-name">{appName}</div>
              <div className="ds-brand-caption">Dashboard</div>
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

        <div className="ds-sidebar-bottom">
          <div className="ds-sidebar-hint">Tip: Use the sidebar to jump between sections.</div>
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

          <div className="ds-header-right">{headerRight}</div>
        </header>

        <main className="ds-content">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
