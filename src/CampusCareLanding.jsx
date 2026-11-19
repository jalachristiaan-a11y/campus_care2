import { useEffect, useState } from 'react';
import { CheckCircle2, Clock, HelpCircle, Lock, Mail, MapPin, Menu, MessageSquare, Phone, Send, ArrowUpRight, UserCheck, Users, X } from 'lucide-react';
import campusBuildingBackground from './assets/campus-building-background.png';
import campusCareLogo from './assets/campuscare-logo.png';
import campusLawn from './assets/wmsu-campus-lawn.png';
import engineeringBuilding from './assets/wmsu-engineering-building.png';
import heritageBuilding from './assets/wmsu-heritage-building.png';
import mainCampusBuilding from './assets/wmsu-main-campus-building.png';
import registrarBuilding from './assets/wmsu-registrar-building.png';
import studentCommunity from './assets/wmsu-student-community-palaro-2025.png';

export default function CampusCareLanding({ onLogin }) {
  const [contactStatus, setContactStatus] = useState('');
  const [isScrolled, setIsScrolled] = useState(() => window.scrollY > 24);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const updateScrollState = () => setIsScrolled(window.scrollY > 24);
    window.addEventListener('scroll', updateScrollState, { passive: true });
    return () => window.removeEventListener('scroll', updateScrollState);
  }, []);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    const section = document.getElementById(id);
    if (!section) return;
    const top = Math.max(0, window.scrollY + section.getBoundingClientRect().top - 112);
    section.classList.add('is-visible');
    setIsScrolled(top > 24);
    window.scrollTo({ top, behavior });
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
      title: 'Official university process',
      description: 'Submit a concern through WMSU’s grievance process and keep a record of what you filed.',
    },
    {
      icon: Clock,
      title: 'Follow your case',
      description: 'Check its review stage and see updates or a resolution letter when they’re available.',
    },
    {
      icon: UserCheck,
      title: 'Reviewed by the right people',
      description: 'Concerns are directed to the appropriate university reviewers for consideration.',
    },
  ];
  const aboutCards = [
    {
      icon: HelpCircle,
      title: 'What is CampusCare?',
      description: 'Overseen by the University Ombudsman, CampusCare lets students submit grievances online and follow their progress.',
      note: 'Official WMSU Platform',
    },
    {
      icon: Lock,
      title: 'Protection for Official Complaints',
      description: 'Complaints are handled under the WMSU Student Handbook and the Data Privacy Act of 2012 (RA 10173).',
      note: 'RA 10173 protected',
    },
    {
      icon: Clock,
      title: '48-Hour Acknowledgment',
      description: 'Check whether your case is submitted, under review, in progress, or resolved.',
      note: 'Case status updates',
    },
  ];
  const communityCards = [
    {
      icon: Users,
      title: 'Peer support',
      description: 'Find advice and encouragement from other students when campus life gets difficult.',
      note: 'Peer support circles',
    },
    {
      icon: MessageSquare,
      title: 'Student feedback',
      description: 'Share what students are experiencing and hear the university’s response at town halls.',
      note: 'Student and admin dialogue',
    },
    {
      icon: UserCheck,
      title: 'Wellness and rights',
      description: 'Find guidance, wellness support, and information about student concerns.',
      note: 'Support for every student',
    },
  ];
  const campusPhotos = [
    { src: mainCampusBuilding, alt: 'A main campus building at Western Mindanao State University', caption: 'A campus built around possibility', layout: 'campus-photo--feature' },
    { src: studentCommunity, alt: 'WMSU Gender Association students gathered at Palaro 2025', caption: 'Student voices shape a stronger community', layout: 'campus-photo--community' },
    { src: engineeringBuilding, alt: 'The WMSU College of Engineering building', caption: 'College of Engineering', layout: 'campus-photo--detail' },
    { src: registrarBuilding, alt: 'The University Registrar Building at WMSU', caption: 'University Registrar', layout: 'campus-photo--detail' },
    { src: heritageBuilding, alt: 'A heritage-style academic building surrounded by trees on campus', caption: 'A familiar campus landmark', layout: 'campus-photo--wide' },
    { src: campusLawn, alt: 'The WMSU campus lawn and academic building', caption: 'Space to grow, learn, and belong', layout: 'campus-photo--wide' },
  ];

  return (
    <div className="relative min-h-screen overflow-clip bg-[#f7f8fa] font-sans text-slate-800 selection:bg-rose-100 selection:text-rose-600">
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
        <header className={`landing-header sticky top-4 z-40 flex items-center justify-between rounded-full border border-slate-200/80 bg-white/85 px-4 py-3.5 shadow-sm backdrop-blur-md sm:px-6${isScrolled ? ' is-scrolled' : ''}`}>
          <a href="#top" className="flex items-center gap-3" aria-label="CampusCare home">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-600">
              <img src={campusCareLogo} alt="" aria-hidden="true" className="h-full w-full object-contain" />
            </span>
            <span className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-slate-900">CampusCare</span>
              <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">SCGTS</span>
            </span>
          </a>

          <nav id="landing-nav-menu" className={`landing-nav-links${mobileMenuOpen ? ' is-open' : ''}`} aria-label="Main navigation">
            <button type="button" onClick={() => scrollToSection('about')} className="landing-nav-link">About Us</button>
            <button type="button" onClick={() => scrollToSection('community')} className="landing-nav-link">Community</button>
            <button type="button" onClick={() => scrollToSection('contact')} className="landing-nav-link">Contact</button>
          </nav>

          <button
            type="button"
            className="landing-menu-toggle"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="landing-nav-menu"
            onClick={() => setMobileMenuOpen((isOpen) => !isOpen)}
          >
            {mobileMenuOpen ? <X size={19} aria-hidden="true" /> : <Menu size={19} aria-hidden="true" />}
          </button>

          <button type="button" onClick={() => { setMobileMenuOpen(false); onLogin(); }} className="rounded-full bg-[#800020] px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#660019]">
            Log In
          </button>
        </header>

        <main id="top">
          <section className="mx-auto max-w-3xl pb-16 pt-20 text-center" data-scroll-reveal>
            <h1 className="mb-6 text-[2.5rem] font-black leading-tight tracking-tight text-slate-900 sm:text-6xl [text-wrap:balance]">
              Speak up about what matters on campus.
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-slate-600 [text-wrap:pretty]">
              CampusCare gives WMSU students one place to submit a concern and follow its progress.
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
            {featureCards.map(({ icon: Icon, title, description }, index) => (
              <article key={title} data-scroll-reveal data-interactive-card style={{ '--reveal-delay': `${index * 70}ms` }} className="rounded-2xl border border-slate-100 bg-white/85 p-6 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md">
                <span className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700"><Icon className="h-4 w-4" aria-hidden="true" /></span>
                <h2 className="mb-2 text-base font-bold text-slate-900">{title}</h2>
                <p className="text-sm leading-relaxed text-slate-600">{description}</p>
              </article>
            ))}
          </section>

          <section className="campus-photo-section mb-20" data-scroll-reveal aria-labelledby="campus-photo-title">
            <div className="campus-photo-heading">
              <h2 id="campus-photo-title">A campus worth speaking up for.</h2>
              <p>From the places we learn to the people who make WMSU feel like home, every Normalite deserves to be heard.</p>
            </div>
            <div className="campus-photo-grid">
              {campusPhotos.map(({ src, alt, caption, layout }, index) => (
                <figure
                  key={src}
                  className={`campus-photo-tile ${layout}`}
                  style={{ '--campus-photo-delay': `${Math.min(index * 65, 260)}ms` }}
                >
                  <img src={src} alt={alt} loading="lazy" decoding="async" />
                  <figcaption>{caption}</figcaption>
                </figure>
              ))}
            </div>
          </section>

          <section className="campus-video-section" data-scroll-reveal aria-labelledby="campus-video-title">
            <div className="campus-video-heading">
              <h2 id="campus-video-title">Welcome to Western Mindanao State University!</h2>
              <p>Watch the official video from WMSU Specials.</p>
            </div>
            <div className="campus-video-frame">
              <iframe
                src="https://www.youtube-nocookie.com/embed/JoimFFEafbE"
                title="Welcome to Western Mindanao State University! — WMSU Specials"
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            <a
              className="campus-video-link"
              href="https://www.youtube.com/watch?v=JoimFFEafbE"
              target="_blank"
              rel="noreferrer"
            >
              Open video on YouTube
            </a>
          </section>

          <section id="about" className="scroll-mt-24 py-16" data-scroll-reveal>
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-bold text-slate-900 sm:text-4xl [text-wrap:balance]">About WMSU CampusCare</h2>
              <p className="text-sm leading-relaxed text-slate-600 sm:text-base [text-wrap:pretty]">
                CampusCare is Western Mindanao State University&apos;s Student Complaint and Grievance Tracking System (SCGTS). Students can submit concerns and follow their progress here.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {aboutCards.map(({ icon: Icon, title, description, note }, index) => (
                <article key={title} data-scroll-reveal data-interactive-card style={{ '--reveal-delay': `${index * 70}ms` }} className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white/90 p-6 shadow-sm">
                  <div>
                    <span className="mb-4 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700"><Icon className="h-4 w-4" aria-hidden="true" /></span>
                    <h3 className="mb-2 text-base font-bold text-slate-900">{title}</h3>
                    <p className="mb-6 text-sm leading-relaxed text-slate-600">{description}</p>
                  </div>
                  <div className="flex items-center gap-1.5 border-t border-slate-100 pt-3 text-xs font-semibold text-slate-600">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> {note}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="my-16 flex flex-col items-center justify-between gap-6 rounded-3xl border border-slate-200/80 bg-white/90 p-8 shadow-sm sm:p-10 md:flex-row" data-scroll-reveal>
            <div>
              <h2 className="mb-2 text-2xl font-bold text-slate-900 [text-wrap:balance]">Have a concern to file or check on?</h2>
              <p className="max-w-xl text-sm leading-relaxed text-slate-600">Sign in to submit a concern or check the status of a case you’ve already filed.</p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-3">
              <button type="button" onClick={onLogin} className="rounded-full bg-[#800020] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#660019]">Submit a Concern</button>
              <button type="button" onClick={onLogin} className="rounded-full bg-[#800020] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#660019]">Student Log In</button>
            </div>
          </section>

          <section id="community" className="scroll-mt-24 py-16" data-scroll-reveal>
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-bold text-slate-900 sm:text-4xl [text-wrap:balance]">Support for the WMSU community</h2>
              <p className="text-sm leading-relaxed text-slate-600 sm:text-base [text-wrap:pretty]">
                Find peer support, share feedback with the university, and get information about student wellness and rights.
              </p>
            </div>
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
              {communityCards.map(({ icon: Icon, title, description, note }, index) => (
                <article key={title} data-scroll-reveal data-interactive-card style={{ '--reveal-delay': `${index * 70}ms` }} className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white/90 p-6 shadow-sm">
                  <div>
                    <span className="mb-4 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700"><Icon className="h-4 w-4" aria-hidden="true" /></span>
                    <h3 className="mb-2 text-base font-bold text-slate-900">{title}</h3>
                    <p className="mb-6 text-sm leading-relaxed text-slate-600">{description}</p>
                  </div>
                  <div className="flex items-center gap-1.5 border-t border-slate-100 pt-3 text-xs font-semibold text-slate-600">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> {note}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section id="contact" className="scroll-mt-24 py-16" data-scroll-reveal>
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="mb-3 text-3xl font-bold text-slate-900 sm:text-4xl [text-wrap:balance]">Need help with CampusCare?</h2>
              <p className="text-sm leading-relaxed text-slate-600 sm:text-base [text-wrap:pretty]">Questions about the system or a case you’ve filed? Send a message to the Office of Student Affairs.</p>
            </div>
            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
              <aside className="space-y-6 rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm">
                <h3 className="border-b border-slate-100 pb-3 text-base font-bold text-slate-900">Office of Student Affairs (OSAS)</h3>
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" aria-hidden="true" />
                  <div><p className="font-semibold text-slate-800">Location</p><p className="text-slate-500">Normal Road, Baliwasan, Zamboanga City, 7000 Philippines</p></div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" aria-hidden="true" />
                  <div><p className="font-semibold text-slate-800">Email Inquiries</p><p className="text-slate-500">osas@wmsu.edu.ph / campuscare@wmsu.edu.ph</p></div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" aria-hidden="true" />
                  <div><p className="font-semibold text-slate-800">Hotline</p><p className="text-slate-500">(062) 991-1771 loc. 104</p></div>
                </div>
                <p className="rounded-xl border border-rose-100 bg-rose-50/60 p-3 text-xs leading-relaxed text-rose-700">
                  <strong>Emergency Notice:</strong> For immediate personal safety or urgent crisis response, contact campus security or the nearest guidance center immediately.
                </p>
              </aside>

              <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm lg:col-span-2">
                {contactStatus && <p role="status" className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{contactStatus}</p>}
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="block text-sm font-semibold text-slate-700">Your Name
                      <input name="name" type="text" required placeholder="Juan Dela Cruz" className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-normal focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20" />
                    </label>
                    <label className="block text-sm font-semibold text-slate-700">Email Address
                      <input name="email" type="email" required placeholder="student@wmsu.edu.ph" className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-normal focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20" />
                    </label>
                  </div>
                  <label className="block text-sm font-semibold text-slate-700">Subject
                    <input name="subject" type="text" required placeholder="Inquiry regarding ticket tracking process" className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-normal focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20" />
                  </label>
                  <label className="block text-sm font-semibold text-slate-700">Message
                    <textarea name="message" rows={4} required placeholder="Write your message here..." className="mt-1 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-normal focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20" />
                  </label>
                  <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 sm:w-auto">
                    <Send className="h-3.5 w-3.5" aria-hidden="true" /> Send Message
                  </button>
                </form>
              </div>
            </div>
          </section>
        </main>

        <footer className="mt-20 border-t border-slate-200/80 py-8 text-center text-sm text-slate-500">
          <p>Western Mindanao State University SCGTS — © {new Date().getFullYear()} CampusCare. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
