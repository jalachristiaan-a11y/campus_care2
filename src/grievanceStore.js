const STORAGE_KEY = 'campuscare.grievances';
const STUDENT_MESSAGES_KEY = 'campuscare.student-messages';

export function getGrievances() {
  const storedGrievances = window.localStorage.getItem(STORAGE_KEY);
  if (storedGrievances === null) {
    return [];
  }

  const grievances = JSON.parse(storedGrievances);
  if (!Array.isArray(grievances)) {
    throw new Error('Saved grievance data is invalid. Clear the CampusCare grievance data and try again.');
  }

  return grievances;
}

export function getStudentMessages() {
  const storedMessages = window.localStorage.getItem(STUDENT_MESSAGES_KEY);
  if (storedMessages === null) {
    return [];
  }

  const messages = JSON.parse(storedMessages);
  if (!Array.isArray(messages)) {
    throw new Error('Saved student message data is invalid. Clear the CampusCare message data and try again.');
  }

  return messages;
}

export function saveStudentMessage(message) {
  const messages = getStudentMessages();
  const savedMessage = {
    ...message,
    id: message.id || `NOT-${Date.now()}`,
    sentAt: message.sentAt || new Date().toISOString(),
  };

  window.localStorage.setItem(STUDENT_MESSAGES_KEY, JSON.stringify([savedMessage, ...messages]));
  window.dispatchEvent(new CustomEvent('campuscare:messages-updated'));
  return savedMessage;
}

export function saveGrievance(formData, user = {}) {
  const grievances = getGrievances();
  const now = new Date();
  const grievance = {
    id: `CMP-${now.getFullYear()}-${now.getTime()}`,
    category: formData.category,
    title: formData.title.trim(),
    description: formData.description.trim(),
    status: 'Under Review',
    statusClass: 'review',
    department: 'Awaiting assignment',
    updated: 'Submitted just now',
    isDownload: false,
    location: formData.location.trim(),
    submittedAt: now.toISOString(),
    submittedBy: user.universityEmail ?? '',
    submittedByName: user.fullName ?? '',
    studentId: user.studentId ?? '',
    attachment: formData.attachment ?? null,
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([grievance, ...grievances]));
  return grievance;
}

export function resolveGrievance(grievanceId) {
  const grievances = getGrievances();
  const grievanceIndex = grievances.findIndex((item) => item.id === grievanceId);

  if (grievanceIndex === -1) {
    return null;
  }

  const now = new Date();
  const resolvedGrievance = {
    ...grievances[grievanceIndex],
    status: 'Resolved',
    statusClass: 'closed',
    updated: 'Resolved just now',
    resolvedAt: now.toISOString(),
  };
  const updatedGrievances = [...grievances];
  updatedGrievances[grievanceIndex] = resolvedGrievance;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedGrievances));
  window.dispatchEvent(new CustomEvent('campuscare:grievances-updated'));

  return resolvedGrievance;
}
