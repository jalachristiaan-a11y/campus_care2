export const URGENCY_LEVELS = [
  { value: 1, label: 'Low', description: 'Routine issue; no immediate impact' },
  { value: 2, label: 'Moderate', description: 'Needs attention, but can wait' },
  { value: 3, label: 'High', description: 'Significant impact; needs prompt attention' },
  { value: 4, label: 'Urgent', description: 'Severe or time-sensitive concern' },
];

export const getUrgencyLevel = (value) => (
  URGENCY_LEVELS.find((level) => level.value === Number(value)) || URGENCY_LEVELS[0]
);
