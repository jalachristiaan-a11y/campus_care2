const STORAGE_KEY = 'campuscare.grievances';

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
    attachment: formData.attachment ?? null,
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([grievance, ...grievances]));
  return grievance;
}
