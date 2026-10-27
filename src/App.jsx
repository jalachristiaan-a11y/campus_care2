import { useEffect, useState } from 'react';
import {
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';
import CampusCareLanding from './CampusCareLanding.jsx';
import Register from './Register.jsx';
import Dashboard from './Dashboard.jsx';
import SubmitGrievance from './SubmitGrievance.jsx';
import GrievanceQueue from './GrievanceQueue.jsx';
import { apiRequest } from './apiClient.js';

const SESSION_KEY = 'campuscare.session';
const protectedViews = new Set(['dashboard', 'admin', 'submit-grievance']);

const getStoredSession = () => {
  try {
    const storedSession = window.sessionStorage.getItem(SESSION_KEY);
    if (!storedSession) return null;

    const session = JSON.parse(storedSession);
    return typeof session?.token === 'string' && session.user
      ? session
      : null;
  } catch (error) {
    console.error('Unable to restore CampusCare session:', error);
    return null;
  }
};

const mapApiUser = (user) => ({
  universityEmail: user.email,
  fullName: user.full_name,
  studentId: user.id,
  college: user.department || '',
  department: user.department || '',
  role: user.role,
});

const getInitialView = () => {
  if (typeof window === 'undefined') {
    return 'login';
  }

  if (window.location.hash === '#register') {
    return 'register';
  }

  if (window.location.hash === '#submit-grievance') {
    return 'submit-grievance';
  }

  if (window.location.hash === '#admin') {
    return 'admin';
  }

  if (window.location.hash === '#dashboard') {
    return 'dashboard';
  }

  if (window.location.hash === '#login') {
    return 'login';
  }

  if (window.location.hash === '#landing') {
    return 'landing';
  }

  if (window.location.hash === '#submit' || window.location.hash === '#view') {
    return 'login';
  }

  return 'landing';
};

export default function App() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [authSession, setAuthSession] = useState(getStoredSession);
  const [currentView, setCurrentView] = useState(() => {
    const initialView = getInitialView();
    return protectedViews.has(initialView) && !getStoredSession()
      ? 'login'
      : initialView;
  });
  const [dashboardUser, setDashboardUser] = useState(() => getStoredSession()?.user ?? null);
  const [dashboardTab, setDashboardTab] = useState('Dashboard');
  const [savedGrievanceState, setSavedGrievanceState] = useState({ grievances: [], error: '' });

  useEffect(() => {
    const syncViewFromHash = () => {
      const requestedView = getInitialView();
      const activeSession = authSession?.token ? authSession : getStoredSession();
      if (protectedViews.has(requestedView) && !activeSession?.token) {
        window.location.hash = '#login';
        setCurrentView('login');
        return;
      }
      if (activeSession && !authSession) {
        setAuthSession(activeSession);
        setDashboardUser(activeSession.user);
      }
      setCurrentView(requestedView);
    };

    syncViewFromHash();
    window.addEventListener('hashchange', syncViewFromHash);

    return () => window.removeEventListener('hashchange', syncViewFromHash);
  }, [authSession]);

  useEffect(() => {
    if (!authSession?.token) return undefined;

    let active = true;
    const refreshComplaints = async () => {
      try {
        const result = await apiRequest('/api/complaints', authSession.token);
        if (active) {
          setSavedGrievanceState({ grievances: result.complaints, error: '' });
        }
      } catch (error) {
        if (active) {
          setSavedGrievanceState((previousState) => ({
            ...previousState,
            error: error instanceof Error ? error.message : 'Unable to load complaints.',
          }));
        }
      }
    };

    refreshComplaints();
    const intervalId = window.setInterval(refreshComplaints, 15000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [authSession]);

  const handleGoToRegister = () => {
    setCurrentView('register');
    window.location.hash = '#register';
  };

  const handleGoToLogin = () => {
    window.sessionStorage.removeItem(SESSION_KEY);
    setAuthSession(null);
    setDashboardUser(null);
    setDashboardTab('Dashboard');
    setSavedGrievanceState({ grievances: [], error: '' });
    setCurrentView('login');
    window.location.hash = '#login';
  };

  const handleLandingLogin = () => {
    setCurrentView('login');
    window.location.hash = '#login';
  };

  const handleGoToLanding = () => {
    setCurrentView('landing');
    window.location.hash = '#landing';
  };

  const handleOpenSubmitGrievance = () => {
    setCurrentView('submit-grievance');
    window.location.hash = '#submit-grievance';
  };

  const handleOpenMyGrievances = () => {
    setDashboardTab('My Grievances');
    setCurrentView('dashboard');
    window.location.hash = '#dashboard';
  };

  const handleSaveGrievance = async (formData) => {
    if (!authSession?.token) {
      throw new Error('Please log in again before submitting a complaint.');
    }

    const result = await apiRequest('/api/complaints', authSession.token, {
      method: 'POST',
      body: JSON.stringify(formData),
    });
    const savedGrievance = result.complaint;
    setSavedGrievanceState((previousState) => ({
      grievances: [
        savedGrievance,
        ...previousState.grievances.filter((grievance) => grievance.id !== savedGrievance.id),
      ],
      error: '',
    }));
    return savedGrievance;
  };

  const handleUpdateGrievance = async (grievanceId, formData) => {
    if (!authSession?.token) {
      throw new Error('Please log in again before editing a complaint.');
    }

    const result = await apiRequest(
      `/api/complaints/${encodeURIComponent(grievanceId)}`,
      authSession.token,
      {
        method: 'PATCH',
        body: JSON.stringify(formData),
      },
    );
    const updatedGrievance = result.complaint;
    setSavedGrievanceState((previousState) => ({
      grievances: previousState.grievances.map((grievance) => (
        grievance.id === updatedGrievance.id ? updatedGrievance : grievance
      )),
      error: '',
    }));
    return updatedGrievance;
  };

  const handleWithdrawGrievance = async (grievanceId) => {
    if (!authSession?.token) {
      throw new Error('Please log in again before withdrawing a complaint.');
    }

    const result = await apiRequest(
      `/api/complaints/${encodeURIComponent(grievanceId)}`,
      authSession.token,
      { method: 'DELETE' },
    );
    const withdrawnGrievance = result.complaint;
    setSavedGrievanceState((previousState) => ({
      grievances: previousState.grievances.map((grievance) => (
        grievance.id === withdrawnGrievance.id ? withdrawnGrievance : grievance
      )),
      error: '',
    }));
    return withdrawnGrievance;
  };

  const handleGrievanceSubmitted = () => {
    setDashboardTab('Dashboard');
    setCurrentView('dashboard');
    window.location.hash = '#dashboard';
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setNotification(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || 'Unable to log in. Please try again.');
      }

      const user = result.user;
      const session = { token: result.token, user: mapApiUser(user) };
      window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      setAuthSession(session);
      setDashboardUser(session.user);
      const destination = user.role === 'admin' ? 'admin' : 'dashboard';
      setCurrentView(destination);
      window.location.hash = `#${destination}`;
    } catch (error) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unable to reach the login service.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (currentView === 'admin') {
    return (
      <GrievanceQueue
        user={dashboardUser}
        token={authSession?.token}
        onLogout={handleGoToLogin}
      />
    );
  }

  if (currentView === 'landing') {
    return (
      <CampusCareLanding
        onLogin={handleLandingLogin}
      />
    );
  }

  if (currentView === 'register') {
    return (
      <Register
        onBackToLogin={handleGoToLogin}
      />
    );
  }

  if (currentView === 'dashboard') {
    return (
      <Dashboard
        user={dashboardUser}
        token={authSession?.token}
        grievances={savedGrievanceState.grievances}
        grievanceError={savedGrievanceState.error}
        onFileGrievance={handleOpenSubmitGrievance}
        onUpdateGrievance={handleUpdateGrievance}
        onWithdrawGrievance={handleWithdrawGrievance}
        onLogout={handleGoToLogin}
        initialTab={dashboardTab}
      />
    );
  }

  if (currentView === 'submit-grievance') {
    return (
      <SubmitGrievance
        user={dashboardUser}
        token={authSession?.token}
        onCancel={handleGrievanceSubmitted}
        onSubmit={handleSaveGrievance}
        onViewTickets={handleOpenMyGrievances}
      />
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#f3f4f6] flex items-center justify-center p-4 md:p-8 font-sans antialiased">
      <div className="w-full max-w-[1080px] bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[640px] border border-gray-100">
        <a
          href="#landing"
          onClick={handleGoToLanding}
          aria-label="Return to CampusCare home"
          className="md:col-span-5 relative flex flex-col justify-end p-8 md:p-12 text-white overflow-hidden min-h-[340px] md:min-h-full cursor-pointer focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-[-8px] focus-visible:outline-white"
        >
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?q=80&w=1200&auto=format&fit=crop')`,
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/60 to-black/30" />

          <div className="relative z-10 space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Welcome Home,
              <br />
              <span className="text-[#00A3FF]">Normalite.</span>
            </h1>

            <p className="text-gray-200 text-xs sm:text-sm leading-relaxed max-w-md font-normal opacity-90">
              Step back into the heart of the Crimson Frontier. Access your official campus grievance and student support portal, and stay connected with the WMSU community.
            </p>
          </div>
        </a>

        <div className="md:col-span-7 p-6 sm:p-10 md:p-12 flex flex-col justify-between bg-white">
          <div className="max-w-md mx-auto w-full space-y-6">
            <div className="space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Welcome to CampusCare
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 leading-snug">
                Sign in to track your grievances, submit new concerns, and access ombudsman support.
              </p>
            </div>

            {notification && (
              <div
                role="status"
                aria-live="polite"
                className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                  notification.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                <CheckCircle2 aria-hidden="true" className="w-4 h-4 shrink-0" />
                <span>{notification.message}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4 pt-1">
              <div className="space-y-1">
                <label htmlFor="campus-identifier" className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                  STUDENT ID OR WMSU EMAIL
                </label>
                <div className="relative">
                  <input
                    id="campus-identifier"
                    type="text"
                    autoComplete="username"
                    required
                    value={identifier}
                    onChange={(event) => setIdentifier(event.target.value)}
                    placeholder="Student ID (e.g. 2025-03461) or admin@wmsu.edu.ph"
                    className="w-full cursor-text caret-[#800020] px-3.5 py-2.5 sm:py-3 bg-white text-slate-900 font-semibold text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020] transition-all placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label htmlFor="campus-password" className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                    PASSWORD
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-controls="campus-password"
                    aria-pressed={showPassword}
                    className="text-xs text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1.5 transition-colors focus:outline-none"
                  >
                    <span>{showPassword ? 'Hide' : 'Show'}</span>
                    {showPassword ? (
                      <EyeOff className="w-3.5 h-3.5 text-gray-500" />
                    ) : (
                      <Eye className="w-3.5 h-3.5 text-gray-500" />
                    )}
                  </button>
                </div>

                <div className="relative">
                  <input
                    id="campus-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••••••"
                    className="w-full cursor-text caret-[#800020] px-3.5 py-2.5 sm:py-3 bg-white text-slate-900 font-semibold text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020] transition-all placeholder:text-gray-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-[#800020] hover:bg-[#66001a] text-white font-semibold rounded-xl text-sm shadow-md hover:shadow-lg active:scale-[0.99] transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>Log in</span>
                )}
              </button>
            </form>

            <p className="text-center text-xs text-gray-500 font-normal pt-1">
              Don't have an active tracking ID?{' '}
              <button type="button" onClick={handleGoToRegister} className="font-semibold text-[#800020] hover:underline">
                Register account
              </button>
            </p>
          </div>

          <div className="pt-6 mt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-400 gap-2">
            <span>© Western Mindanao State University</span>
            <a href="#privacy" className="hover:text-gray-600 transition-colors">
              Data Privacy (RA 10173)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
