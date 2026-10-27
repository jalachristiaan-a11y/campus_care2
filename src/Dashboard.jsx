import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bell,
  ClipboardList,
  FilePlus2,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import campusCareLogo from './assets/campuscare-logo.png';
import './Dashboard.css';
import MyGrievances from './MyGrievances.jsx';
import LogoutConfirmation from './LogoutConfirmation.jsx';
import { apiRequest } from './apiClient.js';

const Dashboard = ({
  user: suppliedUser,
  grievances: savedGrievances = [],
  grievanceError = '',
  onFileGrievance,
  onUpdateGrievance,
  onWithdrawGrievance,
  onLogout,
  token,
  initialTab = 'Dashboard',
}) => {
  const user = suppliedUser ?? {};
  const [activeTab, setActiveTab] = useState(initialTab);
  const [logoutConfirmationOpen, setLogoutConfirmationOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState(() => new Set());
  const [studentMessages, setStudentMessages] = useState([]);
  const [noticeError, setNoticeError] = useState('');
  const notificationPanelRef = useRef(null);
  const rawName = user?.fullName
    || (user?.universityEmail ? user.universityEmail.split('@')[0].replace(/[._-]/g, ' ') : '');
  const cleanName = rawName?.trim().toLowerCase();

  const displayName = (!rawName || cleanName === 'student id' || cleanName === 'student')
    ? 'Student'
    : rawName
        .split(' ')
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');

  const studentId = user?.studentId || '';
  const studentInitials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
  const today = new Date().toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const grievances = savedGrievances;
  const activeGrievanceCount = grievances.filter(
    (grievance) => !['closed', 'withdrawn'].includes(grievance.statusClass),
  ).length;
  const resolvedGrievanceCount = grievances.filter(
    (grievance) => grievance.statusClass === 'closed',
  ).length;
  const normalizedStudentId = (studentId || '').replace(/^ty/i, '').replace(/\D/g, '');
  const normalizedEmail = (user?.universityEmail || '').trim().toLowerCase();
  const normalizedName = displayName.trim().toLowerCase().replace(/\s+/g, ' ');
  const matchingMessages = studentMessages.filter((message) => {
    const emailMatches = message.recipientEmail
      && message.recipientEmail.trim().toLowerCase() === normalizedEmail;
    const idMatches = message.recipientStudentId
      && message.recipientStudentId.replace(/^ty/i, '').replace(/\D/g, '') === normalizedStudentId;
    const nameMatches = message.recipientName
      && message.recipientName.trim().toLowerCase().replace(/\s+/g, ' ') === normalizedName;
    return emailMatches || idMatches || nameMatches;
  });
  const studentNotifications = useMemo(
    () => [
      ...matchingMessages.map((message) => ({
        id: `message:${message.id}`,
        kind: 'message',
        title: message.subject,
        details: `${message.type || 'Official Notice'} · Message from CampusCare Administration`,
        body: message.message,
        status: message.sentAt ? new Date(message.sentAt).toLocaleString() : 'Just now',
      })),
      ...grievances.slice(0, 5).map((grievance) => ({
        id: `grievance:${grievance.id}:${grievance.status}`,
        kind: 'grievance',
        title: grievance.statusClass === 'closed'
          ? 'Grievance resolved'
          : grievance.statusClass === 'withdrawn'
            ? 'Grievance withdrawn'
          : grievance.statusClass === 'progress'
            ? 'Grievance in progress'
            : 'Grievance under review',
        details: `${grievance.id} · ${grievance.title}`,
        status: grievance.status || 'Status update',
      })),
    ],
    [matchingMessages, grievances],
  );
  const unreadNotificationCount = studentNotifications.filter(
    (notification) => !readNotificationIds.has(notification.id),
  ).length;

  useEffect(() => {
    if (!notificationsOpen) return undefined;

    const closeOnOutsideClick = (event) => {
      if (!notificationPanelRef.current?.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setNotificationsOpen(false);
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [notificationsOpen]);

  const openStudentGrievance = (notification) => {
    setReadNotificationIds((previousIds) => new Set(previousIds).add(notification.id));
    if (notification.kind === 'grievance' || notification.kind === 'message') {
      setActiveTab('My Grievances');
    }
    setNotificationsOpen(false);
  };

  useEffect(() => {
    if (!token) return undefined;
    let active = true;
    const refreshMessages = async () => {
      try {
        const result = await apiRequest('/api/notices', token);
        if (active) {
          setStudentMessages(result.notices);
          setNoticeError('');
        }
      } catch (error) {
        if (active) {
          setNoticeError(error instanceof Error ? error.message : 'Unable to load notices.');
        }
      }
    };

    refreshMessages();
    const intervalId = window.setInterval(refreshMessages, 15000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [token]);

  return (
    <div className="dashboard-container">
      <div className="student-portal-shell">
        <aside className="student-sidebar">
          <a className="student-sidebar-brand" href="#dashboard" aria-label="CampusCare dashboard">
            <span className="student-sidebar-logo">
              <img src={campusCareLogo} alt="" aria-hidden="true" />
            </span>
            <span>
              <strong>CampusCare</strong>
              <small>WMSU · SCGTS</small>
            </span>
          </a>

          <nav className="student-sidebar-nav" aria-label="Student navigation">
            {[
              { label: 'Dashboard', icon: LayoutDashboard },
              { label: 'My Grievances', icon: ClipboardList },
              { label: 'Submit Case', icon: FilePlus2 },
              { label: 'Help & Support', icon: HelpCircle },
            ].map(({ label, icon: Icon }) => (
              <button
                type="button"
                key={label}
                className={`student-sidebar-link${activeTab === label ? ' active' : ''}`}
                aria-current={activeTab === label ? 'page' : undefined}
                onClick={() => {
                  setActiveTab(label);
                  if (label === 'Submit Case') onFileGrievance?.();
                }}
              >
                <Icon size={17} aria-hidden="true" />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          <button
            type="button"
            className="student-sidebar-logout"
            onClick={() => setLogoutConfirmationOpen(true)}
          >
            <LogOut size={17} aria-hidden="true" />
            <span>Log out</span>
          </button>
        </aside>

        <div className="student-workspace">
          <header className="student-topbar">
            <div className="student-topbar-title">
              <span>STUDENT PORTAL</span>
              <strong>{activeTab}</strong>
            </div>
            <div className="student-topbar-actions">
              <div className="student-profile">
                <span className="student-profile-avatar" aria-hidden="true">{studentInitials}</span>
                <span className="student-profile-copy">
                  <strong>{displayName}</strong>
                  <small>{user?.studentId || user?.universityEmail || 'WMSU Student'}</small>
                </span>
              </div>
              <div className="student-notifications" ref={notificationPanelRef}>
                <button
                  type="button"
                  className="student-notifications-button"
                  aria-label={`Notifications${unreadNotificationCount ? `, ${unreadNotificationCount} unread` : ''}`}
                  aria-haspopup="dialog"
                  aria-expanded={notificationsOpen}
                  aria-controls="student-notification-panel"
                  onClick={() => setNotificationsOpen((isOpen) => !isOpen)}
                >
                  <Bell size={18} aria-hidden="true" />
                  {unreadNotificationCount > 0 && (
                    <span className="student-notifications-count">{unreadNotificationCount}</span>
                  )}
                </button>

                {notificationsOpen && (
                  <section
                    id="student-notification-panel"
                    className="student-notifications-panel"
                    role="dialog"
                    aria-label="Student notifications"
                  >
                    <div className="student-notifications-heading">
                      <div>
                        <h2>Notifications</h2>
                        <p>{unreadNotificationCount ? `${unreadNotificationCount} unread` : 'All caught up'}</p>
                      </div>
                      {unreadNotificationCount > 0 && (
                        <button
                          type="button"
                          className="student-notifications-mark-read"
                          onClick={() => setReadNotificationIds(new Set(studentNotifications.map((item) => item.id)))}
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    {studentNotifications.length > 0 ? (
                      <ul className="student-notifications-list">
                        {studentNotifications.map((notification) => {
                          const isUnread = !readNotificationIds.has(notification.id);
                          return (
                            <li key={notification.id}>
                              <button
                                type="button"
                                className={`student-notification-item${isUnread ? ' unread' : ''}`}
                                onClick={() => openStudentGrievance(notification)}
                              >
                                <span className={`student-notification-dot${isUnread ? ' unread' : ''}`} />
                                <span className="student-notification-content">
                                  <span className="student-notification-title">
                                    {notification.title}
                                    {isUnread && <span className="student-notification-new">NEW</span>}
                                  </span>
                                  <span className="student-notification-details">{notification.details}</span>
                                  {notification.body && (
                                    <span className="student-notification-message">{notification.body}</span>
                                  )}
                                  <span className="student-notification-status">{notification.status} · View grievances</span>
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="student-notifications-empty">No grievance notifications yet.</p>
                    )}
                  </section>
                )}
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
            {user?.college ? (
              <div className="tag-group">
                <span className="info-tag college-tag">{user.college}</span>
              </div>
            ) : null}
            <p className="welcome-date">{today}</p>
            <h1 className="welcome-heading">Welcome back, {displayName}</h1>
            {studentId && (
              <p className="welcome-student-id">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <circle cx="9" cy="10" r="2" />
                  <path d="M15 8h2M15 12h2M7 16h10" />
                </svg>
                <span>Student ID: <strong>{studentId}</strong></span>
              </p>
            )}
            <p className="welcome-sub">
              Track unresolved submissions, communicate with assigned liaisons, and view formal Redressal outcomes.
            </p>
          </div>

          <button type="button" className="file-case-btn" onClick={onFileGrievance}>
            <span className="file-case-icon-badge" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </span>
            <span>File New Grievance</span>
          </button>
          <div className="welcome-illustration" aria-hidden="true">
            <ShieldCheck size={116} strokeWidth={1.2} />
          </div>
        </section>

        {activeTab === 'Help & Support' ? (
          <section className="student-help-page" aria-labelledby="student-help-title">
            <div className="student-help-intro">
              <span className="student-help-icon"><HelpCircle size={22} aria-hidden="true" /></span>
              <div>
                <h1 id="student-help-title">Help &amp; Support</h1>
                <p>Find guidance for submitting and tracking a grievance through CampusCare.</p>
              </div>
            </div>

            <div className="student-help-grid">
              <article className="student-help-card">
                <span className="student-help-card-icon"><ClipboardList size={18} aria-hidden="true" /></span>
                <h2>Submitting a grievance</h2>
                <ol>
                  <li>Select <strong>Submit Case</strong> and choose the category that best fits your concern.</li>
                  <li>Describe what happened, when it happened, and what outcome or support you are requesting.</li>
                  <li>Attach relevant supporting documents, then submit and keep the case ID for your records.</li>
                </ol>
                <button type="button" className="student-help-action" onClick={onFileGrievance}>
                  Submit a case
                </button>
              </article>

              <article className="student-help-card">
                <span className="student-help-card-icon"><ShieldCheck size={18} aria-hidden="true" /></span>
                <h2>Tracking your case</h2>
                <p>Open <strong>My Grievances</strong> to review case details and the latest status.</p>
                <ul>
                  <li><strong>Under Review:</strong> your submission has been received and is being assessed.</li>
                  <li><strong>In Progress:</strong> the assigned office is working on your concern.</li>
                  <li><strong>Resolved:</strong> a resolution has been recorded for your case.</li>
                </ul>
                <button type="button" className="student-help-action secondary" onClick={() => setActiveTab('My Grievances')}>
                  View my grievances
                </button>
              </article>

              <article className="student-help-card student-help-contact">
                <span className="student-help-card-icon"><MapPin size={18} aria-hidden="true" /></span>
                <h2>Need more help?</h2>
                <p>For assistance with a submission or account issue, contact the Office of Student Affairs &amp; Grievances through official university channels. Include your case ID when asking about an existing grievance.</p>
                <address>
                  Western Mindanao State University<br />
                  Normal Road, Baliwasan<br />
                  Zamboanga City
                </address>
              </article>
            </div>

            <section className="student-help-faq" aria-labelledby="student-help-faq-title">
              <h2 id="student-help-faq-title">Frequently asked questions</h2>
              <details>
                <summary>What happens after I submit a case?</summary>
                <p>Your case appears in My Grievances with its case ID and current review status. Check back there for updates.</p>
              </details>
              <details>
                <summary>Can I update a submitted grievance?</summary>
                <p>If you need to add information, contact the Office of Student Affairs &amp; Grievances and provide your case ID. Do not submit a duplicate unless instructed.</p>
              </details>
              <details>
                <summary>Who can see the information I submit?</summary>
                <p>Grievance details are used by the university offices responsible for reviewing and addressing your concern. Avoid including passwords or unrelated sensitive information.</p>
              </details>
            </section>
          </section>
        ) : activeTab === 'My Grievances' ? (
          <MyGrievances
            grievances={grievances}
            token={token}
            onNewGrievance={onFileGrievance}
            onUpdateGrievance={onUpdateGrievance}
            onWithdrawGrievance={onWithdrawGrievance}
          />
        ) : (
          <>
        <div className="dashboard-columns">
          <div className="dashboard-primary">
            <section className="metrics-row" aria-label="Grievance summary">
              <article className="metric-box">
                <div className="metric-top">
                  <span className="metric-label">Total Cases</span>
                  <span className="summary-icon"><ClipboardList size={18} aria-hidden="true" /></span>
                </div>
                <div className="metric-num">{grievances.length}</div>
                <div className="metric-sub">Concerns submitted</div>
              </article>
              <article className="metric-box">
                <div className="metric-top">
                  <span className="metric-label">Active Cases</span>
                  <span className="summary-icon"><Bell size={18} aria-hidden="true" /></span>
                </div>
                <div className="metric-num">{activeGrievanceCount}</div>
                <div className="metric-sub">Currently being reviewed</div>
              </article>
              <article className="metric-box">
                <div className="metric-top">
                  <span className="metric-label">Resolved Cases</span>
                  <span className="summary-icon"><ShieldCheck size={18} aria-hidden="true" /></span>
                </div>
                <div className="metric-num">{resolvedGrievanceCount}</div>
                <div className="metric-sub">Completed concerns</div>
              </article>
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
          </div>

          <aside className="dashboard-aside">
            <section className="daily-notice-card" aria-labelledby="daily-notice-title">
              <div className="daily-notice-heading">
                <div>
                  <span className="daily-notice-eyebrow">CAMPUSCARE</span>
                  <h2 id="daily-notice-title">Recent updates</h2>
                </div>
                <button type="button" onClick={() => setNotificationsOpen(true)}>See all</button>
              </div>
              {studentNotifications.length ? (
                <ul className="daily-notice-list">
                  {studentNotifications.slice(0, 4).map((notification) => (
                    <li key={`notice:${notification.id}`}>
                      <button type="button" className="daily-notice-item" onClick={() => openStudentGrievance(notification)}>
                        <span className="daily-notice-dot" aria-hidden="true" />
                        <span>
                          <strong>{notification.title}</strong>
                          <small>{notification.details}</small>
                          <small className="daily-notice-status">{notification.status}</small>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="daily-notice-empty">
                  <Bell size={20} aria-hidden="true" />
                  <p>{noticeError || 'Updates about your submitted concerns will appear here.'}</p>
                </div>
              )}
              <button type="button" className="notice-submit-button" onClick={onFileGrievance}>
                <FilePlus2 size={16} aria-hidden="true" />
                <span>Submit a concern</span>
              </button>
            </section>
          </aside>
        </div>
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
      </footer>
        </div>
      </div>
      {logoutConfirmationOpen && (
        <LogoutConfirmation
          onCancel={() => setLogoutConfirmationOpen(false)}
          onConfirm={onLogout}
        />
      )}
    </div>
  );
};

export default Dashboard;
