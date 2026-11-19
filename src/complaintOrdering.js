const terminalComplaintStatuses = new Set([
  'Resolved',
  'Rejected',
  'Withdrawn',
  'Closed',
]);

export const compareOpenComplaintsFirst = (left, right) => (
  Number(terminalComplaintStatuses.has(left.status))
  - Number(terminalComplaintStatuses.has(right.status))
);
