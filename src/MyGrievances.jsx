import { useEffect, useMemo, useState } from 'react';
import './MyGrievances.css';
import SubmitGrievance from './SubmitGrievance.jsx';
import { apiRequest } from './apiClient.js';

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

function TicketTracking({ grievance, onBack, token }) {
  const [activityState, setActivityState] = useState({ complaintId: '', activity: [], error: '' });
  const isUnderReview = grievance.statusClass === 'review';
  const isInProgress = grievance.statusClass === 'progress';
  const isResolved = grievance.statusClass === 'closed';
  const isWithdrawn = grievance.statusClass === 'withdrawn';
  const steps = [
    {
      title: 'Ticket submitted',
      description: 'Your grievance was received by CampusCare.',
      complete: true,
    },
    {
      title: 'Under review',
      description: isUnderReview
        ? 'Your grievance is being reviewed.'
        : 'The review stage has been completed.',
      complete: !isUnderReview,
      current: isUnderReview,
    },
    {
      title: 'In progress',
      description: isInProgress
        ? 'The assigned department is working on your grievance.'
        : isResolved
          ? 'The department completed its work on your grievance.'
          : 'This step will begin after review.',
      complete: isResolved,
      current: isInProgress,
      upcoming: !isInProgress && !isResolved,
    },
    {
      title: 'Resolved',
      description: isResolved
        ? grievance.status
        : 'A resolution has not been recorded yet.',
      complete: isResolved,
      current: isResolved,
      upcoming: !isResolved,
    },
  ];

  useEffect(() => {
    let active = true;
    apiRequest(`/api/complaints/${encodeURIComponent(grievance.id)}/activity`, token)
      .then((result) => {
        if (active) {
          setActivityState({
            complaintId: grievance.id,
            activity: result.activity,
            error: '',
          });
        }
      })
      .catch((error) => {
        if (active) {
          setActivityState({
            complaintId: grievance.id,
            activity: [],
            error: error instanceof Error ? error.message : 'Unable to load case responses.',
          });
        }
      });

    return () => {
      active = false;
    };
  }, [grievance.id, token]);

  return (
    <section className="ticket-tracking">
      <button type="button" className="ticket-tracking-back" onClick={onBack}>
        &larr; Back to My Grievances
      </button>

      <header className="ticket-tracking-heading">
        <div>
          <span className="my-grievances-eyebrow">CASE TRANSPARENCY HUB</span>
          <h1>Ticket Tracking</h1>
          <p>Follow the latest status of your grievance.</p>
        </div>
        <span className={`ticket-tracking-current-status ${grievance.statusClass}`}>
          {grievance.status}
        </span>
      </header>

      <div className="ticket-tracking-grid">
        <article className="ticket-tracking-panel ticket-tracking-summary">
          <span className="ticket-tracking-label">TICKET IDENTIFIER</span>
          <h2>{grievance.id}</h2>
          <h3>{grievance.title}</h3>
          <p>{grievance.description}</p>
          <dl>
            <div>
              <dt>Category</dt>
              <dd>{grievance.category}</dd>
            </div>
            <div>
              <dt>Assigned department</dt>
              <dd>{grievance.department}</dd>
            </div>
            <div>
              <dt>Date submitted</dt>
              <dd>{formatDate(grievance.submittedAt)}</dd>
            </div>
            {grievance.location && (
              <div>
                <dt>Location</dt>
                <dd>{grievance.location}</dd>
              </div>
            )}
          </dl>
          {grievance.attachment && (
            <div className="ticket-tracking-attachment">
              <h3>Attached picture</h3>
              <a href={grievance.attachment.data} target="_blank" rel="noreferrer">
                <img
                  src={grievance.attachment.data}
                  alt={`Attachment for ${grievance.title}`}
                />
              </a>
              <span>{grievance.attachment.name}</span>
            </div>
          )}
        </article>

        <article className="ticket-tracking-panel ticket-tracking-progress">
          <h2>Progress</h2>
          {isWithdrawn ? (
            <p className="ticket-tracking-updated">
              This grievance was withdrawn and will not be processed further.
            </p>
          ) : (
            <ol className="ticket-tracking-timeline">
              {steps.map((step) => (
                <li
                  key={step.title}
                  className={[
                    step.complete ? 'complete' : '',
                    step.current ? 'current' : '',
                    step.upcoming ? 'upcoming' : '',
                  ].filter(Boolean).join(' ')}
                >
                  <span className="ticket-tracking-marker" aria-hidden="true" />
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                    {step.title === 'Ticket submitted' && grievance.submittedAt && (
                      <time dateTime={grievance.submittedAt}>
                        {formatDate(grievance.submittedAt)}
                      </time>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
          {grievance.updated && (
            <p className="ticket-tracking-updated">
              Latest update: {grievance.updated}
            </p>
          )}
        </article>
      </div>
      <article className="ticket-tracking-panel ticket-tracking-activity">
        <h2>Responses &amp; case history</h2>
        {activityState.complaintId !== grievance.id ? (
          <p>Loading case history…</p>
        ) : activityState.error ? (
          <p className="ticket-tracking-activity-error" role="alert">{activityState.error}</p>
        ) : activityState.activity.length ? (
          <ol>
            {activityState.activity.map((activity) => (
              <li key={activity.id}>
                <div>
                  <strong>
                    {activity.type === 'resolution' ? 'Resolution note' : activity.type}
                    {' · '}{activity.actor}
                  </strong>
                  <time dateTime={activity.createdAt}>
                    {new Date(activity.createdAt).toLocaleString()}
                  </time>
                </div>
                <p>{activity.message}</p>
              </li>
            ))}
          </ol>
        ) : (
          <p>No responses or updates have been recorded yet.</p>
        )}
      </article>
    </section>
  );
}

export default function MyGrievances({
  grievances,
  token,
  onNewGrievance,
  onUpdateGrievance,
  onWithdrawGrievance,
}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [trackedGrievance, setTrackedGrievance] = useState(null);
  const [editingGrievance, setEditingGrievance] = useState(null);
  const [withdrawingId, setWithdrawingId] = useState('');
  const [withdrawalError, setWithdrawalError] = useState({ id: '', message: '' });

  const departments = useMemo(
    () => [...new Set(grievances.map((grievance) => grievance.category))],
    [grievances],
  );

  const activeCount = grievances.filter(
    (grievance) => !['closed', 'withdrawn'].includes(grievance.statusClass),
  ).length;

  const filteredGrievances = grievances.filter((grievance) => {
    const searchText = `${grievance.id} ${grievance.title} ${grievance.category} ${grievance.department}`.toLowerCase();
    const matchesSearch = searchText.includes(search.trim().toLowerCase());
    const matchesStatus = statusFilter === 'All'
      || (statusFilter === 'Active' && !['closed', 'withdrawn'].includes(grievance.statusClass))
      || (statusFilter === 'Resolved' && grievance.statusClass === 'closed')
      || (statusFilter === 'Withdrawn' && grievance.statusClass === 'withdrawn');
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
      />
    );
  }

  if (trackedGrievance) {
    return (
      <TicketTracking
        grievance={trackedGrievance}
        token={token}
        onBack={() => setTrackedGrievance(null)}
      />
    );
  }

  return (
    <section className="my-grievances">
      <header className="my-grievances-heading">
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

      <div className="grievance-filters">
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
            <option>Resolved</option>
            <option>Withdrawn</option>
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
          {filteredGrievances.map((grievance) => (
            <article className="my-grievance-card" key={grievance.id}>
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
                onClick={() => setTrackedGrievance(grievance)}
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
