import { useEffect, useState } from 'react';
import {
  Eye,
  EyeOff,
  GraduationCap,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import Register from './Register.jsx';
import Dashboard from './Dashboard.jsx';
import SubmitGrievance from './SubmitGrievance.jsx';
import { getGrievances, saveGrievance } from './grievanceStore.js';

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

  return window.location.hash === '#dashboard' ? 'dashboard' : 'login';
};

export default function App() {
  const [activeTab, setActiveTab] = useState('student');
  const [email, setEmail] = useState('student.id@wmsu.edu.ph');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [currentView, setCurrentView] = useState(getInitialView);
  const [dashboardUser, setDashboardUser] = useState(null);
  const [dashboardTab, setDashboardTab] = useState('Dashboard');
  const [savedGrievanceState, setSavedGrievanceState] = useState(() => {
    try {
      return { grievances: getGrievances(), error: '' };
    } catch (error) {
      return {
        grievances: [],
        error: error instanceof Error ? error.message : 'Unable to load saved grievances.',
      };
    }
  });

  useEffect(() => {
    const syncViewFromHash = () => {
      setCurrentView(getInitialView());
    };

    syncViewFromHash();
    window.addEventListener('hashchange', syncViewFromHash);

    return () => window.removeEventListener('hashchange', syncViewFromHash);
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'student') {
      setEmail('student.id@wmsu.edu.ph');
    } else {
      setEmail('faculty.id@wmsu.edu.ph');
    }
  };

  const handleGoToRegister = () => {
    setCurrentView('register');
    window.location.hash = '#register';
  };

  const handleGoToLogin = () => {
    setCurrentView('login');
    window.location.hash = '#login';
  };

  const handleProfileComplete = (profile) => {
    setDashboardUser(profile);
    setCurrentView('dashboard');
    window.location.hash = '#dashboard';
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

  const handleSaveGrievance = (formData) => {
    const savedGrievance = saveGrievance(formData, dashboardUser ?? {});
    setSavedGrievanceState((previousState) => ({
      grievances: [savedGrievance, ...previousState.grievances],
      error: '',
    }));
    return savedGrievance;
  };

  const handleGrievanceSubmitted = () => {
    setDashboardTab('Dashboard');
    setCurrentView('dashboard');
    window.location.hash = '#dashboard';
  };

  const handleLogin = (event) => {
    event.preventDefault();
    setIsLoading(true);
    setNotification(null);

    setTimeout(() => {
      setIsLoading(false);
      setDashboardUser({
        universityEmail: email,
        fullName: email.split('@')[0].replace(/[._-]/g, ' '),
        role: activeTab,
      });
      setCurrentView('dashboard');
      window.location.hash = '#dashboard';
    }, 1200);
  };

  if (currentView === 'register') {
    return (
      <Register
        onBackToLogin={handleGoToLogin}
        onComplete={handleProfileComplete}
      />
    );
  }

  if (currentView === 'dashboard') {
    return (
      <Dashboard
        user={dashboardUser}
        grievances={savedGrievanceState.grievances}
        grievanceError={savedGrievanceState.error}
        onFileGrievance={handleOpenSubmitGrievance}
        initialTab={dashboardTab}
      />
    );
  }

  if (currentView === 'submit-grievance') {
    return (
      <SubmitGrievance
        user={dashboardUser}
        onCancel={handleGrievanceSubmitted}
        onSubmit={handleSaveGrievance}
        onViewTickets={handleOpenMyGrievances}
      />
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#f3f4f6] flex items-center justify-center p-4 md:p-8 font-sans antialiased">
      <div className="w-full max-w-[1080px] bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[640px] border border-gray-100">
        <div className="md:col-span-5 relative flex flex-col justify-end p-8 md:p-12 text-white overflow-hidden min-h-[340px] md:min-h-full">
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
        </div>

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

            <div className="p-1 bg-slate-100 rounded-xl flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleTabChange('student')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  activeTab === 'student' ? 'bg-white text-[#800020] shadow-sm' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <GraduationCap className={`w-4 h-4 ${activeTab === 'student' ? 'text-[#800020]' : 'text-gray-400'}`} />
                <span>Student Portal</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('faculty')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  activeTab === 'faculty' ? 'bg-white text-[#800020] shadow-sm' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <Building2 className={`w-4 h-4 ${activeTab === 'faculty' ? 'text-[#800020]' : 'text-gray-400'}`} />
                <span>Faculty & Staff SSO</span>
              </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 pt-1">
              <div className="space-y-1">
                <label htmlFor="campus-email" className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                  UNIVERSITY EMAIL ADDRESS
                </label>
                <div className="relative">
                  <input
                    id="campus-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="student.id@wmsu.edu.ph"
                    className="w-full px-3.5 py-2.5 sm:py-3 bg-white text-slate-900 font-semibold text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020] transition-all placeholder:text-gray-400"
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
                    className="w-full px-3.5 py-2.5 sm:py-3 bg-white text-slate-900 font-semibold text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020] transition-all placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <a href="#forgot-password" className="text-xs font-semibold text-[#800020] hover:underline">
                  Forgot password?
                </a>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="accent-[#800020]"
                  />
                  <span className="text-xs text-gray-600 font-medium">Remember me</span>
                </label>
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

            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-gray-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-semibold tracking-wider text-gray-400 uppercase absolute">
                OR
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setNotification({
                  type: 'success',
                  message: 'Redirecting to WMSU Google SSO...',
                });
              }}
              className="w-full py-2.5 sm:py-3 px-4 bg-gray-50/80 hover:bg-gray-100/80 border border-gray-200 text-gray-700 font-semibold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all active:scale-[0.99]"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with WMSU Google Account</span>
            </button>

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
