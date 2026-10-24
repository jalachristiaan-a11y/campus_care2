import { useEffect, useState } from 'react';
import { ArrowRight, Check, CheckCheck, Clock3, Copy, Folder, X } from 'lucide-react';
import './ConfirmationModal.css';

export default function ConfirmationModal({
  mode = 'confirmation',
  ticketId,
  assignedDepartment,
  ticketStatus,
  statusClass,
  onClose,
  onViewTickets,
  onReturnDashboard,
}) {
  const [copyStatus, setCopyStatus] = useState('');

  useEffect(() => {
    if (copyStatus !== 'Copied!') {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setCopyStatus(''), 2000);
    return () => window.clearTimeout(timeoutId);
  }, [copyStatus]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(ticketId.replace(/^#/, ''));
      setCopyStatus('Copied!');
    } catch {
      setCopyStatus('Unable to copy');
    }
  };

  const departmentCouncil = assignedDepartment.endsWith('Council')
    ? assignedDepartment
    : `${assignedDepartment} Council`;
  const isTracking = mode === 'tracking';

  return (
    <div
      className="confirmation-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <section
        className="confirmation-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-title"
        aria-describedby="confirmation-description"
      >
        <button
          type="button"
          className="confirmation-close"
          onClick={onClose}
          aria-label="Close confirmation"
        >
          <X size={18} aria-hidden="true" />
        </button>

        <div className={`confirmation-success-icon${isTracking ? ' confirmation-tracking-icon' : ''}`} aria-hidden="true">
          {isTracking && statusClass !== 'closed'
            ? <Clock3 size={27} strokeWidth={2.5} />
            : <Check size={29} strokeWidth={2.5} />}
        </div>
        <div className={`confirmation-status${isTracking ? ` tracking ${statusClass}` : ''}`}>
          <span className="confirmation-status-dot" />
          {isTracking ? ticketStatus : 'Submission Confirmed'}
        </div>

        <h2 id="confirmation-title">
          {isTracking ? 'Ticket Status' : 'Grievance Submitted Successfully!'}
        </h2>
        <p id="confirmation-description" className="confirmation-description">
          {isTracking
            ? <>Track the current review of your grievance filed with the <strong>{departmentCouncil}</strong>.</>
            : <>Your report has been securely filed with the <strong>{departmentCouncil}</strong>. An official case tracking ticket has been generated.</>}
        </p>

        <div className="confirmation-ticket">
          <div className="confirmation-ticket-header">
            <div>
              <span className="confirmation-ticket-label">TICKET IDENTIFIER</span>
              <strong className="confirmation-ticket-id">{ticketId}</strong>
            </div>
            <button
              type="button"
              className="confirmation-copy-button"
              onClick={handleCopy}
              aria-label="Copy ticket ID"
            >
              {copyStatus === 'Copied!' ? (
                <CheckCheck size={15} aria-hidden="true" />
              ) : (
                <Copy size={15} aria-hidden="true" />
              )}
              <span>{copyStatus || 'Copy ID'}</span>
            </button>
          </div>

          <div className="confirmation-details">
            <div className="confirmation-detail">
              <span className="confirmation-detail-label">Assigned Body</span>
              <span className="confirmation-detail-value">
                <Folder size={15} aria-hidden="true" />
                {assignedDepartment}
              </span>
            </div>
            <div className="confirmation-detail">
              <span className="confirmation-detail-label">Evaluation SLA</span>
              <span className="confirmation-detail-value confirmation-sla">
                <Clock3 size={15} aria-hidden="true" />
                Within 48 hours
              </span>
            </div>
          </div>
          {copyStatus === 'Unable to copy' && (
            <span className="confirmation-copy-error" role="status">
              Clipboard access is unavailable in this browser.
            </span>
          )}
        </div>

        <div className="confirmation-actions">
          <button
            type="button"
            className="confirmation-secondary-button"
            onClick={isTracking ? onClose : onReturnDashboard}
          >
            {isTracking ? 'Back to My Grievances' : 'Return to Dashboard'}
          </button>
          {!isTracking && (
            <button
              type="button"
              className="confirmation-primary-button"
              onClick={onViewTickets}
            >
              <span>View in My Tickets</span>
              <ArrowRight size={18} strokeWidth={2.5} aria-hidden="true" />
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
