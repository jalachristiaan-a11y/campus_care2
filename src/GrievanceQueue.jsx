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
  FileText,
  MoreVertical,
  MessageCircle,
  UserPlus,
  Check,
  LogOut,
  Sparkles,
  Send
} from 'lucide-react';
import LogoutConfirmation from './LogoutConfirmation.jsx';
import { apiRequest } from './apiClient.js';
import campusCareLogo from './assets/campuscare-logo.png';

const departmentList = [
  'CPPO Facilities & Plant',
  'Academic Affairs & Colleges',
  'UniFAST & Student Aid Unit',
  'Student Conduct & Grievance Desk',
  'CCICT IT Systems & Support',
  'University Registrar Desk',
];

const mapComplaintToCase = (complaint, slaSettings) => {
  const resolved = complaint.status === 'Resolved';
  const withdrawn = complaint.status === 'Withdrawn';
  const inactive = resolved || withdrawn;
  const safetyCase = complaint.category === 'Safety and Security';
  const slaLimit = Number(safetyCase ? slaSettings.urgentSlaHours : slaSettings.slaHours);
  const elapsedHours = Math.max(0, (Date.now() - Date.parse(complaint.submittedAt)) / 3600000);
  const overdue = !inactive && elapsedHours >= slaLimit;

  return {
    id: `#${complaint.id}`,
    grievanceId: complaint.id,
    recipientEmail: complaint.submittedBy || '',
    filer: complaint.submittedByName || complaint.submittedBy || 'Student',
    studentId: complaint.studentId || '',
    studentDepartment: complaint.studentDepartment || '',
    description: complaint.description || '',
    location: complaint.location || '',
    attachment: complaint.attachment || null,
    avatar: (complaint.submittedByName || complaint.submittedBy || 'S').slice(0, 2).toUpperCase(),
    avatarBg: 'bg-rose-100 text-[#800020]',
    category: complaint.category,
    sla: resolved ? 'Resolved' : withdrawn ? 'Withdrawn' : overdue ? `Overdue by ${Math.floor(elapsedHours - slaLimit)}h` : `Due in ${Math.ceil(slaLimit - elapsedHours)}h`,
    slaStatus: resolved ? 'resolved' : withdrawn ? 'withdrawn' : overdue ? 'urgent' : 'normal',
    assignedDesk: complaint.department || 'Awaiting assignment',
    status: complaint.status,
    statusColor: complaint.statusClass === 'withdrawn'
      ? 'text-slate-600 bg-slate-100'
      : complaint.statusClass === 'closed'
      ? 'text-emerald-600 bg-emerald-50'
      : complaint.statusClass === 'progress'
        ? 'text-blue-600 bg-blue-50'
        : 'text-amber-600 bg-amber-50',
    dotColor: complaint.statusClass === 'withdrawn'
      ? 'bg-slate-500'
      : complaint.statusClass === 'closed'
      ? 'bg-emerald-600'
      : complaint.statusClass === 'progress'
        ? 'bg-blue-600'
        : 'bg-amber-500',
    submittedAt: complaint.submittedAt,
    type: complaint.title,
  };
};

const resolveNoticeRecipient = (recipientValue) => {
  const recipient = recipientValue.trim();
  const email = recipient.match(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i)?.[0]?.toLowerCase() || '';
  const studentId = recipient.match(/\b\d{4}-?\d{4,5}\b/)?.[0] || '';
  const recipientName = recipient.match(/\(([^)]+)\)/)?.[1]?.trim() || '';

  return { recipientEmail: email, recipientStudentId: studentId, recipientName };
};
export default function GrievanceQueue({ user = {}, onLogout, token }) {
  const [logoutConfirmationOpen, setLogoutConfirmationOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('Grievance Queue');
  const [activeTab, setActiveTab] = useState('All Cases');
  const [analyticsRange, setAnalyticsRange] = useState('Last 28 days');
  const [analyticsGranularity, setAnalyticsGranularity] = useState('Daily');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [complaintActivity, setComplaintActivity] = useState({ complaintId: '', activity: [], error: '' });
  const [responseMessage, setResponseMessage] = useState('');
  const [resolutionNote, setResolutionNote] = useState('');
  const [activitySaving, setActivitySaving] = useState(false);
  const [activityError, setActivityError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationMsg, setNotificationMsg] = useState(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState(() => new Set());
  const notificationPanelRef = useRef(null);

  // Settings State
  const [intakeOpen, setIntakeOpen] = useState(false);
  const [slaHours, setSlaHours] = useState('48');
  const [urgentSlaHours, setUrgentSlaHours] = useState('12');
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsError, setSettingsError] = useState('');
  const [settingsSaveError, setSettingsSaveError] = useState('');
  const [settingsLoadAttempt, setSettingsLoadAttempt] = useState(0);

  // Direct Notices State
  const [notices, setNotices] = useState([]);
  const [noticeForm, setNoticeForm] = useState({
    recipient: '',
    subject: '',
    type: 'Official Notice',
    message: ''
  });

  const [cases, setCases] = useState([]);
  const [casesLoading, setCasesLoading] = useState(true);
  const [casesError, setCasesError] = useState('');
  const [analyticsNow, setAnalyticsNow] = useState(0);
  const adminName = user.fullName || user.universityEmail?.split('@')[0] || 'Administrator';
  const adminInitials = adminName
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  const showNotification = (message, type = 'success') => {
    setNotificationMsg({ message, type });
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  useEffect(() => {
    let active = true;
    const loadSettings = async () => {
      try {
        const result = await apiRequest('/api/settings', token);
        if (!active) return;
        setIntakeOpen(result.settings.intakeOpen);
        setSlaHours(String(result.settings.slaHours));
        setUrgentSlaHours(String(result.settings.urgentSlaHours));
        setSettingsError('');
      } catch (error) {
        if (active) {
          setSettingsError(error instanceof Error ? error.message : 'Unable to load portal settings.');
          showNotification(`Unable to load settings: ${error.message}`, 'error');
        }
      } finally {
        if (active) setSettingsLoading(false);
      }
    };

    loadSettings();
    return () => {
      active = false;
    };
  }, [token, settingsLoadAttempt]);

  useEffect(() => {
    let active = true;
    const loadCases = async () => {
      try {
        const result = await apiRequest('/api/complaints', token);
        if (active) {
          setCases(result.complaints.map((complaint) => (
            mapComplaintToCase(complaint, { slaHours, urgentSlaHours })
          )));
          setAnalyticsNow(Date.now());
          setCasesError('');
        }
      } catch (error) {
        if (active) {
          setCasesError(error instanceof Error ? error.message : 'Unable to load complaints.');
        }
      } finally {
        if (active) setCasesLoading(false);
      }
    };

    loadCases();
    const intervalId = window.setInterval(loadCases, 15000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [token, slaHours, urgentSlaHours]);

  useEffect(() => {
    let active = true;
    const loadNotices = async () => {
      try {
        const result = await apiRequest('/api/notices', token);
        if (active) setNotices(result.notices);
      } catch (error) {
        if (active) showNotification(`Unable to load notices: ${error.message}`, 'error');
      }
    };

    loadNotices();
    const intervalId = window.setInterval(loadNotices, 15000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [token]);

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
  const studentFilers = useMemo(() => {
    const filers = new Map();
    cases.forEach((caseItem) => {
      const key = caseItem.recipientEmail || caseItem.studentId;
      if (!key) return;

      const existing = filers.get(key);
      if (existing) {
        existing.casesCount += 1;
        return;
      }

      filers.set(key, {
        name: caseItem.filer,
        id: caseItem.studentId,
        email: caseItem.recipientEmail,
        college: caseItem.studentDepartment || 'Not provided',
        casesCount: 1,
        status: 'Registered student',
      });
    });
    return [...filers.values()];
  }, [cases]);
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

  useEffect(() => {
    if (!selectedCase && !selectedDepartment) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setSelectedCase(null);
        setSelectedDepartment(null);
      }
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [selectedCase, selectedDepartment]);

  const selectedComplaintId = selectedCase?.grievanceId;
  useEffect(() => {
    if (!selectedComplaintId) return undefined;
    let active = true;
    apiRequest(
      `/api/complaints/${encodeURIComponent(selectedComplaintId)}/activity`,
      token,
    )
      .then((result) => {
        if (active) {
          setComplaintActivity({
            complaintId: selectedComplaintId,
            activity: result.activity,
            error: '',
          });
        }
      })
      .catch((error) => {
        if (active) {
          setComplaintActivity({
            complaintId: selectedComplaintId,
            activity: [],
            error: error instanceof Error ? error.message : 'Unable to load complaint activity.',
          });
        }
      });

    return () => {
      active = false;
    };
  }, [selectedComplaintId, token]);

  const openNotificationCase = (notification) => {
    setReadNotificationIds((previousIds) => new Set(previousIds).add(notification.id));
    setSearchQuery(notification.caseId);
    setActiveNav('Grievance Queue');
    setNotificationsOpen(false);
  };

  const openCaseDetails = (caseItem) => {
    setSelectedCase(caseItem);
    setResponseMessage('');
    setResolutionNote('');
    setActivityError('');
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

  const handleUpdateComplaintStatus = async (caseId, status, note = '') => {
    const caseItem = cases.find((item) => item.id === caseId);
    if (!caseItem || caseItem.status === status) {
      setOpenMenuId(null);
      return;
    }

    let updatedComplaint;
    try {
      const result = await apiRequest(
        `/api/complaints/${encodeURIComponent(caseItem.grievanceId)}/status`,
        token,
        { method: 'PATCH', body: JSON.stringify({ status, resolutionNote: note }) },
      );
      updatedComplaint = mapComplaintToCase(result.complaint, { slaHours, urgentSlaHours });
    } catch (error) {
      showNotification(`Unable to update ${caseId}: ${error.message}`, 'error');
      setOpenMenuId(null);
      return;
    }

    setCases((prev) => prev.map((item) => (
      item.id === caseId
        ? updatedComplaint
        : item
    )));
    if (selectedCase?.id === caseId) {
      setSelectedCase(updatedComplaint);
    }
    setOpenMenuId(null);
    setResolutionNote('');
    showNotification(`Case ${caseId} marked ${status}.`);
    try {
      const activityResult = await apiRequest(
        `/api/complaints/${encodeURIComponent(caseItem.grievanceId)}/activity`,
        token,
      );
      setComplaintActivity({
        complaintId: caseItem.grievanceId,
        activity: activityResult.activity,
        error: '',
      });
    } catch (error) {
      setComplaintActivity({
        complaintId: caseItem.grievanceId,
        activity: [],
        error: error instanceof Error ? error.message : 'Unable to load complaint activity.',
      });
    }
  };

  const handleResolveCase = (caseId) => {
    const caseItem = cases.find((item) => item.id === caseId);
    if (caseItem) openCaseDetails(caseItem);
    setOpenMenuId(null);
  };

  const handleSendComplaintResponse = async () => {
    if (!selectedCase || !responseMessage.trim()) return;

    setActivitySaving(true);
    setActivityError('');
    try {
      const result = await apiRequest(
        `/api/complaints/${encodeURIComponent(selectedCase.grievanceId)}/responses`,
        token,
        {
          method: 'POST',
          body: JSON.stringify({ message: responseMessage }),
        },
      );
      setComplaintActivity((previous) => ({
        complaintId: selectedCase.grievanceId,
        activity: previous.complaintId === selectedCase.grievanceId
          ? [...previous.activity, result.activity]
          : [result.activity],
        error: '',
      }));
      setResponseMessage('');
      showNotification('Response added to the complaint activity log.');
    } catch (error) {
      setActivityError(error instanceof Error ? error.message : 'Unable to save complaint response.');
    } finally {
      setActivitySaving(false);
    }
  };

  const handleOpenDepartmentCases = (departmentName) => {
    const departmentCases = cases.filter((caseItem) => caseItem.assignedDesk === departmentName);
    if (departmentCases.length === 1) {
      openCaseDetails(departmentCases[0]);
      return;
    }

    setSelectedDepartment(departmentName);
  };

  const handleSaveSettings = async () => {
    const standardHours = Number(slaHours);
    const urgentHours = Number(urgentSlaHours);
    if (
      !Number.isInteger(standardHours)
      || standardHours < 1
      || standardHours > 720
      || !Number.isInteger(urgentHours)
      || urgentHours < 1
      || urgentHours > 720
    ) {
      showNotification('SLA windows must be whole numbers from 1 to 720 hours.', 'error');
      return;
    }

    setSettingsSaving(true);
    setSettingsSaveError('');
    try {
      const result = await apiRequest('/api/settings', token, {
        method: 'PUT',
        body: JSON.stringify({
          intakeOpen,
          slaHours: standardHours,
          urgentSlaHours: urgentHours,
        }),
      });
      setIntakeOpen(result.settings.intakeOpen);
      setSlaHours(String(result.settings.slaHours));
      setUrgentSlaHours(String(result.settings.urgentSlaHours));
      setSettingsError('');
      showNotification('Portal settings saved to the database.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Please try again.';
      setSettingsSaveError(message);
      showNotification(`Unable to save settings: ${message}`, 'error');
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleReassignCase = async (caseId) => {
    const caseItem = cases.find((item) => item.id === caseId);
    if (!caseItem) return;

    const departments = departmentList.map((department) => department.name);
    const currentIndex = departments.indexOf(caseItem.assignedDesk);
    const nextDepartment = departments[(currentIndex + 1) % departments.length];
    try {
      const result = await apiRequest(
        `/api/complaints/${encodeURIComponent(caseItem.grievanceId)}/department`,
        token,
        { method: 'PATCH', body: JSON.stringify({ department: nextDepartment }) },
      );
      const updatedComplaint = mapComplaintToCase(result.complaint, { slaHours, urgentSlaHours });
      setCases((previousCases) => previousCases.map((item) => (
        item.id === caseId ? updatedComplaint : item
      )));
    } catch (error) {
      showNotification(`Unable to reassign ${caseId}: ${error.message}`, 'error');
      setOpenMenuId(null);
      return;
    }

    setOpenMenuId(null);
    showNotification(`Case ${caseId} assigned to ${nextDepartment}.`);
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

  const handleSendNotice = async (e) => {
    e.preventDefault();
    if (!noticeForm.recipient.trim() || !noticeForm.message.trim()) {
      showNotification('Please provide a recipient and notice message body.', 'error');
      return;
    }

    try {
      const recipient = resolveNoticeRecipient(noticeForm.recipient);
      const result = await apiRequest('/api/notices', token, {
        method: 'POST',
        body: JSON.stringify({
          ...recipient,
          subject: noticeForm.subject.trim() || 'Official Portal Notice',
          message: noticeForm.message.trim(),
          type: noticeForm.type,
        }),
      });
      setNotices((previousNotices) => [result.notice, ...previousNotices]);
    } catch (error) {
      showNotification(`Unable to send notice: ${error instanceof Error ? error.message : 'Please try again.'}`, 'error');
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

  const analyticsDays = Number(analyticsRange.match(/\d+/)?.[0] || 28);
  const analyticsStart = useMemo(
    () => new Date(analyticsNow - analyticsDays * 86400000),
    [analyticsDays, analyticsNow],
  );
  const analyticsCases = useMemo(() => cases.filter((caseItem) => (
    Date.parse(caseItem.submittedAt) >= analyticsStart.getTime()
  )), [cases, analyticsStart]);
  const resolvedAnalyticsCount = analyticsCases.filter((caseItem) => caseItem.status === 'Resolved').length;
  const pendingAnalyticsCount = analyticsCases.length - resolvedAnalyticsCount;
  const categoryStats = useMemo(() => {
    const stats = new Map();
    analyticsCases.forEach((caseItem) => {
      stats.set(caseItem.category, (stats.get(caseItem.category) || 0) + 1);
    });
    return [...stats.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((left, right) => right.count - left.count);
  }, [analyticsCases]);
  const departmentStats = useMemo(() => {
    const stats = new Map();
    cases.forEach((caseItem) => {
      const current = stats.get(caseItem.assignedDesk) || { name: caseItem.assignedDesk, active: 0, resolved: 0 };
      if (caseItem.status === 'Resolved') current.resolved += 1;
      else current.active += 1;
      stats.set(caseItem.assignedDesk, current);
    });
    return [...stats.values()].sort((left, right) => left.name.localeCompare(right.name));
  }, [cases]);
  const analyticsDepartmentStats = useMemo(() => {
    const stats = new Map();
    analyticsCases.forEach((caseItem) => {
      const current = stats.get(caseItem.assignedDesk) || { name: caseItem.assignedDesk, count: 0 };
      current.count += 1;
      stats.set(caseItem.assignedDesk, current);
    });
    return [...stats.values()].sort((left, right) => right.count - left.count);
  }, [analyticsCases]);
  const trendIntervalDays = analyticsGranularity === 'Daily' ? 1 : analyticsGranularity === 'Weekly' ? 7 : 30;
  const trendBucketCount = Math.max(1, Math.ceil(analyticsDays / trendIntervalDays));
  const analyticsTrend = Array(trendBucketCount).fill(0);
  analyticsCases.forEach((caseItem) => {
    const daysAgo = (analyticsNow - Date.parse(caseItem.submittedAt)) / 86400000;
    const bucket = Math.min(trendBucketCount - 1, Math.floor((analyticsDays - daysAgo) / trendIntervalDays));
    if (bucket >= 0) analyticsTrend[bucket] += 1;
  });
  const trendMaximum = Math.max(1, ...analyticsTrend);
  const trendPoints = analyticsTrend.map((value, index) => {
    const x = 46 + (index / Math.max(1, analyticsTrend.length - 1)) * 534;
    const y = 178 - (value / trendMaximum) * 150;
    return { x, y };
  });
  const trendLine = trendPoints.map(({ x, y }) => `${x},${y}`).join(' ');
  const trendArea = `46,178 ${trendLine} 580,178`;
  const trendLabelIndexes = [0, Math.floor((trendBucketCount - 1) / 2), trendBucketCount - 1]
    .filter((index, position, indexes) => indexes.indexOf(index) === position);
  const trendLabels = trendLabelIndexes.map((index) => {
      const date = new Date(analyticsStart.getTime() + index * trendIntervalDays * 86400000);
      return analyticsGranularity === 'Monthly'
        ? date.toLocaleDateString(undefined, { month: 'short' })
        : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    });
  const startOfToday = new Date(analyticsNow);
  startOfToday.setHours(0, 0, 0, 0);
  const incomingTodayCount = cases.filter((caseItem) => (
    Date.parse(caseItem.submittedAt) >= startOfToday.getTime()
  )).length;

  return (
    <div className="flex h-screen bg-slate-100 text-slate-700 font-sans p-2 sm:p-4">
      {/* Container Card */}
      <div className="flex flex-1 bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        
        {/* Sidebar */}
        <aside className="w-64 m-4 mr-0 rounded-2xl bg-gradient-to-b from-[#a00028] via-[#800020] to-[#66001a] p-5 flex flex-col justify-between hidden md:flex shrink-0 text-white">
          <div>
            {/* Logo */}
            <div className="flex items-center gap-3 mb-7">
              <div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/50 bg-white shadow-xs">
                <img src={campusCareLogo} alt="" aria-hidden="true" className="h-full w-full object-contain" />
              </div>
              <div>
                <h1 className="font-bold text-white text-sm tracking-tight leading-tight">CampusCare</h1>
                <p className="text-[10px] font-bold text-white/70 tracking-wider uppercase">ADMIN PORTAL</p>
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
                        ? 'bg-white/20 text-white shadow-xs'
                        : 'text-white/75 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-white/65'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="border-t border-white/20 pt-4">
            <button
              type="button"
              onClick={() => setLogoutConfirmationOpen(true)}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              title="Log out of Admin Portal"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span>Log out</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          
          {/* Top Bar Header */}
          <header className="sticky top-0 z-20 flex flex-col gap-3 bg-slate-50/95 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex min-h-14 items-center justify-between gap-3 rounded-full border border-slate-200/80 bg-white/95 px-4 py-2.5 shadow-sm backdrop-blur-md sm:px-5">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-rose-200 bg-rose-50 text-[#800020]">
                  <img src={campusCareLogo} alt="" aria-hidden="true" className="h-full w-full rounded-full object-contain" />
                </span>
                <span className="flex min-w-0 items-center gap-2">
                  <span className="truncate text-sm font-bold tracking-tight text-slate-900">CampusCare</span>
                  <span className="hidden rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[9px] font-semibold text-slate-500 sm:inline">ADMIN</span>
                </span>
              </div>

              <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                <span className="hidden sm:grid h-8 w-8 place-items-center rounded-full border-2 border-[#800020] bg-rose-50 text-[10px] font-extrabold text-[#800020]" aria-label={adminName}>
                  {adminInitials || 'AD'}
                </span>
              <div className="relative" ref={notificationPanelRef}>
                <button
                  type="button"
                  className="relative grid h-9 w-9 place-items-center rounded-full bg-slate-50 text-slate-600 transition-colors hover:bg-rose-50 hover:text-[#800020] cursor-pointer"
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

            </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="truncate text-sm font-bold text-slate-800">{activeNav}</h2>
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative min-w-0 flex-1 sm:w-72 sm:flex-none">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search ticket #, filer, desk..."
                    className="w-full bg-white hover:bg-slate-50 focus:bg-white border border-slate-200/80 rounded-full pl-9 pr-3.5 py-2 text-[11px] focus:outline-none focus:ring-2 focus:ring-[#800020]/20 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>
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
            <div
              role={notificationMsg.type === 'error' ? 'alert' : 'status'}
              className={`mx-6 sm:mx-8 mt-4 p-3 rounded-xl text-xs font-medium flex items-center gap-2 shadow-xs animate-in fade-in duration-200 ${
                notificationMsg.type === 'error'
                  ? 'bg-rose-50 border border-rose-200 text-rose-800'
                  : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              }`}
            >
              <Sparkles className={`w-4 h-4 shrink-0 ${notificationMsg.type === 'error' ? 'text-rose-600' : 'text-emerald-600'}`} />
              <span>{notificationMsg.message}</span>
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
                            {casesLoading
                              ? 'Loading complaints…'
                              : casesError || 'No complaints found. Submitted complaints will appear here.'}
                          </td>
                        </tr>
                      ) : (
                        filteredCases.map((item) => (
                          <tr
                            key={item.id}
                            tabIndex={0}
                            aria-label={`View complaint ${item.id}: ${item.type}`}
                            onClick={(event) => {
                              if (event.target.closest('button, a, input, select, textarea')) return;
                              openCaseDetails(item);
                            }}
                            onKeyDown={(event) => {
                              if (
                                event.target === event.currentTarget
                                && (event.key === 'Enter' || event.key === ' ')
                              ) {
                                event.preventDefault();
                                openCaseDetails(item);
                              }
                            }}
                            className={`cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#800020] hover:bg-slate-50/90 transition-colors rounded-xl relative border border-slate-100 ${
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
                            <td className="py-3 px-3">
                              <button
                                type="button"
                                onClick={() => openCaseDetails(item)}
                                className="text-left font-medium text-slate-600 underline decoration-slate-300 underline-offset-2 transition-colors hover:text-[#800020] hover:decoration-[#800020]"
                                aria-label={`View details for ${item.id}: ${item.type}`}
                              >
                                {item.type}
                              </button>
                            </td>
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
                                    onClick={() => {
                                      openCaseDetails(item);
                                      setOpenMenuId(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 rounded-lg font-medium transition-colors cursor-pointer"
                                  >
                                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                                    <span>View details</span>
                                  </button>
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
                                  {item.status === 'Under Review' && (
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateComplaintStatus(item.id, 'In Progress')}
                                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors cursor-pointer"
                                    >
                                      <Clock className="w-3.5 h-3.5" />
                                      <span>Mark In Progress</span>
                                    </button>
                                  )}
                                  {!['Resolved', 'Withdrawn'].includes(item.status) && (
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
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">Live Grievance Monitor</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Complaint records refresh automatically every 15 seconds.</p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">Incoming Today</span>
                    <p className="text-2xl font-extrabold text-slate-800 mt-1">{incomingTodayCount}</p>
                    <span className="text-[10px] text-slate-500">From saved complaint records</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">Under Review</span>
                    <p className="text-2xl font-extrabold text-amber-600 mt-1">{cases.filter((caseItem) => caseItem.status === 'Under Review').length}</p>
                    <span className="text-[10px] text-slate-500">Requires triage</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">Overdue Cases</span>
                    <p className="text-2xl font-extrabold text-rose-600 mt-1">{cases.filter((caseItem) => caseItem.slaStatus === 'urgent').length}</p>
                    <span className="text-[10px] text-rose-600 font-semibold">Based on saved SLA settings</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">Resolved Cases</span>
                    <p className="text-2xl font-extrabold text-[#800020] mt-1">{cases.filter((caseItem) => caseItem.status === 'Resolved').length}</p>
                    <span className="text-[10px] text-slate-500">Total in the complaint database</span>
                  </div>
                </div>

              </div>
            )}

            {/* 3. DEPARTMENTS */}
            {activeNav === 'Departments' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">University Department Desks</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Departments and case counts derived from saved complaint assignments.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {departmentStats.map((dept) => (
                    <button
                      key={dept.name}
                      type="button"
                      onClick={() => handleOpenDepartmentCases(dept.name)}
                      className="w-full bg-white rounded-xl border border-slate-200 p-5 space-y-3 text-left shadow-2xs hover:border-[#800020]/40 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#800020] transition-all"
                      aria-label={`View ${dept.active + dept.resolved} complaint${dept.active + dept.resolved === 1 ? '' : 's'} assigned to ${dept.name}`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-slate-800 text-sm">{dept.name}</h3>
                          <p className="text-xs text-slate-500 mt-0.5">Case assignment summary</p>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          {dept.active} active
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                        <div className="p-2 bg-slate-50 rounded-lg">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Active</span>
                          <span className="font-bold text-slate-800 text-sm">{dept.active}</span>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-lg">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Resolved</span>
                          <span className="font-bold text-emerald-600 text-sm">{dept.resolved}</span>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-lg">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total</span>
                          <span className="font-bold text-[#800020] text-sm">{dept.active + dept.resolved}</span>
                        </div>
                      </div>

                    </button>
                  ))}
                  {!casesLoading && departmentStats.length === 0 && (
                    <p className="col-span-full rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                      Department case counts will appear after complaints are assigned.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* 4. WEB ANALYTICS */}
            {activeNav === 'Web Analytics' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800 leading-tight">Complaint Analytics</h2>
                    <p className="text-xs text-slate-500 mt-1">Counts and trends calculated from saved complaint records.</p>
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

                <p className="text-[10px] text-slate-400">
                  {analyticsRange} · Website visits and traffic sources are not collected by this installation.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Complaints', value: analyticsCases.length, color: 'rose', Icon: FileText },
                    { label: 'Resolved', value: resolvedAnalyticsCount, color: 'emerald', Icon: CheckCircle2 },
                    { label: 'Open', value: pendingAnalyticsCount, color: 'amber', Icon: Clock },
                    {
                      label: 'Student Filers',
                      value: new Set(analyticsCases.map((caseItem) => caseItem.recipientEmail || caseItem.studentId).filter(Boolean)).size,
                      color: 'blue',
                      Icon: Users,
                    }
                  ].map(({ label, value, color, Icon }) => {
                    const colors = {
                      blue: 'bg-sky-50 border-sky-100 text-sky-600',
                      rose: 'bg-rose-50 border-rose-100 text-rose-700',
                      emerald: 'bg-emerald-50 border-emerald-100 text-emerald-600',
                      amber: 'bg-amber-50 border-amber-100 text-amber-600'
                    };
                    return (
                      <article key={label} className={`min-w-0 rounded-xl border p-3.5 sm:p-4 ${colors[color]}`}>
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/80">
                            <Icon className="h-4 w-4" aria-hidden="true" />
                          </span>
                          <span className="truncate text-[11px] font-medium text-slate-600">{label}</span>
                        </div>
                        <p className="mt-2 text-2xl font-bold leading-none text-slate-800">{value}</p>
                        <p className="mt-2 text-[11px] font-medium text-slate-500">In selected period</p>
                      </article>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
                  <section className="rounded-xl border border-slate-200 bg-white p-4 xl:col-span-5" aria-labelledby="user-activity-title">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <h3 id="user-activity-title" className="text-sm font-bold text-slate-800">Complaint Submissions</h3>
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
                    <svg viewBox="0 0 600 220" className="h-48 w-full" role="img" aria-label={`${analyticsGranularity} complaint submission trend`}>
                      {[0, 1, 2, 3, 4].map((step) => {
                        const tick = Math.round((trendMaximum * step) / 4);
                        const y = 178 - (step / 4) * 150;
                        return (
                          <g key={step}>
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
                        const bucketIndex = trendLabelIndexes[index];
                        const x = 46 + (bucketIndex / Math.max(1, analyticsTrend.length - 1)) * 534;
                        return <text key={label} x={x} y="205" textAnchor="middle" fill="#64748b" fontSize="10">{label}</text>;
                      })}
                    </svg>
                  </section>

                  <section className="rounded-xl border border-slate-200 bg-white p-4 xl:col-span-3" aria-labelledby="category-analytics-title">
                    <h3 id="category-analytics-title" className="mb-4 text-sm font-bold text-slate-800">By Category</h3>
                    <div className="space-y-3.5">
                      {categoryStats.map((item) => {
                        const percent = analyticsCases.length
                          ? Math.round((item.count / analyticsCases.length) * 100)
                          : 0;
                        return (
                        <div key={item.name}>
                          <div className="mb-1 flex items-center justify-between text-[11px]">
                            <span className="font-medium text-slate-700">{item.name}</span>
                            <span className="text-slate-500">{item.count} ({percent}%)</span>
                          </div>
                          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full rounded-full bg-[#b5264a]" style={{ width: `${percent}%` }} />
                          </div>
                        </div>
                        );
                      })}
                      {categoryStats.length === 0 && <p className="text-xs text-slate-500">No complaints in this period.</p>}
                    </div>
                  </section>

                  <section className="rounded-xl border border-slate-200 bg-white p-4 xl:col-span-4" aria-labelledby="desk-analytics-title">
                    <h3 id="desk-analytics-title" className="mb-2 text-sm font-bold text-slate-800">By Assigned Desk</h3>
                    <div className="divide-y divide-slate-100">
                      {analyticsDepartmentStats.map((department) => (
                        <div key={department.name} className="flex items-center gap-2.5 py-2.5 first:pt-1 last:pb-1">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                            <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[11px] font-semibold text-slate-700">{department.name}</p>
                          </div>
                          <span className="shrink-0 text-[10px] text-slate-500">{department.count}</span>
                        </div>
                      ))}
                      {analyticsDepartmentStats.length === 0 && (
                        <p className="py-2 text-xs text-slate-500">No assigned cases in this period.</p>
                      )}
                    </div>
                  </section>
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
                      {studentFilers.map((student) => (
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
                              Send Notice
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
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">Office of WMSU Notices</h2>
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
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Recipient (Student ID or WMSU email)</label>
                      <input
                        type="text"
                        value={noticeForm.recipient}
                        onChange={(e) => setNoticeForm({ ...noticeForm, recipient: e.target.value })}
                        placeholder="e.g. 2025-03461 or student@wmsu.edu.ph"
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
                  <p className="text-xs text-slate-500 mt-0.5">Configure database-backed intake and complaint SLA deadlines.</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-5 shadow-2xs">
                  {settingsError && (
                  <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-rose-50 p-3 text-xs text-rose-800">
                    <span>Unable to load settings: {settingsError}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSettingsError('');
                        setSettingsLoading(true);
                        setSettingsLoadAttempt((attempt) => attempt + 1);
                      }}
                      className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 font-semibold text-rose-800 hover:bg-rose-100"
                    >
                      Retry
                    </button>
                  </div>
                  )}
                  {/* Intake Gateway Control */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Public Grievance Intake Gateway</h4>
                      <p className="text-[11px] text-slate-500">Allow students to submit new grievance tickets via the student portal.</p>
                    </div>
                    <button
                      type="button"
                      disabled={settingsLoading || Boolean(settingsError)}
                      onClick={() => setIntakeOpen(!intakeOpen)}
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
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Standard Case SLA</label>
                        <input
                          type="number"
                          min="1"
                          max="720"
                          step="1"
                          value={slaHours}
                          onChange={(e) => setSlaHours(e.target.value)}
                          disabled={settingsLoading || Boolean(settingsError)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold"
                        />
                        <span className="text-[10px] text-slate-400">Hours for non-safety complaints (1–720)</span>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Safety Case SLA</label>
                        <input
                          type="number"
                          min="1"
                          max="720"
                          step="1"
                          value={urgentSlaHours}
                          onChange={(e) => setUrgentSlaHours(e.target.value)}
                          disabled={settingsLoading || Boolean(settingsError)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold"
                        />
                        <span className="text-[10px] text-slate-400">Hours for Safety and Security complaints (1–720)</span>
                      </div>
                    </div>
                  </div>

                  <p className="border-b border-slate-100 pb-4 text-[11px] text-slate-500">
                    Email delivery is not configured. Admin notices are delivered to students in their CampusCare portal inbox.
                  </p>

                  {settingsSaveError && (
                    <p role="alert" className="rounded-lg bg-rose-50 p-3 text-xs text-rose-800">
                      Settings were not saved: {settingsSaveError}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={handleSaveSettings}
                    disabled={settingsLoading || settingsSaving || Boolean(settingsError)}
                    className="px-4 py-2 bg-[#800020] hover:bg-[#68001a] text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer shadow-xs disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {settingsSaving ? 'Saving…' : 'Save Configuration Changes'}
                  </button>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
      {selectedDepartment && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedDepartment(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="department-cases-title"
            className="max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-7"
          >
            <div className="mb-4 flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#800020]">Department complaints</p>
                <h2 id="department-cases-title" className="mt-1 text-xl font-bold text-slate-900">{selectedDepartment}</h2>
              </div>
              <button
                type="button"
                autoFocus
                onClick={() => setSelectedDepartment(null)}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
            </div>
            <p className="mb-4 text-xs text-slate-500">Select a complaint to view its full details.</p>
            <div className="space-y-2">
              {cases
                .filter((caseItem) => caseItem.assignedDesk === selectedDepartment)
                .map((caseItem) => (
                  <button
                    key={caseItem.grievanceId}
                    type="button"
                    onClick={() => {
                      setSelectedDepartment(null);
                      openCaseDetails(caseItem);
                    }}
                    className="flex w-full items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left transition-colors hover:border-rose-200 hover:bg-rose-50/50"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-bold text-[#800020]">{caseItem.grievanceId}</span>
                      <span className="mt-1 block truncate text-sm font-semibold text-slate-800">{caseItem.type}</span>
                      <span className="mt-1 block text-xs text-slate-500">{caseItem.filer} · {caseItem.category}</span>
                    </span>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${caseItem.statusColor}`}>
                      {caseItem.status}
                    </span>
                  </button>
                ))}
            </div>
          </section>
        </div>
      )}
      {selectedCase && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedCase(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="complaint-details-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-7"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#800020]">Filed complaint · {selectedCase.grievanceId}</p>
                <h2 id="complaint-details-title" className="mt-1 text-xl font-bold text-slate-900">{selectedCase.type}</h2>
                <p className="mt-1 text-xs text-slate-500">{selectedCase.category}</p>
              </div>
              <button
                type="button"
                autoFocus
                onClick={() => setSelectedCase(null)}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
            </div>

            <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Filed by</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-800">{selectedCase.filer}</dd>
                <dd className="text-xs text-slate-500">{selectedCase.studentId} · {selectedCase.recipientEmail}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Submitted</dt>
                <dd className="mt-1 text-sm text-slate-700">
                  {selectedCase.submittedAt
                    ? new Date(selectedCase.submittedAt).toLocaleString()
                    : 'Date unavailable'}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Status</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-700">{selectedCase.status}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Assigned desk</dt>
                <dd className="mt-1 text-sm text-slate-700">{selectedCase.assignedDesk}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Location</dt>
                <dd className="mt-1 text-sm text-slate-700">{selectedCase.location || 'Not provided'}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Complaint details</dt>
                <dd className="mt-1 whitespace-pre-wrap break-words rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
                  {selectedCase.description || 'No details provided.'}
                </dd>
              </div>
              {selectedCase.attachment?.data && (
                <div className="sm:col-span-2">
                  <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Attached image</dt>
                  <dd className="mt-2">
                    <a
                      href={selectedCase.attachment.data}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex max-h-80 max-w-full overflow-hidden rounded-xl border border-slate-200"
                    >
                      <img
                        src={selectedCase.attachment.data}
                        alt={selectedCase.attachment.name || 'Complaint attachment'}
                        className="max-h-80 max-w-full object-contain"
                      />
                    </a>
                    <p className="mt-1 text-xs text-slate-500">{selectedCase.attachment.name || 'Complaint attachment'}</p>
                  </dd>
                </div>
              )}
            </dl>
            <section className="mt-6 border-t border-slate-100 pt-5">
              <h3 className="text-sm font-bold text-slate-900">Responses &amp; activity</h3>
              <p className="mt-1 text-xs text-slate-500">
                Status changes, office responses, and resolution notes are saved to this case history.
              </p>
              <ol className="mt-4 max-h-64 space-y-3 overflow-y-auto">
                {complaintActivity.complaintId !== selectedCase.grievanceId ? (
                  <li className="text-xs text-slate-500">Loading complaint activity…</li>
                ) : complaintActivity.error ? (
                  <li role="alert" className="text-xs text-rose-700">{complaintActivity.error}</li>
                ) : complaintActivity.activity.length ? (
                  complaintActivity.activity.map((activity) => (
                    <li key={activity.id} className="rounded-xl bg-slate-50 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-semibold capitalize text-slate-800">
                          {activity.type === 'resolution' ? 'Resolution note' : activity.type}
                          {' · '}{activity.actor}
                        </span>
                        <time className="text-[10px] text-slate-500" dateTime={activity.createdAt}>
                          {new Date(activity.createdAt).toLocaleString()}
                        </time>
                      </div>
                      <p className="mt-1 whitespace-pre-wrap break-words text-xs leading-relaxed text-slate-700">
                        {activity.message}
                      </p>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-slate-500">No activity has been recorded yet.</li>
                )}
              </ol>
              {selectedCase.status !== 'Withdrawn' && (
                <div className="mt-4 space-y-3">
                  <label className="block text-xs font-semibold text-slate-700" htmlFor="complaint-response">
                    Add a response for the student
                    <textarea
                      id="complaint-response"
                      value={responseMessage}
                      onChange={(event) => setResponseMessage(event.target.value)}
                      maxLength={3000}
                      rows={3}
                      placeholder="Write an update or response about this complaint…"
                      className="mt-1 w-full resize-y rounded-xl border border-slate-200 p-3 text-sm font-normal text-slate-800 focus:border-[#800020] focus:outline-none focus:ring-2 focus:ring-[#800020]/15"
                    />
                    <span className="mt-1 block text-right text-[10px] font-normal text-slate-500">
                      {responseMessage.length}/3000
                    </span>
                  </label>
                  <button
                    type="button"
                    disabled={activitySaving || !responseMessage.trim()}
                    onClick={handleSendComplaintResponse}
                    className="rounded-lg bg-[#800020] px-3 py-2 text-xs font-semibold text-white hover:bg-[#66001a] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {activitySaving ? 'Saving…' : 'Add response'}
                  </button>
                  {!['Resolved', 'Withdrawn'].includes(selectedCase.status) && (
                    <label className="block text-xs font-semibold text-slate-700" htmlFor="complaint-resolution-note">
                      Resolution note (required to resolve)
                      <textarea
                        id="complaint-resolution-note"
                        value={resolutionNote}
                        onChange={(event) => setResolutionNote(event.target.value)}
                        maxLength={3000}
                        rows={3}
                        placeholder="Describe the action taken and outcome…"
                        className="mt-1 w-full resize-y rounded-xl border border-slate-200 p-3 text-sm font-normal text-slate-800 focus:border-[#800020] focus:outline-none focus:ring-2 focus:ring-[#800020]/15"
                      />
                      <span className="mt-1 block text-right text-[10px] font-normal text-slate-500">
                        {resolutionNote.length}/3000
                      </span>
                    </label>
                  )}
                  {!['Resolved', 'Withdrawn'].includes(selectedCase.status) && (
                    <button
                      type="button"
                      disabled={activitySaving || !resolutionNote.trim()}
                      onClick={() => handleUpdateComplaintStatus(selectedCase.id, 'Resolved', resolutionNote)}
                      className="ml-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Resolve with note
                    </button>
                  )}
                  {activityError && <p role="alert" className="text-xs text-rose-700">{activityError}</p>}
                </div>
              )}
            </section>
          </section>
        </div>
      )}
      {logoutConfirmationOpen && (
        <LogoutConfirmation
          onCancel={() => setLogoutConfirmationOpen(false)}
          onConfirm={onLogout}
        />
      )}
    </div>
  );
}
