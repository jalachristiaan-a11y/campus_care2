import { useState } from 'react';
import { CheckCircle2, Clock, Heart, HelpCircle, Lock, Mail, MapPin, MessageSquare, Phone, Send, ShieldAlert, Sparkles, ArrowUpRight, UserCheck, Users } from 'lucide-react';
import campusBuildingBackground from './assets/campus-building-background.png';
import campusCareLogo from './assets/campuscare-logo.png';
export default function CampusCareLanding({ onLogin }) {
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
              <img src={campusCareLogo} alt="" aria-hidden="true" className="h-full w-full object-contain" />
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

          <button type="button" onClick={onLogin} className="rounded-full bg-[#800020] px-5 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#660019]">
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
              <button type="button" onClick={onLogin} className="flex items-center gap-2 rounded-full bg-[#800020] px-6 py-3 text-sm font-medium text-white shadow-md transition-all hover:bg-[#660019] hover:shadow-lg">
                Submit a Concern <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <button type="button" onClick={() => scrollToSection('about')} className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50">
                About Us
              </button>
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
              <button type="button" onClick={onLogin} className="rounded-full bg-[#800020] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#660019]">Submit a Concern</button>
              <button type="button" onClick={onLogin} className="rounded-full bg-[#800020] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#660019]">Student Log In</button>
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
