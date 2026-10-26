# WMSU CampusCare Landing Page Component

This document provides a complete, functional React (JSX) implementation matching the design of the **WMSU CampusCare** portal landing page.

## Overview & Functionality

This single-file React component reproduces all sections of the landing page:

1. **Top Navigation & Header:**
   * **Brand & Portal Badge:** WMSU Institutional Portal.
   * **Interactive Navigation Links:** Clicking **About Us**, **Community**, or **Contact** smoothly scrolls down to their respective sections.
   * **Log In / Auth Dialog:** Triggers interactive Login modals for both Student and Staff/Admin access.

2. **Hero Section:**
   * Headline: *"Your voice, our commitment."*
   * Working action buttons: **Submit a Concern** (opens a full interactive concern intake modal) and **About Us** (scrolls down).
   * Feature highlight badges (*Guaranteed Protection*, *48-Hour Acknowledgment*, *Campus Ombudsman Certified*).

3. **Feature Cards:**
   * 3 key pillars (*Official & Transparent Process*, *Real-Time Ticket Tracking*, *Fair Institutional Process*).

4. **About Us Section (`#about`):**
   * Institutional Trust & Mission details about Western Mindanao State University's SCGTS system.
   * Informational cards: *What is CampusCare?*, *Guaranteed Protection*, and *48-Hour Turnaround SLA*.

5. **Call To Action (CTA) Banner:**
   * Dual actions: Opens either the "Submit a Concern" form or the "Student Log In" modal.

6. **Community Section (`#community`):**
   * *A vibrant, caring community where every Normalite is heard.*
   * Feature cards (*Empathy & Peer Solidarity*, *Constructive Dialogues & Town Halls*, *Student Wellness & Rights Network*).
   * Interactive hashtag tags section.

7. **Contact Us & Support Section (`#contact`):**
   * Fully functional contact message form with success confirmation feedback state.
   * Direct contact details (WMSU OSAS Office, email, phone, location).

---

## React Code (`CampusCareLanding.jsx`)

```jsx
import React, { useState } from 'react';
import {
  ShieldAlert,
  Send,
  Lock,
  Clock,
  UserCheck,
  CheckCircle2,
  Users,
  MessageSquare,
  Heart,
  HelpCircle,
  X,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

export default function CampusCareLanding() {
  // Modal States
  const [isConcernModalOpen, setIsConcernModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginRole, setLoginRole] = useState('student'); // 'student' or 'admin'

  // Form States
  const [concernSubmitted, setConcernSubmitted] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Form Data States
  const [concernData, setConcernData] = useState({
    topic: '',
    category: 'Academic Affairs',
    description: '',
    isAnonymous: false,
    email: ''
  });

  const [contactData, setContactData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  // Smooth scroll handler
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleConcernSubmit = (e) => {
    e.preventDefault();
    setConcernSubmitted(true);
    setTimeout(() => {
      setConcernSubmitted(false);
      setIsConcernModalOpen(false);
      setConcernData({ topic: '', category: 'Academic Affairs', description: '', isAnonymous: false, email: '' });
    }, 2500);
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => {
      setContactSubmitted(false);
      setContactData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-800 font-sans selection:bg-rose-100 selection:text-rose-600">
      
      {/* Dynamic Background Architectural Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.03] bg-cover bg-center z-0"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&q=80')` }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        
        {/* TOP NAVIGATION BAR */}
        <header className="flex items-center justify-between bg-white/90 backdrop-blur-md px-6 py-3.5 rounded-full shadow-sm border border-slate-200/80 sticky top-4 z-40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 font-bold">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 tracking-tight text-base">CampusCare</span>
              <span className="text-[10px] font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200">
                SCGTS
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
            <button onClick={() => scrollToSection('about')} className="hover:text-rose-600 transition-colors">
              About Us
            </button>
            <button onClick={() => scrollToSection('community')} className="hover:text-rose-600 transition-colors">
              Community
            </button>
            <button onClick={() => scrollToSection('contact')} className="hover:text-rose-600 transition-colors">
              Contact
            </button>
          </nav>

          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-5 py-2 rounded-full transition-all shadow-sm"
          >
            Log In
          </button>
        </header>

        {/* HERO SECTION */}
        <section className="pt-20 pb-16 text-center max-w-3xl mx-auto">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 bg-white/80 border border-slate-200 px-3.5 py-1.5 rounded-full text-xs text-slate-600 mb-8 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            <span className="font-medium text-slate-700">Student Complaint and Grievance Tracking System</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500">WMSU Institutional Portal</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.15] mb-6">
            Your voice, our commitment.
          </h1>

          <p className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8">
            A simple and secure platform for students to submit and track their complaints and concerns. Every voice matters, and every concern deserves action.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
            <button
              onClick={() => setIsConcernModalOpen(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm px-6 py-3 rounded-full flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
            >
              Submit a Concern <ArrowUpRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm px-6 py-3 rounded-full border border-slate-200 transition-all shadow-xs"
            >
              About Us
            </button>
          </div>

          {/* Guarantees Bar */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-rose-500" />
              <span>Guaranteed Protection | Official Complaint</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-rose-500" />
              <span>48-Hour Acknowledgment SLA</span>
            </div>
            <div className="flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-rose-500" />
              <span>Campus Ombudsman Certified</span>
            </div>
          </div>
        </section>

        {/* PILLARS / CARDS SECTION */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
          <div className="bg-white/80 backdrop-blur-xs p-6 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 mb-4">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-2">Official & Transparent Process</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              All submissions follow transparent institutional documentation and official grievance records to guarantee accountability and due process.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-xs p-6 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 mb-4">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-2">Real-Time Ticket Tracking</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Monitor investigation stages, desk review timestamps, and university resolution letters dynamically.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-xs p-6 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 mb-4">
              <UserCheck className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-2">Fair Institutional Process</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Grievances are directed straight to certified ethics counselors ensuring impartial, unbiased resolution.
            </p>
          </div>
        </section>

        {/* ABOUT US SECTION */}
        <section id="about" className="py-16 scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 px-3 py-1 rounded-full mb-3">
              <ShieldAlert className="w-3.5 h-3.5" /> Institutional Trust & Mission
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">About WMSU CampusCare</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Western Mindanao State University's official Student Complaint and Grievance Tracking System (SCGTS) — ensuring every Normalite has an impartial, safe, and transparent voice.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 mb-4">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-2">What is CampusCare?</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">
                  Overseen by the University Ombudsman. Replaces slow paper-based grievances with secure digital tracking, structured triage, and direct communication.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 border-t border-slate-100 pt-3">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Official WMSU Platform</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 mb-4">
                  <Lock className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-2">Guaranteed Protection for Official Complaints</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">
                  As WMSU's official complaint system, protection against retaliation, bias, and unfair treatment is strictly guaranteed by the university. Student rights and confidentiality are fully safeguarded under the WMSU Student Handbook and RA 10173.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 border-t border-slate-100 pt-3">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>RA 10173 Protected</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 mb-4">
                  <Clock className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-2">48–Hour Turnaround SLA</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">
                  Rapid triage, transparent milestone tracking (Submitted → Under Review → In Progress → Resolved), and formal responses from department chairs.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 border-t border-slate-100 pt-3">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Live Stage Updates</span>
              </div>
            </div>
          </div>
        </section>

        {/* MID-PAGE CALL TO ACTION */}
        <section className="my-16 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-rose-600 mb-2">
              <ShieldAlert className="w-3.5 h-3.5" /> Student Rights & Due Process
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">Ready to file or track a university inquiry?</h3>
            <p className="text-xs text-slate-500 max-w-xl">
              All submissions receive an encrypted reference ticket code. Your academic standing and privacy are strictly safeguarded at every step.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setIsConcernModalOpen(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-5 py-2.5 rounded-full transition-all shadow-sm"
            >
              Submit a Concern
            </button>
            <button
              onClick={() => {
                setLoginRole('student');
                setIsLoginModalOpen(true);
              }}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-5 py-2.5 rounded-full transition-all"
            >
              Student Log In
            </button>
          </div>
        </section>

        {/* COMMUNITY SECTION */}
        <section id="community" className="py-16 scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 px-3 py-1 rounded-full mb-3">
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" /> Normalite Solidarity & Care
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
              A vibrant, caring community where every Normalite is heard.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              CampusCare connects more than just forms—it brings students, peer advocates, and counselors together to build a safe, empathetic, and uplifting Western Mindanao State University.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 mb-4">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-2">Empathy & Peer Solidarity</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">
                  Connect with student welfare circles. No Normalite walks alone—find understanding, advice, and peer encouragement when facing campus challenges.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 border-t border-slate-100 pt-3">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Peer Support Circles</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 mb-4">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-2">Constructive Dialogues & Town Halls</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">
                  Bridge student feedback with the University Student Council (USC) and administration. Turn shared concerns into real campus enhancements.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 border-t border-slate-100 pt-3">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>USC & Admin Synergy</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 mb-4">
                  <UserCheck className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-2">Student Wellness & Rights Network</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">
                  Dedicated guidance counselors, mental wellness allies, and student rights ombudsmen offering compassionate listening and proactive support.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 border-t border-slate-100 pt-3">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Certified Counselors</span>
              </div>
            </div>
          </div>

          {/* Crimson Compassion Tag Footer Banner */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 text-center shadow-xs">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 mb-2">
              <Sparkles className="w-3.5 h-3.5" /> CRIMSON COMPASSION
            </div>
            <p className="text-xs font-semibold text-slate-800 mb-4">
              You are never alone on your journey at WMSU. Together, we foster empathy, respect, and mutual care.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {['#CrimsonCares', '#NormaliteVoice', '#SafeSpacesWMSU', '#MentalWellness', '#StudentSolidarity'].map((tag) => (
                <span key={tag} className="text-[11px] bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600 font-medium px-3 py-1 rounded-full cursor-pointer transition-colors border border-slate-200/60">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* CONTACT & SUPPORT SECTION */}
        <section id="contact" className="py-16 scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 px-3 py-1 rounded-full mb-3">
              <Mail className="w-3.5 h-3.5" /> Get In Touch
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">Contact Support & Helpdesk</h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Have questions regarding system guidelines, ticket statuses, or general campus support? Send us a message directly.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Contact Details Panel */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">Office of Student Affairs (OSAS)</h3>
              
              <div className="flex items-start gap-3 text-xs">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800">Location</p>
                  <p className="text-slate-500">Normal Road, Baliwasan, Zamboanga City, 7000 Philippines</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs">
                <Mail className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800">Email Inquiries</p>
                  <p className="text-slate-500">osas@wmsu.edu.ph / campuscare@wmsu.edu.ph</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs">
                <Phone className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800">Hotline</p>
                  <p className="text-slate-500">(062) 991-1771 loc. 104</p>
                </div>
              </div>

              <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100 text-[11px] text-rose-700 leading-relaxed">
                <strong>Emergency Notice:</strong> For immediate personal safety or urgent crisis response, please contact campus security or nearest guidance center immediately.
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
              {contactSubmitted ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-base">Message Sent Successfully!</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Thank you for reaching out to CampusCare WMSU. Our support desk will review your inquiry and respond to your email.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name</label>
                      <input
                        type="text"
                        required
                        value={contactData.name}
                        onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                        placeholder="Juan Dela Cruz"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={contactData.email}
                        onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                        placeholder="student@wmsu.edu.ph"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                    <input
                      type="text"
                      required
                      value={contactData.subject}
                      onChange={(e) => setContactData({ ...contactData, subject: e.target.value })}
                      placeholder="Inquiry regarding ticket tracking process"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Message</label>
                    <textarea
                      rows={4}
                      required
                      value={contactData.message}
                      onChange={(e) => setContactData({ ...contactData, message: e.target.value })}
                      placeholder="Write your message here..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:bg-white transition-all resize-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all w-full sm:w-auto"
                  >
                    <Send className="w-3.5 h-3.5" /> Send Message
                  </button>
                </form>
              )}
            </div>

          </div>
        </section>

        {/* FOOTER */}
        <footer className="mt-20 border-t border-slate-200/80 py-8 text-center text-xs text-slate-400">
          <p>Western Mindanao State University SCGTS — © {new Date().getFullYear()} CampusCare. All rights reserved.</p>
        </footer>

      </div>

      {/* ================= MODAL DIALOGS ================= */}

      {/* SUBMIT CONCERN MODAL */}
      {isConcernModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Submit a Concern</h3>
              </div>
              <button
                onClick={() => setIsConcernModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {concernSubmitted ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 text-base">Grievance Ticket Generated!</h4>
                <p className="text-xs text-slate-500">
                  Ticket Reference: <span className="font-mono font-bold text-slate-800">#WMSU-{Math.floor(1000 + Math.random() * 9000)}</span>
                </p>
                <p className="text-xs text-slate-400">
                  Your concern has been safely forwarded to the University Ombudsman for triage.
                </p>
              </div>
            ) : (
              <form onSubmit={handleConcernSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Topic / Title</label>
                  <input
                    type="text"
                    required
                    value={concernData.topic}
                    onChange={(e) => setConcernData({ ...concernData, topic: e.target.value })}
                    placeholder="Brief summary of issue..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={concernData.category}
                    onChange={(e) => setConcernData({ ...concernData, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  >
                    <option>Academic Affairs</option>
                    <option>Facilities & Plant</option>
                    <option>Financial Aid & TES</option>
                    <option>Student Conduct</option>
                    <option>IT Services</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Description</label>
                  <textarea
                    rows={4}
                    required
                    value={concernData.description}
                    onChange={(e) => setConcernData({ ...concernData, description: e.target.value })}
                    placeholder="Provide relevant details, dates, or department involved..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 resize-none"
                  ></textarea>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={concernData.isAnonymous}
                    onChange={(e) => setConcernData({ ...concernData, isAnonymous: e.target.checked })}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                  <label htmlFor="anonymous" className="text-xs font-medium text-slate-700 cursor-pointer">
                    Submit anonymously (Hides identity from initial review desk)
                  </label>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsConcernModalOpen(false)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-xs transition-colors"
                  >
                    Submit Formal Concern
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* LOG IN MODAL */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-6">
            
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-900 text-base">WMSU Portal Authentication</h3>
              <button onClick={() => setIsLoginModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Role Switcher */}
            <div className="flex bg-slate-100 p-1 rounded-xl mb-6 text-xs font-semibold">
              <button
                onClick={() => setLoginRole('student')}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  loginRole === 'student' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                Student Portal
              </button>
              <button
                onClick={() => setLoginRole('admin')}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  loginRole === 'admin' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                Admin / OSAS
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); alert(`Logged in successfully as ${loginRole}!`); setIsLoginModalOpen(false); }} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {loginRole === 'student' ? 'Student ID Number' : 'Employee ID'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={loginRole === 'student' ? '2023-01234' : 'EMP-9912'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2.5 rounded-xl shadow-xs transition-colors"
              >
                Sign In to Dashboard
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
```

---

## Required Dependencies

Install the necessary dependencies in your React workspace:

```bash
npm install lucide-react
```