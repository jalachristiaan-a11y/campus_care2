import { useEffect, useState } from 'react';
import {
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldAlert,
  Lock,
  Clock,
  UserCheck,
  Users,
  MessageSquare,
  Heart,
  HelpCircle,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  ArrowUpRight,
  Send,
} from 'lucide-react';
import Register from './Register.jsx';
import Dashboard from './Dashboard.jsx';
import SubmitGrievance from './SubmitGrievance.jsx';
import GrievanceQueue from './GrievanceQueue.jsx';
import { getGrievances, saveGrievance } from './grievanceStore.js';
import campusBuildingBackground from './assets/campus-building-background.png';

const KNOWN_STUDENTS = {
  '2025-03461': { name: 'Maya Vance', email: 'maya.vance@wmsu.edu.ph', college: 'College of Computing Studies' },
  '2025-02907': { name: 'Nadzmi Gapur Abah', email: 'ty202502907@wmsu.edu.ph', college: 'College of Computing Studies' },
  '2025-02697': { name: 'Rovhic Chawee Alesna Ageas', email: 'ty202502697@wmsu.edu.ph', college: 'College of Computing Studies' },
  '2025-01218': { name: 'Ainee Hana Tan Ahamad', email: 'ty202501218@wmsu.edu.ph', college: 'College of Nursing' },
  '2025-02109': { name: 'Amilhan Manceras Akbara', email: 'ty202502109@wmsu.edu.ph', college: 'College of Engineering' },
  '2025-01689': { name: 'Rhainiel Genesis G. Alavera', email: 'ty202501689@wmsu.edu.ph', college: 'College of Engineering' },
  '2025-02141': { name: 'Jeric Linto Alvarez', email: 'ty202502141@wmsu.edu.ph', college: 'College of Liberal Arts' },
  '2025-02972': { name: 'Onyx Ferrer Bagarinao', email: 'ty202502972@wmsu.edu.ph', college: 'College of Computing Studies' },
  '2025-00580': { name: 'Mutalib Alaja Bakili', email: 'ty202500580@wmsu.edu.ph', college: 'College of Science and Mathematics' },
  '2025-02106': { name: 'Christian Joshua Feliciano Cabual', email: 'ty202502106@wmsu.edu.ph', college: 'College of Computing Studies' },
  '2025-00296': { name: 'Cassandra Ashley Bayabos Sailela', email: 'ty202500296@wmsu.edu.ph', college: 'College of Architecture' },
};

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

  if (window.location.hash === '#submit' || window.location.hash === '#view') {
    return 'login';
  }

  return 'landing';
};

function CampusCareLanding({ onLogin }) {
  const [contactStatus, setContactStatus] = useState('');
  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleContactSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const subject = String(formData.get('subject') || 'CampusCare inquiry');
    const body = [
      `Name: ${formData.get('name')}`,
      `Reply email: ${formData.get('email')}`,
      '',
      String(formData.get('message') || ''),
    ].join('\n');
    window.location.href = `mailto:osas@wmsu.edu.ph?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setContactStatus('Your email app should open with your message ready to send.');
  };

  const featureCards = [
    {
      icon: Lock,
      title: 'Official & Transparent Process',
      description: 'All submissions follow transparent institutional documentation and official grievance records to guarantee accountability and due process.',
    },
    {
      icon: Clock,
      title: 'Real-Time Ticket Tracking',
      description: 'Monitor investigation stages, desk review timestamps, and university resolution letters dynamically.',
    },
    {
      icon: UserCheck,
      title: 'Fair Institutional Process',
      description: 'Grievances are directed to the appropriate university reviewers to support impartial, fair resolution.',
    },
  ];
  const aboutCards = [
    {
      icon: HelpCircle,
      title: 'What is CampusCare?',
      description: 'Overseen by the University Ombudsman, CampusCare replaces slow paper-based grievances with secure digital tracking, structured triage, and direct communication.',
      note: 'Official WMSU Platform',
    },
    {
      icon: Lock,
      title: 'Protection for Official Complaints',
      description: 'Student rights and confidentiality are safeguarded under the WMSU Student Handbook and the Data Privacy Act of 2012 (RA 10173).',
      note: 'RA 10173 protected',
    },
    {
      icon: Clock,
      title: '48-Hour Acknowledgment',
      description: 'Follow the available case stages: Submitted, Under Review, In Progress, and Resolved.',
      note: 'Case status updates',
    },
  ];
  const communityCards = [
    {
      icon: Users,
      title: 'Empathy & Peer Solidarity',
      description: 'Find understanding, advice, and peer encouragement when facing campus challenges.',
      note: 'Peer support circles',
    },
    {
      icon: MessageSquare,
      title: 'Constructive Dialogues & Town Halls',
      description: 'Bring student feedback and university response together to help improve campus life.',
      note: 'Student and admin dialogue',
    },
    {
      icon: UserCheck,
      title: 'Student Wellness & Rights Network',
      description: 'Find guidance, wellness support, and information about student concerns.',
      note: 'Support for every student',
    },
  ];
  const tags = ['#CrimsonCares', '#NormaliteVoice', '#SafeSpacesWMSU', '#MentalWellness', '#StudentSolidarity'];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f7f8fa] font-sans text-slate-800 selection:bg-rose-100 selection:text-rose-600">
      <div
        className="fixed inset-0 z-0 pointer-events-none bg-cover bg-center opacity-25 blur-[2px]"
        style={{
          backgroundImage: `url("${campusBuildingBackground}")`,
          maskImage: 'linear-gradient(to bottom, transparent 0%, transparent 30%, black 42%, black 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, transparent 30%, black 42%, black 100%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
        <header className="sticky top-4 z-40 flex items-center justify-between rounded-full border border-slate-200/80 bg-white/90 px-4 py-3.5 shadow-sm backdrop-blur-md sm:px-6">
          <a href="#top" className="flex items-center gap-3" aria-label="CampusCare home">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-600">
              <ShieldAlert className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-slate-900">CampusCare</span>
              <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">SCGTS</span>
            </span>
          </a>

          <nav className="hidden items-center gap-8 text-xs font-semibold text-slate-600 md:flex" aria-label="Main navigation">
            <button type="button" onClick={() => scrollToSection('about')} className="transition-colors hover:text-rose-600">About Us</button>
            <button type="button" onClick={() => scrollToSection('community')} className="transition-colors hover:text-rose-600">Community</button>
            <button type="button" onClick={() => scrollToSection('contact')} className="transition-colors hover:text-rose-600">Contact</button>
          </nav>

          <button type="button" onClick={onLogin} className="rounded-full bg-slate-900 px-5 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-slate-800">
            Log In
          </button>
        </header>

        <main id="top">
          <section className="mx-auto max-w-3xl pb-16 pt-20 text-center">
            <div className="mb-8 inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3.5 py-1.5 text-xs text-slate-600 shadow-sm">
              <span className="h-2 w-2 animate-pulse rounded-full bg-rose-500" />
              <span className="font-medium text-slate-700">Student Complaint and Grievance Tracking System</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500">WMSU Institutional Portal</span>
            </div>
            <h1 className="mb-6 text-4xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl">
              Your voice, our commitment.
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-base leading-relaxed text-slate-600">
              A simple and secure platform for students to submit and track their complaints and concerns. Every voice matters, and every concern deserves action.
            </p>
            <div className="mb-10 flex flex-wrap items-center justify-center gap-4">
              <button type="button" onClick={onLogin} className="flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white shadow-md transition-all hover:bg-slate-800 hover:shadow-lg">
                Submit a Concern <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <button type="button" onClick={() => scrollToSection('about')} className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50">
                About Us
              </button>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs font-medium text-slate-600">
              <span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-rose-500" /> Guaranteed Protection | Official Complaint</span>
              <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-rose-500" /> 48-Hour Acknowledgment SLA</span>
              <span className="flex items-center gap-1.5"><UserCheck className="h-3.5 w-3.5 text-rose-500" /> Campus Ombudsman Certified</span>
            </div>
          </section>

          <section className="mb-24 grid grid-cols-1 gap-6 md:grid-cols-3" aria-label="CampusCare features">
            {featureCards.map(({ icon: Icon, title, description }) => (
              <article key={title} className="rounded-2xl border border-slate-100 bg-white/85 p-6 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md">
                <span className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700"><Icon className="h-4 w-4" aria-hidden="true" /></span>
                <h2 className="mb-2 text-sm font-bold text-slate-900">{title}</h2>
                <p className="text-xs leading-relaxed text-slate-500">{description}</p>
              </article>
            ))}
          </section>

          <section id="about" className="scroll-mt-24 py-16">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600">
                <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" /> Institutional Trust &amp; Mission
              </span>
              <h2 className="mb-4 text-2xl font-bold text-slate-900 sm:text-3xl">About WMSU CampusCare</h2>
              <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">
                Western Mindanao State University&apos;s official Student Complaint and Grievance Tracking System (SCGTS) — ensuring every Normalite has an impartial, safe, and transparent voice.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {aboutCards.map(({ icon: Icon, title, description, note }) => (
                <article key={title} className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white/90 p-6 shadow-sm">
                  <div>
                    <span className="mb-4 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700"><Icon className="h-4 w-4" aria-hidden="true" /></span>
                    <h3 className="mb-2 text-sm font-bold text-slate-900">{title}</h3>
                    <p className="mb-6 text-xs leading-relaxed text-slate-500">{description}</p>
                  </div>
                  <div className="flex items-center gap-1.5 border-t border-slate-100 pt-3 text-[11px] font-semibold text-slate-500">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> {note}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="my-16 flex flex-col items-center justify-between gap-6 rounded-3xl border border-slate-200/80 bg-white/90 p-8 shadow-sm sm:p-10 md:flex-row">
            <div>
              <span className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-rose-600">
                <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" /> Student Rights &amp; Due Process
              </span>
              <h2 className="mb-1 text-xl font-bold text-slate-900">Ready to file or track a university inquiry?</h2>
              <p className="max-w-xl text-xs text-slate-500">Sign in to submit a concern or view the status of a case you have already filed.</p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-3">
              <button type="button" onClick={onLogin} className="rounded-full bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-slate-800">Submit a Concern</button>
              <button type="button" onClick={onLogin} className="rounded-full bg-slate-100 px-5 py-2.5 text-xs font-semibold text-slate-800 transition-colors hover:bg-slate-200">Student Log In</button>
            </div>
          </section>

          <section id="community" className="scroll-mt-24 py-16">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600">
                <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" aria-hidden="true" /> Normalite Solidarity &amp; Care
              </span>
              <h2 className="mb-4 text-2xl font-bold text-slate-900 sm:text-3xl">A vibrant, caring community where every Normalite is heard.</h2>
              <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">
                CampusCare connects students, peer advocates, and counselors to help build a safe, empathetic, and uplifting Western Mindanao State University.
              </p>
            </div>
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
              {communityCards.map(({ icon: Icon, title, description, note }) => (
                <article key={title} className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white/90 p-6 shadow-sm">
                  <div>
                    <span className="mb-4 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700"><Icon className="h-4 w-4" aria-hidden="true" /></span>
                    <h3 className="mb-2 text-sm font-bold text-slate-900">{title}</h3>
                    <p className="mb-6 text-xs leading-relaxed text-slate-500">{description}</p>
                  </div>
                  <div className="flex items-center gap-1.5 border-t border-slate-100 pt-3 text-[11px] font-semibold text-slate-500">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> {note}
                  </div>
                </article>
              ))}
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 text-center shadow-sm">
              <span className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold text-rose-600"><Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> CRIMSON COMPASSION</span>
              <p className="mb-4 text-xs font-semibold text-slate-800">You are never alone on your journey at WMSU. Together, we foster empathy, respect, and mutual care.</p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {tags.map((tag) => <span key={tag} className="rounded-full border border-slate-200/60 bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-600">{tag}</span>)}
              </div>
            </div>
          </section>

          <section id="contact" className="scroll-mt-24 py-16">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600">
                <Mail className="h-3.5 w-3.5" aria-hidden="true" /> Get In Touch
              </span>
              <h2 className="mb-3 text-2xl font-bold text-slate-900 sm:text-3xl">Contact Support &amp; Helpdesk</h2>
              <p className="text-xs text-slate-600 sm:text-sm">Have questions regarding system guidelines, ticket statuses, or general campus support? Send us a message directly.</p>
            </div>
            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
              <aside className="space-y-6 rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm">
                <h3 className="border-b border-slate-100 pb-3 text-sm font-bold text-slate-900">Office of Student Affairs (OSAS)</h3>
                <div className="flex items-start gap-3 text-xs">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" aria-hidden="true" />
                  <div><p className="font-semibold text-slate-800">Location</p><p className="text-slate-500">Normal Road, Baliwasan, Zamboanga City, 7000 Philippines</p></div>
                </div>
                <div className="flex items-start gap-3 text-xs">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" aria-hidden="true" />
                  <div><p className="font-semibold text-slate-800">Email Inquiries</p><p className="text-slate-500">osas@wmsu.edu.ph / campuscare@wmsu.edu.ph</p></div>
                </div>
                <div className="flex items-start gap-3 text-xs">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" aria-hidden="true" />
                  <div><p className="font-semibold text-slate-800">Hotline</p><p className="text-slate-500">(062) 991-1771 loc. 104</p></div>
                </div>
                <p className="rounded-xl border border-rose-100 bg-rose-50/60 p-3 text-[11px] leading-relaxed text-rose-700">
                  <strong>Emergency Notice:</strong> For immediate personal safety or urgent crisis response, contact campus security or the nearest guidance center immediately.
                </p>
              </aside>

              <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm lg:col-span-2">
                {contactStatus && <p role="status" className="mb-4 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800">{contactStatus}</p>}
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="block text-xs font-semibold text-slate-700">Your Name
                      <input name="name" type="text" required placeholder="Juan Dela Cruz" className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-normal focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20" />
                    </label>
                    <label className="block text-xs font-semibold text-slate-700">Email Address
                      <input name="email" type="email" required placeholder="student@wmsu.edu.ph" className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-normal focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20" />
                    </label>
                  </div>
                  <label className="block text-xs font-semibold text-slate-700">Subject
                    <input name="subject" type="text" required placeholder="Inquiry regarding ticket tracking process" className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-normal focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20" />
                  </label>
                  <label className="block text-xs font-semibold text-slate-700">Message
                    <textarea name="message" rows={4} required placeholder="Write your message here..." className="mt-1 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-normal focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20" />
                  </label>
                  <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-slate-800 sm:w-auto">
                    <Send className="h-3.5 w-3.5" aria-hidden="true" /> Send Message
                  </button>
                </form>
              </div>
            </div>
          </section>
        </main>

        <footer className="mt-20 border-t border-slate-200/80 py-8 text-center text-xs text-slate-500">
          <p>Western Mindanao State University SCGTS — © {new Date().getFullYear()} CampusCare. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  const [identifier, setIdentifier] = useState('');
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

  useEffect(() => {
    const refreshGrievances = () => {
      try {
        setSavedGrievanceState({ grievances: getGrievances(), error: '' });
      } catch (error) {
        setSavedGrievanceState({
          grievances: [],
          error: error instanceof Error ? error.message : 'Unable to refresh saved grievances.',
        });
      }
    };

    window.addEventListener('campuscare:grievances-updated', refreshGrievances);
    window.addEventListener('storage', refreshGrievances);
    return () => {
      window.removeEventListener('campuscare:grievances-updated', refreshGrievances);
      window.removeEventListener('storage', refreshGrievances);
    };
  }, []);

  const handleGoToRegister = () => {
    setCurrentView('register');
    window.location.hash = '#register';
  };

  const handleGoToLogin = () => {
    setCurrentView('login');
    window.location.hash = '#login';
  };

  const handleLandingLogin = () => {
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
      const input = identifier.trim();
      const lower = input.toLowerCase();

      // Admin verification (e.g. admin@wmsu.edu.ph or admin handle)
      const isAdmin = lower === 'admin@wmsu.edu.ph' || lower.startsWith('admin') || lower.includes('admin');

      if (isAdmin) {
        setDashboardUser({
          universityEmail: input.includes('@') ? input : `${input}@wmsu.edu.ph`,
          fullName: 'Administrator',
          role: 'admin',
          department: 'Student Grievance & Redressal Office',
        });
        setCurrentView('admin');
        window.location.hash = '#admin';
        return;
      }

      // Unified Student Login (by Student ID or Email)
      let resolvedId = '2025-03461';
      let resolvedName = 'Maya Vance';
      let resolvedEmail = 'maya.vance@wmsu.edu.ph';
      let resolvedCollege = 'College of Computing Studies';

      if (KNOWN_STUDENTS[input]) {
        resolvedId = input;
        resolvedName = KNOWN_STUDENTS[input].name;
        resolvedEmail = KNOWN_STUDENTS[input].email;
        resolvedCollege = KNOWN_STUDENTS[input].college;
      } else if (/^\d{4}-?\d{4,5}$/.test(input)) {
        // Formatted student ID input like 2025-03461 or 202503461
        resolvedId = input.includes('-') ? input : `${input.slice(0, 4)}-${input.slice(4)}`;
        resolvedEmail = `${input.replace('-', '')}@wmsu.edu.ph`;
        resolvedName = 'Maya Vance';
      } else if (input.includes('@')) {
        const prefix = input.split('@')[0] || '';
        const numericStudentId = prefix.replace(/^ty/i, '');
        if (/^\d{4}-?\d{4,5}$/.test(numericStudentId)) {
          resolvedId = numericStudentId.includes('-')
            ? numericStudentId
            : `${numericStudentId.slice(0, 4)}-${numericStudentId.slice(4)}`;
          const knownStudent = KNOWN_STUDENTS[resolvedId];
          if (knownStudent) {
            resolvedName = knownStudent.name;
            resolvedCollege = knownStudent.college;
          }
        }
        const clean = prefix.replace(/[._-]/g, ' ').trim().toLowerCase();
        if (!/^\d+$/.test(numericStudentId) && clean && clean !== 'student id' && clean !== 'student') {
          resolvedName = prefix
            .split(/[._-]/)
            .filter(Boolean)
            .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
            .join(' ');
        }
        resolvedEmail = input;
      } else if (input) {
        resolvedId = input;
        resolvedEmail = `${input.replace(/\s+/g, '.').toLowerCase()}@wmsu.edu.ph`;
      }

      setDashboardUser({
        universityEmail: resolvedEmail,
        fullName: resolvedName,
        studentId: resolvedId,
        college: resolvedCollege,
        role: 'student',
      });
      setCurrentView('dashboard');
      window.location.hash = '#dashboard';
    }, 1200);
  };

  if (currentView === 'admin') {
    return (
      <GrievanceQueue
        user={dashboardUser}
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
        onLogout={handleGoToLogin}
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
