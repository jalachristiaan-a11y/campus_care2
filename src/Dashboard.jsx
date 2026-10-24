import { useState } from 'react';
import './Dashboard.css';
import MyGrievances from './MyGrievances.jsx';

const Dashboard = ({
  user = {},
  grievances: savedGrievances = [],
  grievanceError = '',
  onFileGrievance,
  initialTab = 'Dashboard',
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const displayName = user.fullName
    || user.universityEmail?.split('@')[0].replace(/[._-]/g, ' ')
    || 'Student';

  const grievances = savedGrievances;
  const activeGrievanceCount = grievances.filter(
    (grievance) => grievance.statusClass !== 'closed',
  ).length;
  const resolvedGrievanceCount = grievances.filter(
    (grievance) => grievance.statusClass === 'closed',
  ).length;

  return (
    <div className="dashboard-container">
      {/* Navigation Header */}
      <header className="navbar">
        <div className="nav-left">
          <div className="brand">
            <div className="brand-logo">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#800020" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div className="brand-text">
              <span className="brand-name">WMSU CampusCare</span>
              <span className="brand-sub">Student Grievance &amp; Redressal Portal</span>
            </div>
          </div>

          <nav className="nav-menu">
            {['Dashboard', 'My Grievances', 'Submit Case', 'Help & Support'].map((tab) => (
              <button
                key={tab}
                className={`nav-item ${activeTab === tab ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(tab);
                  if (tab === 'Submit Case') {
                    onFileGrievance?.();
                  }
                }}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="nav-right">
          <div className="ay-badge">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
            <span>AY 2025-2026</span>
          </div>

          <button className="notif-btn" aria-label="Notifications">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span className="notif-dot"></span>
          </button>

          <div className="user-profile">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop"
              alt="Avatar"
              className="user-avatar"
            />
            <div className="user-info">
              <span className="user-title">{user.role === 'faculty' ? 'Faculty Portal' : 'Student Portal'}</span>
              <span className="user-status">Verified Account</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {grievanceError && (
          <div className="dashboard-storage-error" role="alert">
            {grievanceError}
          </div>
        )}
        {/* Welcome Banner */}
        <section className="welcome-banner">
          <div className="welcome-info">
            <div className="tag-group">
              <span className="info-tag id-tag">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="16" rx="2"/>
                  <circle cx="9" cy="10" r="2"/>
                  <path d="M15 8h2M15 12h2M7 16h10"/>
                </svg>
                {user.studentId ? `ID #${user.studentId}` : 'CampusCare Account'}
              </span>
              {user.college && <span className="info-tag college-tag">{user.college}</span>}
            </div>
            <h1 className="welcome-heading">Welcome back, {displayName}</h1>
            <p className="welcome-sub">
              Track unresolved submissions, communicate with assigned liaisons, and view formal Redressal outcomes.
            </p>
          </div>

          <button className="file-case-btn" onClick={onFileGrievance}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            File New Grievance
          </button>
        </section>

        {activeTab === 'My Grievances' ? (
          <MyGrievances
            grievances={grievances}
            onNewGrievance={onFileGrievance}
          />
        ) : (
          <>
        {/* Metrics Grid */}
        <section className="metrics-row">
          <div className="metric-box">
            <div className="metric-top">
              <span className="metric-label">Active Cases</span>
              <div className="icon-wrap orange">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#d97706" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>
            </div>
            <div className="metric-num">{activeGrievanceCount}</div>
            <div className="metric-sub">Cases requiring follow-up</div>
          </div>

          <div className="metric-box">
            <div className="metric-top">
              <span className="metric-label">Resolved Cases</span>
              <div className="icon-wrap green">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#16a34a" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
            </div>
            <div className="metric-num">{resolvedGrievanceCount}</div>
            <div className="metric-sub">View resolution letters</div>
          </div>

          <div className="metric-box">
            <div className="metric-top">
              <span className="metric-label">Saved Drafts</span>
              <div className="icon-wrap blue">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#2563eb" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                </svg>
              </div>
            </div>
            <div className="metric-num">1</div>
            <div className="metric-sub">Ready to complete</div>
          </div>

          <div className="metric-box">
            <div className="metric-top">
              <span className="metric-label">Redressal Rate</span>
              <div className="icon-wrap purple">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#7c3aed" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 8v4l3 3"/>
                </svg>
              </div>
            </div>
            <div className="metric-num">98%</div>
            <div className="metric-sub">Within standard 14 days</div>
          </div>
        </section>

        {/* Grievances Section */}
        <section className="grievance-section">
          <div className="section-head">
            <div className="title-wrap">
              <h2 className="section-title">Recent Grievances</h2>
              <span className="badge-count">{grievances.length}</span>
            </div>
            <button
              type="button"
              className="link-view"
              onClick={() => setActiveTab('My Grievances')}
            >
              View All &rarr;
            </button>
          </div>

          {grievances.length ? (
            <div className="cards-stack">
              {grievances.map((item) => (
              <div key={item.id} className="case-card">
                <div className="card-header">
                  <div className="header-left">
                    <span className="case-code">{item.id}</span>
                  </div>
                  <span className="cat-pill">{item.category}</span>
                </div>

                <h3 className="case-heading">{item.title}</h3>
                <p className="case-body">{item.description}</p>

                <div className="card-footer">
                  <div className="meta-left">
                    <span className={`status-text ${item.statusClass}`}>
                      {item.statusClass === 'progress' && '• '}
                      {item.statusClass === 'review' && '• '}
                      {item.statusClass === 'closed' && '✓ '}
                      {item.status}
                    </span>
                    <span className="meta-split">• {item.department}</span>
                    {item.updated && <span className="meta-split">• {item.updated}</span>}
                  </div>

                  <button className={`action-link ${item.isDownload ? 'download-link' : ''}`}>
                    {item.isDownload && (
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                    )}
                    {item.actionText}
                  </button>
                </div>
              </div>
              ))}
            </div>
          ) : (
            <div className="dashboard-empty-grievances">
              <h3>No grievance history yet</h3>
              <p>Your submitted grievances will appear here.</p>
            </div>
          )}
        </section>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-left">
          <span>© Western Mindanao State University</span>
          <span>•</span>
          <span>Office of Student Affairs &amp; Grievances</span>
        </div>
        <div className="footer-right">
          <a href="#charter">Confidentiality Charter</a>
          <a href="#code">Student Code</a>
          <a href="#ombudsperson">Ombudsperson</a>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
