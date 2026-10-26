import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Radio,
  Inbox,
  Building2,
  BarChart3,
  Users,
  MessageSquare,
  Settings,
  Search,
  Bell,
  Calendar,
  ChevronDown,
  Clock,
  CheckCircle2,
  File,
  FileText,
  MoreVertical,
  ShieldAlert,
  Lock,
  MessageCircle,
  UserPlus,
  Check,
  XCircle,
  LogOut,
  Sparkles,
  Send,
  TrendingUp
} from 'lucide-react';
import { getGrievances, getStudentMessages, resolveGrievance, saveStudentMessage } from './grievanceStore.js';

const initialMockCases = [
  {
    id: '#2632',
    filer: 'C. Sailela',
    studentId: '2025-00296',
    avatar: 'CS',
    avatarBg: 'bg-slate-200 text-slate-700',
    category: 'Facilities & Plant',
    sla: '22 hrs left',
    slaStatus: 'normal',
    assignedDesk: 'CPPO Facilities',
    status: 'In Progress',
    statusColor: 'text-blue-600 bg-blue-50',
    dotColor: 'bg-blue-600',
    type: 'Campus Lab'
  },
  {
    id: '#2631',
    filer: 'Anonymous Student',
    studentId: '2025-03461',
    avatar: <ShieldAlert className="w-4 h-4 text-rose-500" />,
    avatarBg: 'bg-rose-100',
    category: 'Academic Affairs',
    sla: '5 hrs left',
    slaStatus: 'urgent',
    assignedDesk: 'College of Eng.',
    status: 'Urgent Review',
    statusColor: 'text-rose-600 bg-rose-50',
    dotColor: 'bg-rose-600',
    type: 'Midterm Clearance'
  },
  {
    id: '#2630',
    filer: 'J. Dela Cruz',
    studentId: '2025-01791',
    avatar: 'JD',
    avatarBg: 'bg-blue-100 text-blue-700',
    category: 'Financial Aid',
    sla: '31 hrs left',
    slaStatus: 'normal',
    assignedDesk: 'UniFAST Unit',
    status: 'Under Review',
    statusColor: 'text-amber-600 bg-amber-50',
    dotColor: 'bg-amber-500',
    type: 'TES'
  },
  {
    id: '#2629',
    filer: 'Anonymous Student',
    studentId: '2025-02106',
    avatar: <Lock className="w-4 h-4 text-amber-600" />,
    avatarBg: 'bg-amber-100',
    category: 'Student Conduct',
    sla: '26 hrs left',
    slaStatus: 'normal',
    assignedDesk: 'Student Conduct',
    status: 'Under Review',
    statusColor: 'text-amber-600 bg-amber-50',
    dotColor: 'bg-amber-500',
    type: 'Peer Bullying'
  },
  {
    id: '#2628',
    filer: 'R. Tan',
    studentId: '2025-01218',
    avatar: 'RT',
    avatarBg: 'bg-purple-100 text-purple-700',
    category: 'IT Services',
    sla: '13 hrs left',
    slaStatus: 'normal',
    assignedDesk: 'CCICT Systems',
    status: 'In Progress',
    statusColor: 'text-blue-600 bg-blue-50',
    dotColor: 'bg-blue-600',
    type: 'Portal Token'
  },
  {
    id: '#2627',
    filer: 'M. Lim',
    studentId: '2025-02907',
    avatar: 'ML',
    avatarBg: 'bg-emerald-100 text-emerald-700',
    category: 'Advising & Records',
    sla: 'Turnaround Met',
    slaStatus: 'resolved',
    assignedDesk: 'Registrar Desk',
    status: 'Resolved',
    statusColor: 'text-emerald-600 bg-emerald-50',
    dotColor: 'bg-emerald-600',
    type: 'TOR Certification'
  }
];

const departmentList = [
  {
    name: 'CPPO Facilities & Plant',
    lead: 'Engr. R. Santos',
    email: 'facilities@wmsu.edu.ph',
    activeTickets: 7,
    resolved: 42,
    compliance: '94%',
    status: 'Online'
  },
  {
    name: 'Academic Affairs & Colleges',
    lead: 'Dr. E. Fernandez',
    email: 'academics@wmsu.edu.ph',
    activeTickets: 9,
    resolved: 88,
    compliance: '96%',
    status: 'Online'
  },
  {
    name: 'UniFAST & Student Aid Unit',
    lead: 'Prof. L. Mendoza',
    email: 'unifast@wmsu.edu.ph',
    activeTickets: 3,
    resolved: 35,
    compliance: '91%',
    status: 'Active'
  },
  {
    name: 'Student Conduct & Grievance Desk',
    lead: 'Atty. M. Alvarez',
    email: 'discipline@wmsu.edu.ph',
    activeTickets: 2,
    resolved: 19,
    compliance: '98%',
    status: 'Online'
  },
  {
    name: 'CCICT IT Systems & Support',
    lead: 'Engr. K. Reyes',
    email: 'ccict@wmsu.edu.ph',
    activeTickets: 3,
    resolved: 64,
    compliance: '99%',
    status: 'Online'
  },
  {
    name: 'University Registrar Desk',
    lead: 'Ms. G. Bautista',
    email: 'registrar@wmsu.edu.ph',
    activeTickets: 4,
    resolved: 51,
    compliance: '95%',
    status: 'Online'
  }
];

const mockFilers = [
  { name: 'Maya Vance', id: '2025-03461', email: 'maya.vance@wmsu.edu.ph', college: 'College of Computing Studies', casesCount: 2, status: 'Verified Student' },
  { name: 'Nadzmi Gapur Abah', id: '2025-02907', email: 'ty202502907@wmsu.edu.ph', college: 'College of Computing Studies', casesCount: 1, status: 'Verified Student' },
  { name: 'Rovhic Chawee Alesna Ageas', id: '2025-02697', email: 'ty202502697@wmsu.edu.ph', college: 'College of Computing Studies', casesCount: 1, status: 'Verified Student' },
  { name: 'Ainee Hana Tan Ahamad', id: '2025-01218', email: 'ty202501218@wmsu.edu.ph', college: 'College of Nursing', casesCount: 1, status: 'Verified Student' },
  { name: 'Christian Joshua Cabual', id: '2025-02106', email: 'ty202502106@wmsu.edu.ph', college: 'College of Computing Studies', casesCount: 2, status: 'Verified Student' },
  { name: 'Cassandra Ashley Sailela', id: '2025-00296', email: 'ty202500296@wmsu.edu.ph', college: 'College of Architecture', casesCount: 1, status: 'Verified Student' }
];

const normalizeStudentId = (value = '') => value.replace(/^ty/i, '').replace(/\D/g, '');
const normalizeText = (value = '') => value.trim().toLowerCase().replace(/\s+/g, ' ');

const resolveNoticeRecipient = (recipientValue) => {
  const recipient = recipientValue.trim();
  const email = recipient.match(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i)?.[0]?.toLowerCase() || '';
  const studentId = recipient.match(/\b\d{4}-?\d{4,5}\b/)?.[0] || '';
  const parenthesizedName = recipient.match(/\(([^)]+)\)/)?.[1]?.trim() || '';
  const searchName = parenthesizedName || (!email && !studentId ? recipient : '');
  const filer = mockFilers.find((item) => (
    (email && item.email.toLowerCase() === email)
    || (studentId && normalizeStudentId(item.id) === normalizeStudentId(studentId))
    || (searchName && normalizeText(item.name) === normalizeText(searchName))
  ));
  const savedGrievance = getGrievances().find((item) => (
    (email && item.submittedBy?.toLowerCase() === email)
    || (studentId && normalizeStudentId(item.studentId || '') === normalizeStudentId(studentId))
    || (searchName && normalizeText(item.submittedByName || '') === normalizeText(searchName))
  ));

  return {
    recipientEmail: email || filer?.email || savedGrievance?.submittedBy || '',
    recipientStudentId: studentId || filer?.id || savedGrievance?.studentId || '',
    recipientName: parenthesizedName || filer?.name || savedGrievance?.submittedByName || searchName,
  };
};

export default function GrievanceQueue({ onLogout }) {
  const [activeNav, setActiveNav] = useState('Grievance Queue');
  const [activeTab, setActiveTab] = useState('All Cases');
  const [analyticsRange, setAnalyticsRange] = useState('Last 28 days');
  const [analyticsGranularity, setAnalyticsGranularity] = useState('Daily');
  const [openMenuId, setOpenMenuId] = useState('#2631');
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationMsg, setNotificationMsg] = useState(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState(() => new Set());
  const notificationPanelRef = useRef(null);

  // Settings State
  const [intakeOpen, setIntakeOpen] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [slaHours, setSlaHours] = useState('48');
  const [urgentSlaHours, setUrgentSlaHours] = useState('12');

  // Direct Notices State
  const [notices, setNotices] = useState(() => getStudentMessages().map((message) => ({
    ...message,
    date: new Date(message.sentAt).toLocaleString(),
    status: 'Delivered',
  })));
  const [noticeForm, setNoticeForm] = useState({
    recipient: '',
    subject: '',
    type: 'Official Notice',
    message: ''
  });

  // Load cases combining stored grievances + mock data
  const [cases, setCases] = useState(() => {
    try {
      const stored = getGrievances();
      if (Array.isArray(stored) && stored.length > 0) {
        const mappedStored = stored.map((item, idx) => ({
          id: item.id?.startsWith('#') ? item.id : `#${item.id?.replace(/^CMP-\d+-/, '') || 3000 + idx}`,
          grievanceId: item.id,
          recipientEmail: item.submittedBy || '',
          filer: item.submittedByName || (item.submittedBy ? item.submittedBy.split('@')[0].replace(/[._-]/g, ' ') : 'Student Filer'),
          studentId: item.studentId || '',
          avatar: (item.submittedBy || 'SF').slice(0, 2).toUpperCase(),
          avatarBg: 'bg-rose-100 text-[#800020]',
          category: item.category || 'General Concern',
          sla: item.statusClass === 'closed' ? 'Turnaround Met' : '48 hrs left',
          slaStatus: item.statusClass === 'closed' ? 'resolved' : 'normal',
          assignedDesk: item.department || 'Intake Desk',
          status: item.status || 'Under Review',
          statusColor: item.statusClass === 'closed'
            ? 'text-emerald-600 bg-emerald-50'
            : item.statusClass === 'progress'
            ? 'text-blue-600 bg-blue-50'
            : 'text-amber-600 bg-amber-50',
          dotColor: item.statusClass === 'closed'
            ? 'bg-emerald-600'
            : item.statusClass === 'progress'
            ? 'bg-blue-600'
            : 'bg-amber-500',
          type: item.title || 'Student Concern'
        }));
        return [...mappedStored, ...initialMockCases];
      }
    } catch {
      // Fallback
    }
    return initialMockCases;
  });

  const showNotification = (msg) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  const adminNotifications = useMemo(
    () => cases
      .filter((caseItem) => caseItem.status !== 'Resolved')
      .slice(0, 5)
      .map((caseItem) => ({
        id: caseItem.id,
        caseId: caseItem.id,
        title: caseItem.slaStatus === 'urgent' ? 'Urgent grievance needs review' : 'Grievance awaiting review',
        details: `${caseItem.id} · ${caseItem.category}`,
        status: caseItem.status,
        urgent: caseItem.slaStatus === 'urgent',
      })),
    [cases],
  );
  const unreadNotificationCount = adminNotifications.filter(
    (item) => !readNotificationIds.has(item.id),
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

  const openNotificationCase = (notification) => {
    setReadNotificationIds((previousIds) => new Set(previousIds).add(notification.id));
    setSearchQuery(notification.caseId);
    setActiveNav('Grievance Queue');
    setNotificationsOpen(false);
  };

  const navItems = [
    { label: 'Live Grievances', icon: Radio },
    { label: 'Grievance Queue', icon: Inbox },
    { label: 'Departments', icon: Building2 },
    { label: 'Web Analytics', icon: BarChart3 },
    { label: 'Student Filers', icon: Users },
    { label: 'Direct Notices', icon: MessageSquare },
    { label: 'Settings', icon: Settings }
  ];

  const handleResolveCase = (caseId) => {
    const caseItem = cases.find((item) => item.id === caseId);
    if (!caseItem || caseItem.status === 'Resolved') {
      setOpenMenuId(null);
      return;
    }

    if (caseItem.grievanceId) {
      try {
        const resolvedGrievance = resolveGrievance(caseItem.grievanceId);
        if (!resolvedGrievance) {
          showNotification(`Unable to resolve ${caseId}: the saved grievance could not be found.`);
          setOpenMenuId(null);
          return;
        }
      } catch (error) {
        showNotification(`Unable to resolve ${caseId}: ${error instanceof Error ? error.message : 'Please try again.'}`);
        setOpenMenuId(null);
        return;
      }
    }

    setCases((prev) => prev.map((item) => (
      item.id === caseId
        ? {
            ...item,
            status: 'Resolved',
            statusColor: 'text-emerald-600 bg-emerald-50',
            dotColor: 'bg-emerald-600',
            sla: 'Turnaround Met',
            slaStatus: 'resolved'
          }
        : item
    )));
    setOpenMenuId(null);
    showNotification(`Case ${caseId} marked as Resolved.`);
  };

  const handleReassignCase = (caseId) => {
    const departments = ['College of Eng.', 'CPPO Facilities', 'UniFAST Unit', 'Student Conduct', 'CCICT Systems', 'Registrar Desk'];
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          const nextDept = departments[(departments.indexOf(c.assignedDesk) + 1) % departments.length];
          return { ...c, assignedDesk: nextDept };
        }
        return c;
      })
    );
    setOpenMenuId(null);
    showNotification(`Case ${caseId} reassigned.`);
  };

  const handleMessageFiler = (caseItem) => {
    setOpenMenuId(null);
    setNoticeForm((prev) => ({
      ...prev,
      recipient: caseItem.studentId
        ? `${caseItem.studentId} (${caseItem.filer})`
        : caseItem.recipientEmail || caseItem.filer,
      subject: `Regarding your grievance ${caseItem.id} [${caseItem.type}]`
    }));
    setActiveNav('Direct Notices');
    showNotification(`Opened official notice composer for ${caseItem.filer}.`);
  };

  const handleSendNotice = (e) => {
    e.preventDefault();
    if (!noticeForm.recipient.trim() || !noticeForm.message.trim()) {
      showNotification('Please provide a recipient and notice message body.');
      return;
    }

    try {
      const recipient = resolveNoticeRecipient(noticeForm.recipient);
      const sentAt = new Date().toISOString();
      const savedMessage = saveStudentMessage({
        ...recipient,
        recipient: noticeForm.recipient.trim(),
        subject: noticeForm.subject.trim() || 'Official Portal Notice',
        message: noticeForm.message.trim(),
        type: noticeForm.type,
        sentAt,
      });
      setNotices((previousNotices) => [{
        ...savedMessage,
        date: new Date(savedMessage.sentAt).toLocaleString(),
        status: 'Delivered',
      }, ...previousNotices]);
    } catch (error) {
      showNotification(`Unable to send notice: ${error instanceof Error ? error.message : 'Please try again.'}`);
      return;
    }
    setNoticeForm({ recipient: '', subject: '', type: 'Official Notice', message: '' });
    showNotification('Official notice sent and added to the student notification inbox.');
  };

  // Filtered cases for Queue
  const filteredCases = useMemo(() => {
    return cases.filter((item) => {
      const matchesSearch =
        !searchQuery ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.filer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.assignedDesk.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (activeTab === 'Under Review') return item.status === 'Under Review';
      if (activeTab === 'In Progress') return item.status === 'In Progress';
      if (activeTab === 'Urgent Escalations') return item.slaStatus === 'urgent' || item.status === 'Urgent Review';
      if (activeTab === 'Resolved') return item.status === 'Resolved';
      return true;
    });
  }, [cases, searchQuery, activeTab]);

  const tabs = [
    { label: 'All Cases', count: cases.length },
    { label: 'Under Review', count: cases.filter((c) => c.status === 'Under Review').length },
    { label: 'In Progress', count: cases.filter((c) => c.status === 'In Progress').length },
    { label: 'Urgent Escalations', count: cases.filter((c) => c.slaStatus === 'urgent' || c.status === 'Urgent Review').length },
    { label: 'Resolved', count: cases.filter((c) => c.status === 'Resolved').length }
  ];

  const analyticsTrend = {
    Daily: [88, 98, 83, 105, 129, 88, 104, 113, 136, 119, 108, 80, 99, 112, 126, 91, 73, 86, 72, 93, 124],
    Weekly: [65, 79, 72, 93, 101, 88, 111, 105, 118, 109, 132, 125],
    Monthly: [42, 54, 61, 58, 76, 69, 83, 91, 85, 102, 114, 128]
  }[analyticsGranularity];
  const trendPoints = analyticsTrend.map((value, index) => {
    const x = 46 + (index / (analyticsTrend.length - 1)) * 534;
    const y = 178 - (value / 200) * 150;
    return { x, y };
  });
  const trendLine = trendPoints.map(({ x, y }) => `${x},${y}`).join(' ');
  const trendArea = `46,178 ${trendLine} 580,178`;
  const trendLabels = analyticsGranularity === 'Daily'
    ? ['Oct 1', 'Oct 7', 'Oct 14', 'Oct 21', 'Oct 28']
    : analyticsGranularity === 'Weekly'
      ? ['Week 1', 'Week 3', 'Week 6', 'Week 9', 'Week 12']
      : ['Jan', 'Mar', 'Jun', 'Sep', 'Dec'];

  return (
    <div className="flex h-screen bg-slate-100 text-slate-700 font-sans p-2 sm:p-4">
      {/* Container Card */}
      <div className="flex flex-1 bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        
        {/* Sidebar */}
        <aside className="w-64 border-r border-slate-100 p-5 flex flex-col justify-between hidden md:flex shrink-0">
          <div>
            {/* Logo */}
            <div className="flex items-center gap-3 mb-7">
              <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-[#800020] font-bold shadow-xs">
                <ShieldAlert className="w-5 h-5 text-[#800020]" />
              </div>
              <div>
                <h1 className="font-bold text-slate-800 text-sm tracking-tight leading-tight">CampusCare</h1>
                <p className="text-[10px] font-bold text-[#800020] tracking-wider uppercase">ADMIN PORTAL</p>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeNav === item.label;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setActiveNav(item.label)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-rose-50 text-[#800020] shadow-xs'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#800020]' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer Logout */}
          <div className="pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-rose-50 hover:text-[#800020] transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          
          {/* Top Bar Header */}
          <header className="px-5 sm:px-8 py-3.5 sm:py-4 flex items-center justify-between border-b border-slate-100 bg-white sticky top-0 z-20">
            {/* Search Input */}
            <div className="relative w-56 sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ticket #, filer, desk..."
                className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200/80 rounded-full pl-9 pr-3.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#800020]/20 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Header Right Controls (Clean, OSAS Removed) */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="hidden sm:flex items-center gap-2 text-[11px] font-semibold text-slate-600 bg-slate-50 px-3 py-1 rounded-full border border-slate-200/60">
                <span>{intakeOpen ? 'Intake Open' : 'Intake Paused'}</span>
                <span className={`w-2 h-2 rounded-full ${intakeOpen ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
              </div>

              <div className="relative" ref={notificationPanelRef}>
                <button
                  type="button"
                  className="relative rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600 cursor-pointer"
                  aria-label={`Notifications${unreadNotificationCount ? `, ${unreadNotificationCount} unread` : ''}`}
                  aria-haspopup="dialog"
                  aria-expanded={notificationsOpen}
                  aria-controls="admin-notification-panel"
                  onClick={() => setNotificationsOpen((isOpen) => !isOpen)}
                >
                  <Bell className="h-4 w-4" />
                  {unreadNotificationCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#800020] px-1 text-[9px] font-bold text-white">
                      {unreadNotificationCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <section
                    id="admin-notification-panel"
                    role="dialog"
                    aria-label="Admin notifications"
                    className="absolute right-0 top-full z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                      <div>
                        <h2 className="text-sm font-bold text-slate-800">Notifications</h2>
                        <p className="text-[10px] text-slate-500">
                          {unreadNotificationCount ? `${unreadNotificationCount} unread` : 'All caught up'}
                        </p>
                      </div>
                      {unreadNotificationCount > 0 && (
                        <button
                          type="button"
                          onClick={() => setReadNotificationIds(new Set(adminNotifications.map((item) => item.id)))}
                          className="text-[10px] font-semibold text-[#800020] hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    {adminNotifications.length ? (
                      <ul className="max-h-80 overflow-y-auto">
                        {adminNotifications.map((item) => {
                          const isUnread = !readNotificationIds.has(item.id);
                          return (
                            <li key={item.id}>
                              <button
                                type="button"
                                onClick={() => openNotificationCase(item)}
                                className={`flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-slate-50 ${
                                  isUnread ? 'bg-rose-50/40' : 'bg-white'
                                }`}
                              >
                                <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${item.urgent ? 'bg-rose-500' : isUnread ? 'bg-[#800020]' : 'bg-slate-300'}`} />
                                <span className="min-w-0 flex-1">
                                  <span className="flex items-center justify-between gap-2">
                                    <span className="text-xs font-semibold text-slate-800">{item.title}</span>
                                    {isUnread && <span className="shrink-0 text-[9px] font-semibold text-[#800020]">NEW</span>}
                                  </span>
                                  <span className="mt-0.5 block truncate text-[10px] text-slate-500">{item.details}</span>
                                  <span className="mt-1 block text-[10px] text-slate-400">{item.status} · Open queue</span>
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="px-4 py-8 text-center text-xs text-slate-500">No open grievance notifications.</p>
                    )}
                  </section>
                )}
              </div>

              {/* Direct Clean Sign Out Button */}
              <button
                type="button"
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-[#800020] bg-slate-50 hover:bg-rose-50 border border-slate-200/80 rounded-xl transition-all cursor-pointer"
                title="Sign out of Admin Portal"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-400" />
                <span>Sign out</span>
              </button>
            </div>
          </header>

          {/* Mobile Navigation Tabs (when sidebar hidden) */}
          <div className="flex md:hidden items-center gap-2 overflow-x-auto p-3 border-b border-slate-100 bg-slate-50">
            {navItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => setActiveNav(item.label)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer ${
                  activeNav === item.label
                    ? 'bg-[#800020] text-white font-semibold'
                    : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Toast Notification Banner */}
          {notificationMsg && (
            <div className="mx-6 sm:mx-8 mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2 shadow-xs animate-in fade-in duration-200">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{notificationMsg}</span>
            </div>
          )}

          {/* ACTIVE CONTENT VIEW SWITCHER */}
          <div className="p-6 sm:p-8 flex-1">
            
            {/* 1. GRIEVANCE QUEUE */}
            {activeNav === 'Grievance Queue' && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">Grievance Queue</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Manage, review, and dispatch incoming student grievance cases.</p>
                  </div>

                  <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-600 bg-white shadow-2xs self-start sm:self-auto">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>AY 2025-2026</span>
                    <span className="text-slate-400 uppercase text-[9px] font-bold">TERM 1</span>
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-4 sm:gap-6 border-b border-slate-200 mb-6 overflow-x-auto pb-px">
                  {tabs.map((tab) => {
                    const isActive = activeTab === tab.label;
                    return (
                      <button
                        key={tab.label}
                        type="button"
                        onClick={() => setActiveTab(tab.label)}
                        className={`pb-3 text-xs sm:text-sm font-medium transition-all relative whitespace-nowrap cursor-pointer ${
                          isActive ? 'text-[#800020] font-bold' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <span>{tab.label}</span> {typeof tab.count === 'number' && (
                          <span className={`text-xs ml-1 px-1.5 py-0.5 rounded-full ${isActive ? 'bg-rose-100 text-[#800020]' : 'bg-slate-100 text-slate-500'}`}>
                            {tab.count}
                          </span>
                        )}
                        {isActive && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#800020] rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Queue Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-separate border-spacing-y-1.5 min-w-[760px]">
                    <thead>
                      <tr className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                        <th className="py-2.5 px-3">Id ▼</th>
                        <th className="py-2.5 px-3">Filer Info</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3">SLA Time Remaining ▼</th>
                        <th className="py-2.5 px-3">Assigned Desk</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCases.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="py-12 text-center text-slate-400 bg-slate-50/50 rounded-xl">
                            No cases found matching the criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredCases.map((item) => (
                          <tr
                            key={item.id}
                            className={`hover:bg-slate-50/90 transition-colors rounded-xl relative border border-slate-100 ${
                              item.slaStatus === 'urgent' ? 'bg-rose-50/30' : 'bg-white'
                            }`}
                          >
                            <td className="py-3 px-3 font-bold text-slate-800 font-mono text-xs">{item.id}</td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2.5">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${item.avatarBg}`}>
                                  {item.avatar}
                                </div>
                                <div>
                                  <span className="font-semibold text-slate-700 block leading-tight">{item.filer}</span>
                                  <span className="text-[10px] text-slate-400">{item.studentId}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-slate-500 font-medium">{item.category}</td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-1.5 font-medium">
                                {item.slaStatus === 'resolved' ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                ) : (
                                  <Clock className={`w-4 h-4 shrink-0 ${item.slaStatus === 'urgent' ? 'text-rose-500' : 'text-slate-400'}`} />
                                )}
                                <span className={
                                  item.slaStatus === 'urgent' ? 'text-rose-600 font-bold' : item.slaStatus === 'resolved' ? 'text-emerald-600 font-semibold' : 'text-slate-600'
                                }>
                                  {item.sla}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <span className={`font-semibold ${item.slaStatus === 'urgent' ? 'text-slate-700' : 'text-[#800020]'}`}>
                                {item.assignedDesk}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <div className="inline-flex items-center gap-1.5 font-semibold px-2.5 py-1 rounded-full text-[11px] bg-slate-50 border border-slate-100">
                                <span className={`w-1.5 h-1.5 rounded-full ${item.dotColor}`}></span>
                                <span className={item.statusColor.split(' ')[0]}>{item.status}</span>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-slate-500">{item.type}</td>
                            <td className="py-3 px-3 text-right relative">
                              <button
                                type="button"
                                onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                                aria-label="Actions"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>

                              {openMenuId === item.id && (
                                <div className="absolute right-3 top-10 w-36 bg-white rounded-2xl shadow-xl border border-slate-100 p-1.5 z-30 text-left space-y-1 animate-in fade-in zoom-in-95 duration-100">
                                  <button
                                    type="button"
                                    onClick={() => handleMessageFiler(item)}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#800020] hover:bg-rose-50 rounded-lg font-medium transition-colors cursor-pointer"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                    <span>Message</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleReassignCase(item.id)}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 rounded-lg font-medium transition-colors cursor-pointer"
                                  >
                                    <UserPlus className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Reassign</span>
                                  </button>
                                  {item.status !== 'Resolved' && (
                                    <button
                                      type="button"
                                      onClick={() => handleResolveCase(item.id)}
                                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-emerald-600 hover:bg-emerald-50 rounded-lg font-medium transition-colors cursor-pointer"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      <span>Resolve</span>
                                    </button>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 2. LIVE GRIEVANCES */}
            {activeNav === 'Live Grievances' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">Live Grievance Monitor</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Real-time telemetry and streaming grievance events.</p>
                  </div>
                  <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-semibold border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Live Telemetry Active</span>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">Incoming Today</span>
                    <p className="text-2xl font-extrabold text-slate-800 mt-1">8</p>
                    <span className="text-[10px] text-emerald-600 font-semibold">+2 from yesterday</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">Under Review</span>
                    <p className="text-2xl font-extrabold text-amber-600 mt-1">4</p>
                    <span className="text-[10px] text-slate-500">Requires triage</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">Critical (SLA &lt; 6h)</span>
                    <p className="text-2xl font-extrabold text-rose-600 mt-1">1</p>
                    <span className="text-[10px] text-rose-600 font-semibold">Immediate action</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">Mean Response Time</span>
                    <p className="text-2xl font-extrabold text-[#800020] mt-1">4.2h</p>
                    <span className="text-[10px] text-emerald-600 font-semibold">Target &lt; 24h</span>
                  </div>
                </div>

                {/* Real-time Activity Stream */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Radio className="w-4 h-4 text-[#800020]" />
                    <span>Real-Time Ingestion Feed</span>
                  </h3>
                  <div className="space-y-3">
                    {cases.slice(0, 4).map((c, i) => (
                      <div key={c.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-3">
                          <span className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-rose-500 animate-ping' : 'bg-slate-400'}`}></span>
                          <div>
                            <span className="font-bold text-slate-800 text-xs">{c.id} - {c.type}</span>
                            <span className="text-slate-400 text-xs ml-2 font-medium">({c.category})</span>
                            <p className="text-[11px] text-slate-500 mt-0.5">Assigned to: <strong className="text-slate-700">{c.assignedDesk}</strong> • Filer: {c.filer}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveNav('Grievance Queue');
                            setActiveTab('All Cases');
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-[#800020] bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                        >
                          View in Queue →
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 3. DEPARTMENTS */}
            {activeNav === 'Departments' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">University Department Desks</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Assigned liaison units, resolution quotas, and SLA performance.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {departmentList.map((dept) => (
                    <div key={dept.name} className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-2xs hover:border-slate-300 transition-all">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-slate-800 text-sm">{dept.name}</h3>
                          <p className="text-xs text-slate-500 mt-0.5">Liaison: <span className="font-semibold text-slate-700">{dept.lead}</span></p>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          {dept.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                        <div className="p-2 bg-slate-50 rounded-lg">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Active</span>
                          <span className="font-bold text-slate-800 text-sm">{dept.activeTickets}</span>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-lg">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Resolved</span>
                          <span className="font-bold text-emerald-600 text-sm">{dept.resolved}</span>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-lg">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">SLA</span>
                          <span className="font-bold text-[#800020] text-sm">{dept.compliance}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-slate-400 font-mono truncate">{dept.email}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery(dept.name.split(' ')[0]);
                            setActiveNav('Grievance Queue');
                          }}
                          className="text-xs font-semibold text-[#800020] hover:underline cursor-pointer"
                        >
                          View Desk Cases →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. WEB ANALYTICS */}
            {activeNav === 'Web Analytics' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800 leading-tight">CampusCare Web Analytics Dashboard</h2>
                    <p className="text-xs text-slate-500 mt-1">Monitor system usage, user activity, and grievance statistics.</p>
                  </div>
                  <label className="relative">
                    <span className="sr-only">Analytics date range</span>
                    <Calendar className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <select
                      value={analyticsRange}
                      onChange={(event) => setAnalyticsRange(event.target.value)}
                      className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-9 text-xs font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#800020]/20"
                    >
                      <option>Last 7 days</option>
                      <option>Last 28 days</option>
                      <option>Last 90 days</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </label>
                </div>

                <p className="text-[10px] text-slate-400">Sample analytics · {analyticsRange}</p>

                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
                  {[
                    { label: 'Total Visitors', value: '2,094', change: '↑ 12.5%', color: 'blue', Icon: Users },
                    { label: 'Total Grievances', value: '482', change: '↑ 8.3%', color: 'rose', Icon: FileText },
                    { label: 'Resolved', value: '356', change: '↑ 14.2%', color: 'emerald', Icon: CheckCircle2 },
                    { label: 'Pending', value: '102', change: '↓ 5.6%', color: 'amber', Icon: Clock },
                    { label: 'Rejected', value: '24', change: '↓ 33.3%', color: 'violet', Icon: XCircle }
                  ].map(({ label, value, change, color, Icon }) => {
                    const colors = {
                      blue: 'bg-sky-50 border-sky-100 text-sky-600',
                      rose: 'bg-rose-50 border-rose-100 text-rose-700',
                      emerald: 'bg-emerald-50 border-emerald-100 text-emerald-600',
                      amber: 'bg-amber-50 border-amber-100 text-amber-600',
                      violet: 'bg-violet-50 border-violet-100 text-violet-600'
                    };
                    const changeColor = color === 'amber'
                      ? 'text-amber-600'
                      : color === 'violet'
                        ? 'text-violet-600'
                        : 'text-emerald-600';
                    return (
                      <article key={label} className={`min-w-0 rounded-xl border p-3.5 sm:p-4 ${colors[color]}`}>
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/80">
                            <Icon className="h-4 w-4" aria-hidden="true" />
                          </span>
                          <span className="truncate text-[11px] font-medium text-slate-600">{label}</span>
                        </div>
                        <p className="mt-2 text-2xl font-bold leading-none text-slate-800">{value}</p>
                        <p className={`mt-2 text-[11px] font-semibold ${changeColor}`}>{change}</p>
                        <p className="mt-0.5 text-[10px] text-slate-500">vs. previous {analyticsRange.replace('Last ', '')}</p>
                      </article>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
                  <section className="rounded-xl border border-slate-200 bg-white p-4 xl:col-span-5" aria-labelledby="user-activity-title">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <h3 id="user-activity-title" className="text-sm font-bold text-slate-800">User Activity Trends</h3>
                      <div className="flex rounded-lg bg-slate-50 p-0.5" aria-label="Chart interval">
                        {['Daily', 'Weekly', 'Monthly'].map((interval) => (
                          <button
                            key={interval}
                            type="button"
                            onClick={() => setAnalyticsGranularity(interval)}
                            aria-pressed={analyticsGranularity === interval}
                            className={`rounded-md px-2 py-1 text-[10px] font-medium transition-colors ${
                              analyticsGranularity === interval
                                ? 'bg-[#b5264a] text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            {interval}
                          </button>
                        ))}
                      </div>
                    </div>
                    <svg viewBox="0 0 600 220" className="h-48 w-full" role="img" aria-label={`${analyticsGranularity} user activity trend`}>
                      {[0, 50, 100, 150, 200].map((tick) => {
                        const y = 178 - (tick / 200) * 150;
                        return (
                          <g key={tick}>
                            <line x1="42" x2="588" y1={y} y2={y} stroke="#edf1f4" strokeWidth="1" />
                            <text x="32" y={y + 3} textAnchor="end" fill="#64748b" fontSize="10">{tick}</text>
                          </g>
                        );
                      })}
                      <polygon points={trendArea} fill="#b5264a" opacity="0.08" />
                      <polyline points={trendLine} fill="none" stroke="#b5264a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      {trendPoints.map(({ x, y }, index) => (
                        <circle key={`${x}-${index}`} cx={x} cy={y} r="3.5" fill="white" stroke="#b5264a" strokeWidth="2" />
                      ))}
                      {trendLabels.map((label, index) => {
                        const x = 46 + (index / (trendLabels.length - 1)) * 534;
                        return <text key={label} x={x} y="205" textAnchor="middle" fill="#64748b" fontSize="10">{label}</text>;
                      })}
                    </svg>
                  </section>

                  <section className="rounded-xl border border-slate-200 bg-white p-4 xl:col-span-3" aria-labelledby="traffic-source-title">
                    <h3 id="traffic-source-title" className="mb-4 text-sm font-bold text-slate-800">Traffic by Source</h3>
                    <div className="space-y-3.5">
                      {[
                        { source: 'Direct', sessions: '1,684', percent: 41, color: 'bg-[#b5264a]' },
                        { source: 'Search', sessions: '1,273', percent: 31, color: 'bg-pink-400' },
                        { source: 'Referral', sessions: '780', percent: 19, color: 'bg-violet-500' },
                        { source: 'Social', sessions: '370', percent: 9, color: 'bg-sky-500' }
                      ].map((item) => (
                        <div key={item.source}>
                          <div className="mb-1 flex items-center justify-between text-[11px]">
                            <span className="font-medium text-slate-700">{item.source}</span>
                            <span className="text-slate-500">{item.sessions} ({item.percent}%)</span>
                          </div>
                          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                            <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.percent * 2.2}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-xl border border-slate-200 bg-white p-4 xl:col-span-4" aria-labelledby="popular-pages-title">
                    <h3 id="popular-pages-title" className="mb-2 text-sm font-bold text-slate-800">Most Visited Pages</h3>
                    <div className="divide-y divide-slate-100">
                      {[
                        { path: '/', name: 'Home', views: '1,082' },
                        { path: '/grievance/submit', name: 'Submit Grievance', views: '642' },
                        { path: '/grievance/track', name: 'Track Grievance', views: '518' },
                        { path: '/departments', name: 'Departments', views: '402' },
                        { path: '/student', name: 'Student Portal', views: '317' }
                      ].map((page) => (
                        <div key={page.path} className="flex items-center gap-2.5 py-2.5 first:pt-1 last:pb-1">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                            <File className="h-3.5 w-3.5" aria-hidden="true" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[11px] font-semibold text-slate-700">{page.path}</p>
                            <p className="truncate text-[10px] text-slate-400">{page.name}</p>
                          </div>
                          <span className="shrink-0 text-[10px] text-slate-500">{page.views} visits</span>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
                  <section className="rounded-xl border border-slate-200 bg-white p-4 xl:col-span-4" aria-labelledby="grievance-analytics-title">
                    <h3 id="grievance-analytics-title" className="mb-3 text-sm font-bold text-slate-800">Grievance Analytics</h3>
                    <div className="flex flex-wrap items-center justify-center gap-5">
                      <div
                        className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full"
                        style={{ background: 'conic-gradient(#35b578 0% 74%, #f3b544 74% 95%, #8954d8 95% 100%)' }}
                        role="img"
                        aria-label="482 total grievances: 356 resolved, 102 pending, 24 rejected"
                      >
                        <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-white">
                          <span className="text-xl font-bold text-slate-800">482</span>
                          <span className="text-[9px] text-slate-500">Total Grievances</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {[
                          { label: 'Resolved', count: '356 (74%)', color: 'bg-emerald-500' },
                          { label: 'Pending', count: '102 (21%)', color: 'bg-amber-400' },
                          { label: 'Rejected', count: '24 (5%)', color: 'bg-violet-500' }
                        ].map((item) => (
                          <div key={item.label} className="flex items-center gap-2 text-[10px]">
                            <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                            <span className="text-slate-600">{item.label}</span>
                            <span className="font-medium text-slate-500">{item.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>

                  <section className="rounded-xl border border-slate-200 bg-white p-4 xl:col-span-5" aria-labelledby="department-analytics-title">
                    <h3 id="department-analytics-title" className="mb-2 text-sm font-bold text-slate-800">Department Analytics</h3>
                    <div className="relative flex h-36 items-end justify-around gap-2 px-1 pt-3" role="img" aria-label="Grievance volume by department: ICT 164, Academics 112, Student Services 87, Admin 56, Others 28">
                      {[0, 50, 100, 150, 200].map((tick) => (
                        <div key={tick} className="pointer-events-none absolute inset-x-1 border-t border-slate-100" style={{ bottom: `${16 + (tick / 200) * 78}%` }}>
                          <span className="absolute -left-1 -top-2.5 -translate-x-full text-[9px] text-slate-400">{tick}</span>
                        </div>
                      ))}
                      {[
                        { name: 'ICT', count: 164, color: 'bg-[#b5264a]' },
                        { name: 'Academics', count: 112, color: 'bg-pink-400' },
                        { name: 'Student Services', count: 87, color: 'bg-violet-500' },
                        { name: 'Admin', count: 56, color: 'bg-sky-500' },
                        { name: 'Others', count: 28, color: 'bg-emerald-500' }
                      ].map((item) => (
                        <div key={item.name} className="z-10 flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1">
                          <span className="text-[9px] font-medium text-slate-600">{item.count}</span>
                          <div className={`w-full max-w-9 rounded-t-md ${item.color}`} style={{ height: `${(item.count / 200) * 78}%` }} />
                          <span className="h-6 text-center text-[8px] leading-tight text-slate-500">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </section>

                  <aside className="flex flex-col justify-center rounded-xl border border-slate-200 bg-slate-50 p-4 xl:col-span-3">
                    <span className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                      <TrendingUp className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <h3 className="text-sm font-bold text-slate-800">System Overview</h3>
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-500">Track user engagement, monitor complaints and grievances, and get insights to improve the CampusCare experience.</p>
                  </aside>
                </div>
              </div>
            )}

            {/* 5. STUDENT FILERS */}
            {activeNav === 'Student Filers' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">Student Filer Directory</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Registered student filers and history of submitted grievances.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-separate border-spacing-y-1.5 min-w-[680px]">
                    <thead>
                      <tr className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                        <th className="py-2.5 px-3">Student Name</th>
                        <th className="py-2.5 px-3">Student ID</th>
                        <th className="py-2.5 px-3">College Department</th>
                        <th className="py-2.5 px-3">University Email</th>
                        <th className="py-2.5 px-3">Total Cases</th>
                        <th className="py-2.5 px-3">Account Status</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockFilers.map((student) => (
                        <tr key={student.id} className="bg-white hover:bg-slate-50 border border-slate-100 rounded-xl">
                          <td className="py-3 px-3 font-semibold text-slate-800">{student.name}</td>
                          <td className="py-3 px-3 font-mono font-bold text-[#800020]">{student.id}</td>
                          <td className="py-3 px-3 text-slate-600">{student.college}</td>
                          <td className="py-3 px-3 text-slate-400 font-mono">{student.email}</td>
                          <td className="py-3 px-3">
                            <span className="font-bold text-slate-700">{student.casesCount} filed</span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              {student.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setNoticeForm({
                                  recipient: `${student.id} (${student.name})`,
                                  subject: '',
                                  type: 'Official Notice',
                                  message: ''
                                });
                                setActiveNav('Direct Notices');
                              }}
                              className="px-2.5 py-1 text-xs font-semibold text-[#800020] hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            >
                              Send Notice →
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 6. DIRECT NOTICES */}
            {activeNav === 'Direct Notices' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">Official Ombudsman Notices</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Dispatch formal notifications, hearing calls, and resolution summaries directly to filers.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Compose Form */}
                  <form onSubmit={handleSendNotice} className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <Send className="w-4 h-4 text-[#800020]" />
                      <span>Compose Official Notice</span>
                    </h3>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Recipient (Student ID or Name)</label>
                      <input
                        type="text"
                        value={noticeForm.recipient}
                        onChange={(e) => setNoticeForm({ ...noticeForm, recipient: e.target.value })}
                        placeholder="e.g. 2025-03461 (Maya Vance)"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#800020]/20"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Notice Classification</label>
                      <select
                        value={noticeForm.type}
                        onChange={(e) => setNoticeForm({ ...noticeForm, type: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#800020]/20"
                      >
                        <option value="Official Notice">Official Notice</option>
                        <option value="Resolution Summary">Resolution Summary</option>
                        <option value="Hearing Schedule">Hearing Schedule</option>
                        <option value="Information Request">Information Request</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Subject</label>
                      <input
                        type="text"
                        value={noticeForm.subject}
                        onChange={(e) => setNoticeForm({ ...noticeForm, subject: e.target.value })}
                        placeholder="e.g. Redressal Findings for Case Ticket"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#800020]/20"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Notice Message</label>
                      <textarea
                        rows={4}
                        value={noticeForm.message}
                        onChange={(e) => setNoticeForm({ ...noticeForm, message: e.target.value })}
                        placeholder="Write official grievance notice details here..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#800020]/20"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-[#800020] hover:bg-[#68001a] text-white font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Dispatch Official Notice</span>
                    </button>
                  </form>

                  {/* Sent Notices History */}
                  <div className="lg:col-span-6 bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
                    <h3 className="text-sm font-bold text-slate-800">Recent Dispatched Notices</h3>
                    <div className="space-y-2.5">
                      {notices.map((n) => (
                        <div key={n.id} className="p-3 bg-white rounded-lg border border-slate-200 space-y-1 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800 text-xs">{n.subject}</span>
                            <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              {n.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">To: <span className="font-semibold text-slate-700">{n.recipient}</span> • {n.type}</p>
                          <span className="text-[10px] text-slate-400 block">{n.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 7. SETTINGS */}
            {activeNav === 'Settings' && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">Admin System Settings</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Configure portal operations, SLA parameters, and automated intake controls.</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-5 shadow-2xs">
                  {/* Intake Gateway Control */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Public Grievance Intake Gateway</h4>
                      <p className="text-[11px] text-slate-500">Allow students to submit new grievance tickets via the student portal.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIntakeOpen(!intakeOpen);
                        showNotification(intakeOpen ? 'Intake gateway paused.' : 'Intake gateway opened.');
                      }}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        intakeOpen ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {intakeOpen ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>

                  {/* SLA Parameters */}
                  <div className="space-y-3 pb-4 border-b border-slate-100">
                    <h4 className="text-xs font-bold text-slate-800">SLA Enforcement Thresholds</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Standard Resolution Target</label>
                        <input
                          type="number"
                          value={slaHours}
                          onChange={(e) => setSlaHours(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold"
                        />
                        <span className="text-[10px] text-slate-400">Hours (Default 48h)</span>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Urgent Escalation Window</label>
                        <input
                          type="number"
                          value={urgentSlaHours}
                          onChange={(e) => setUrgentSlaHours(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold"
                        />
                        <span className="text-[10px] text-slate-400">Hours (Default 12h)</span>
                      </div>
                    </div>
                  </div>

                  {/* Notification Check */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Automated Desk Alerting</h4>
                      <p className="text-[11px] text-slate-500">Dispatch instant notifications when urgent student tickets are submitted.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailAlerts}
                      onChange={(e) => setEmailAlerts(e.target.checked)}
                      className="w-4 h-4 accent-[#800020] cursor-pointer"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => showNotification('System settings saved and applied.')}
                    className="px-4 py-2 bg-[#800020] hover:bg-[#68001a] text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
                  >
                    Save Configuration Changes
                  </button>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
