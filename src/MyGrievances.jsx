import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, FileText, Send } from 'lucide-react';
import './MyGrievances.css';
import SubmitGrievance from './SubmitGrievance.jsx';
import { apiRequest } from './apiClient.js';
import useScrollReveal from './useScrollReveal.js';

const formatDate = (dateValue) => {
  if (!dateValue) {
    return 'Date not available';
  }

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return 'Date not available';
  }

  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

const formatDateTime = (dateValue) => {
  if (!dateValue || Number.isNaN(new Date(dateValue).getTime())) return 'Date unavailable';
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(dateValue));
};

function TicketTracking({
  grievance,
  activity,
  activityLoading,
  activityError,
  updateConfirmation,
  onBack,
  onSubmitInformation,
  submittingInformation,
  informationError,
}) {
  const [additionalInformation, setAdditionalInformation] = useState('');
  const terminalStep = {
    'Need More Information': 'Need More Info',
    Rejected: 'Rejected',
    Withdrawn: 'Withdrawn',
    Closed: 'Closed',
  }[grievance.status] || 'Resolved';
  const statusSteps = ['Submitted', 'Under Review', 'In Progress', terminalStep];
  const progressIndex = {
    'Under Review': 1,
    'Need More Information': 1,
    'In Progress': 2,
    Resolved: 3,
    Closed: 3,
    Rejected: 3,
    Withdrawn: 3,
  }[grievance.status] ?? 0;
  const isTerminal = ['Resolved', 'Rejected', 'Withdrawn', 'Closed'].includes(grievance.status);

  return (
    <section className="complaint-detail-view" data-scroll-reveal>
      <div className="complaint-window">
        <header className="complaint-topbar">
          <div className="complaint-brand-block">
            <span className="complaint-brand">CAMPUSCARE<br />STUDENT PORTAL</span>
          </div>
        </header>

        <div className="complaint-body-shell">
          <div className="complaint-page-header">
            <button type="button" className="breadcrumb-back" onClick={onBack}>
              <ArrowLeft size={14} aria-hidden="true" />
              <span>My Grievances</span>
            </button>
            <span className="breadcrumb-divider">&gt;</span>
            <span className="breadcrumb-current">{grievance.id}</span>
          </div>

          <div className="complaint-panel">
            <div className="complaint-panel-header">
              <div>
                <span className="complaint-panel-kicker">Complaint · {grievance.id}</span>
                <h1>{grievance.title || 'Untitled complaint'}</h1>
              </div>
              <div className="complaint-meta-row">
                <span className="complaint-date">Submitted {formatDateTime(grievance.submittedAt)}</span>
              </div>
            </div>

            <div className="complaint-status-block">
              <div className="complaint-status-header">
                <span className={`status-tag ${grievance.statusClass || ''}`}>{grievance.status}</span>
                <span className="status-last-updated">{grievance.updated || 'Status update pending'}</span>
              </div>

              <div className="status-track" aria-label={`Complaint progress: ${grievance.status}`}>
                {statusSteps.map((step, index) => (
                  <span
                    key={step}
                    className={`status-track-segment${index <= progressIndex ? ' active' : ''}`}
                  />
                ))}
              </div>

              <div className="status-labels" aria-label="Status labels">
                {statusSteps.map((step, index) => (
                  <span
                    className={`status-pill${index < progressIndex ? ' ok' : index === progressIndex ? ' current' : ''}`}
                    key={step}
                  >
                    {step}
                  </span>
                ))}
              </div>
              {grievance.status === 'Need More Information' && (
                <p className="tracking-info-request">The administrator requested additional information. Reply below to continue the review.</p>
              )}
              {grievance.status === 'Rejected' && (
                <p className="tracking-terminal-message">This complaint was rejected. Review the history below for the administrator’s explanation.</p>
              )}
              {grievance.status === 'Withdrawn' && (
                <p className="tracking-terminal-message">You withdrew this complaint; it is no longer being processed.</p>
              )}
            </div>

            <div className="complaint-grid">
              <div className="complaint-fields">
                {[
                  ['Complaint ID', grievance.id],
                  ['Category', grievance.category || 'Not specified'],
                  ['Email', grievance.submittedBy || 'Not available'],
                  ['Assigned Department', grievance.department || 'Awaiting assignment'],
                  ['Campus Location', grievance.location || 'Not provided'],
                  ['Submission Date', formatDateTime(grievance.submittedAt)],
                ].map(([label, value]) => (
                  <div className="field-row" key={label}>
                    <span className="field-label">{label}</span>
                    <span className="field-value">{value}</span>
                  </div>
                ))}
              </div>

              <div className="complaint-story-block">
                <div className="complaint-story-header">
                  <span className="story-author">{grievance.submittedByName || 'Student'}</span>
                  <span className="story-badge">{grievance.status}</span>
                </div>
                <div className="complaint-story-title">Complaint description</div>
                <div className="complaint-story-body">
                  <p>{grievance.description || 'No description was provided.'}</p>
                </div>

                <div className="attachment-block">
                  <div className="attachment-header">
                    <span>Supporting evidence</span>
                    <span>{grievance.attachment?.name ? '1 attachment' : 'No attachments'}</span>
                  </div>
                  <div className="attachment-list">
                    {grievance.attachment?.data ? (
                      <a
                        className="attachment-card"
                        href={grievance.attachment.data}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <span className="attachment-thumb"><FileText size={20} aria-hidden="true" /></span>
                        <span>{grievance.attachment.name || 'Open attachment'}</span>
                      </a>
                    ) : (
                      <p className="tracking-empty">No supporting evidence was submitted.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <section className="tracking-history" aria-labelledby="tracking-history-title">
              <h2 id="tracking-history-title">Status history &amp; administrator remarks</h2>
              {activityLoading ? (
                <p className="tracking-empty" role="status">Loading complaint history…</p>
              ) : activityError ? (
                <p className="tracking-error" role="alert">{activityError}</p>
              ) : activity.length ? (
                <ol className="tracking-activity-list">
                  {activity.map((item) => (
                    <li key={item.id}>
                      <div>
                        <strong>{item.type.replaceAll('_', ' ')}</strong>
                        <span>{item.actor}</span>
                      </div>
                      <p>{item.message}</p>
                      <time dateTime={item.createdAt}>{formatDateTime(item.createdAt)}</time>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="tracking-empty">No activity has been recorded yet.</p>
              )}

              {grievance.status === 'Need More Information' && !isTerminal && (
                <form
                  className="tracking-additional-info"
                  onSubmit={(event) => {
                    event.preventDefault();
                    onSubmitInformation(additionalInformation).then((submitted) => {
                      if (submitted) setAdditionalInformation('');
                    });
                  }}
                >
                  <label htmlFor="student-additional-information">Your additional information</label>
                  <textarea
                    id="student-additional-information"
                    value={additionalInformation}
                    onChange={(event) => setAdditionalInformation(event.target.value)}
                    maxLength={3000}
                    rows={4}
                    required
                    placeholder="Provide the information requested by the administrator…"
                  />
                  {informationError && <p className="tracking-error" role="alert">{informationError}</p>}
                  <button type="submit" disabled={submittingInformation || !additionalInformation.trim()}>
                    <Send size={15} aria-hidden="true" />
                    {submittingInformation ? 'Sending…' : 'Send information'}
                  </button>
                </form>
              )}
            </section>
          </div>
        </div>
      </div>

      {updateConfirmation && (
        <p className="ticket-tracking-update-success" role="status">
          Your complaint information was updated successfully.
        </p>
      )}
    </section>
  );
}

export default function MyGrievances({
  grievances,
  onNewGrievance,
  onUpdateGrievance,
  onWithdrawGrievance,
  onComplaintStatusUpdate,
}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [trackedGrievance, setTrackedGrievance] = useState(null);
  const [editingGrievance, setEditingGrievance] = useState(null);
  const [updateConfirmation, setUpdateConfirmation] = useState(false);
  const [withdrawingId, setWithdrawingId] = useState('');
  const [withdrawalError, setWithdrawalError] = useState({ id: '', message: '' });
  const [complaintActivity, setComplaintActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState('');
  const [submittingInformation, setSubmittingInformation] = useState(false);
  const [informationError, setInformationError] = useState('');
  const trackedGrievanceId = trackedGrievance?.id;
  useScrollReveal(`${trackedGrievanceId || editingGrievance?.id || statusFilter}:${grievances.length}`);

  const openTracking = (grievance) => {
    setActivityLoading(true);
    setActivityError('');
    setComplaintActivity([]);
    setTrackedGrievance(grievance);
  };

  useEffect(() => {
    if (!trackedGrievanceId) return undefined;
    let active = true;
    apiRequest(`/api/complaints/${encodeURIComponent(trackedGrievanceId)}/activity`)
      .then((result) => {
        if (active) setComplaintActivity(result.activity);
      })
      .catch((error) => {
        if (active) {
          setActivityError(error instanceof Error ? error.message : 'Unable to load complaint history.');
        }
      })
      .finally(() => {
        if (active) setActivityLoading(false);
      });

    return () => {
      active = false;
    };
  }, [trackedGrievanceId]);

  const handleSubmitAdditionalInformation = async (message) => {
    if (!trackedGrievance || !message.trim()) return false;
    setSubmittingInformation(true);
    setInformationError('');
    try {
      const result = await apiRequest(
        `/api/complaints/${encodeURIComponent(trackedGrievance.id)}/responses`,
        {
          method: 'POST',
          body: JSON.stringify({ message: message.trim() }),
        },
      );
      setTrackedGrievance(result.complaint);
      setComplaintActivity((previous) => [...previous, result.activity]);
      onComplaintStatusUpdate?.(result.complaint);
      return true;
    } catch (error) {
      setInformationError(
        error instanceof Error ? error.message : 'Unable to submit additional information.',
      );
      return false;
    } finally {
      setSubmittingInformation(false);
    }
  };

  const departments = useMemo(
    () => [...new Set(grievances.map((grievance) => grievance.category))],
    [grievances],
  );

  const activeCount = grievances.filter(
    (grievance) => !['closed', 'withdrawn', 'rejected'].includes(grievance.statusClass),
  ).length;

  const filteredGrievances = grievances.filter((grievance) => {
    const searchText = `${grievance.id} ${grievance.title} ${grievance.category} ${grievance.department}`.toLowerCase();
    const matchesSearch = searchText.includes(search.trim().toLowerCase());
    const matchesStatus = statusFilter === 'All'
      || (statusFilter === 'Active' && !['closed', 'withdrawn', 'rejected'].includes(grievance.statusClass))
      || (statusFilter === 'Resolved' && grievance.status === 'Resolved')
      || (statusFilter === 'Withdrawn' && grievance.statusClass === 'withdrawn')
      || grievance.status === statusFilter;
    const matchesDepartment = departmentFilter === 'All'
      || grievance.category === departmentFilter;

    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const handleWithdraw = async (grievance) => {
    const confirmed = window.confirm(
      `Withdraw ${grievance.id}? This cannot be undone, and the complaint will no longer be processed.`,
    );
    if (!confirmed) return;

    setWithdrawingId(grievance.id);
    setWithdrawalError({ id: '', message: '' });
    try {
      await onWithdrawGrievance(grievance.id);
    } catch (error) {
      setWithdrawalError({
        id: grievance.id,
        message: error instanceof Error ? error.message : 'Unable to withdraw this grievance.',
      });
    } finally {
      setWithdrawingId('');
    }
  };

  if (editingGrievance) {
    return (
      <SubmitGrievance
        editingGrievance={editingGrievance}
        onCancel={() => setEditingGrievance(null)}
        onSubmit={(formData) => onUpdateGrievance(editingGrievance.id, formData)}
        onUpdateSuccess={(updatedGrievance) => {
          openTracking(updatedGrievance);
          setEditingGrievance(null);
          setUpdateConfirmation(true);
        }}
      />
    );
  }

  if (trackedGrievance) {
    return (
      <TicketTracking
        grievance={trackedGrievance}
        activity={complaintActivity}
        activityLoading={activityLoading}
        activityError={activityError}
        updateConfirmation={updateConfirmation}
        onSubmitInformation={handleSubmitAdditionalInformation}
        submittingInformation={submittingInformation}
        informationError={informationError}
        onBack={() => {
          setTrackedGrievance(null);
          setUpdateConfirmation(false);
          setInformationError('');
          setActivityLoading(false);
        }}
      />
    );
  }

  return (
    <section className="my-grievances">
      <header className="my-grievances-heading" data-scroll-reveal>
        <div>
          <span className="my-grievances-eyebrow">CASE TRANSPARENCY HUB</span>
          <h1>My Grievances</h1>
          <p>View your submitted cases and their current status.</p>
        </div>
        <div className="my-grievances-count">
          <strong>{activeCount}</strong>
          <span>Active cases</span>
        </div>
      </header>

      <div className="grievance-filters" data-scroll-reveal>
        <label className="grievance-search">
          <span className="visually-hidden">Search grievances</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by ticket ID, keyword, or department..."
          />
        </label>
        <label className="grievance-filter">
          <span>Status</span>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option>All</option>
            <option>Active</option>
            <option>Need More Information</option>
            <option>In Progress</option>
            <option>Resolved</option>
            <option>Rejected</option>
            <option>Withdrawn</option>
            <option>Closed</option>
          </select>
        </label>
        <label className="grievance-filter">
          <span>Department</span>
          <select value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value)}>
            <option>All</option>
            {departments.map((department) => (
              <option key={department}>{department}</option>
            ))}
          </select>
        </label>
      </div>

      {filteredGrievances.length ? (
        <div className="my-grievance-list">
          {filteredGrievances.map((grievance, index) => (
            <article
              className="my-grievance-card"
              data-scroll-reveal
              data-interactive-card
              style={{ '--reveal-delay': `${Math.min(index, 4) * 55}ms` }}
              key={grievance.id}
            >
              <div className="my-grievance-card-top">
                <span className="my-grievance-id">{grievance.id}</span>
                    <span className="my-grievance-category">{grievance.category}</span>
              </div>
              <h2>{grievance.title}</h2>
              <p className="my-grievance-description">{grievance.description}</p>
              {grievance.location && (
                <p className="my-grievance-location">Location: {grievance.location}</p>
              )}
              <div className="my-grievance-card-bottom">
                <div>
                  <span className={`my-grievance-status ${grievance.statusClass}`}>
                    {grievance.status}
                  </span>
                  <span className="my-grievance-department">{grievance.department}</span>
                  <span className="my-grievance-date">
                    {formatDate(grievance.submittedAt)}
                  </span>
                </div>
                {grievance.updated && <span className="my-grievance-updated">{grievance.updated}</span>}
              </div>
              <button
                type="button"
                className="my-grievance-track-button"
                onClick={() => openTracking(grievance)}
              >
                Track Ticket
              </button>
              {grievance.status === 'Under Review' && (
                <div className="my-grievance-actions">
                  <button
                    type="button"
                    className="my-grievance-edit-button"
                    onClick={() => setEditingGrievance(grievance)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="my-grievance-withdraw-button"
                    disabled={withdrawingId === grievance.id}
                    onClick={() => handleWithdraw(grievance)}
                  >
                    {withdrawingId === grievance.id ? 'Withdrawing…' : 'Withdraw'}
                  </button>
                </div>
              )}
              {withdrawalError.id === grievance.id && (
                <p className="my-grievance-action-error" role="alert">
                  {withdrawalError.message}
                </p>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="my-grievances-empty">
          <h2>No matching grievances</h2>
          <p>Try changing your search or filters, or submit a new grievance.</p>
          <button type="button" onClick={onNewGrievance}>File New Grievance</button>
        </div>
      )}
    </section>
  );
}
