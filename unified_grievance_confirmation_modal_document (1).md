# Grievance Confirmation Modal — Implementation & Architectural Overview

This document provides both the complete single-file React component (with embedded CSS) for the **CampusCare Grievance Confirmation Modal** and a detailed structural overview of its design system, state management, and component architecture.

---

## 1. Component Overview & Architecture

### **Target Goal**
Replicate the design and interaction pattern of the submission confirmation modal from the **CampusCare Portal**. The modal presents feedback to the user upon successfully submitting a grievance ticket.

### **Component Architecture & Hierarchy**

* **`ConfirmationModal`** (Main Container Component)
  * **Backdrop & Overlay:** Semi-transparent dark background (`rgba(15, 23, 42, 0.45)`) with blurred backdrop filtering (`backdrop-filter: blur(8px)`).
  * **Modal Card Container:** White rounded card container with entrance animation (`modalPopIn`), fixed maximum width (`480px`), and depth shadow.
    * **Close Action:** Top-right close button icon (`×`).
    * **Status Badges:**
      * Green circular checkmark badge with soft outer glow ring.
      * Status pill badge (`• Submission Confirmed`).
    * **Heading & Description:** Clear confirmation heading and dynamic text highlighting the assigned department (*Academic Affairs Council*).
    * **Ticket Information Summary Box:**
      * **Ticket Identifier:** `#CMP-2026-0042` with an inline **Copy ID** clipboard trigger.
      * **Metadata Grid:**
        * Assigned Body (*Academic Affairs* with folder icon).
        * Service Level Agreement (*Within 48 hours* highlighted in green with clock icon).
    * **Action Footer:** Dual CTA button set:
      * Secondary outline action (`Return to Dashboard`).
      * Primary brand action (`View in My Tickets →` with hover state and direction arrow).

---

## 2. Component Props & API Interface

| Prop Name | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `isOpen` | `boolean` | `true` | Controls modal visibility. Returns `null` when set to `false`. |
| `onClose` | `function` | `undefined` | Callback fired when clicking the close button or background overlay. |
| `onViewTickets` | `function` | `undefined` | Callback fired when the user clicks **View in My Tickets**. |
| `onReturnDashboard` | `function` | `undefined` | Callback fired when the user clicks **Return to Dashboard**. |
| `ticketId` | `string` | `'#CMP-2026-0042'` | The unique case tracking ticket identifier. |
| `assignedDepartment` | `string` | `'Academic Affairs'` | The governing body assigned to review the case. |

---

## 3. State Management & Interactivity

* **`copied` State (`boolean`):**
  * Tracks clipboard action state when the user clicks the **Copy ID** button.
  * Triggers a temporary label change (`Copy ID` ➔ `Copied!`) and automatically resets after 2000ms using `setTimeout`.
* **Clipboard API Integration:**
  * Uses `navigator.clipboard.writeText(...)` to directly copy the ticket ID to the user's system clipboard.

---

## 4. Visual Layout & Design System Specifications

* **Color Palette:**
  * **Brand Primary Crimson:** `#c81e1e` (Hover: `#9b1c1c`)
  * **Success Green:** `#10b981` / `#059669` (Backgrounds: `#d1fae5`, `#ecfdf5`)
  * **Neutral Slate Tones:**
    * Dark Headers: `#0f172a`
    * Body Text: `#64748b`
    * Subtle Borders: `#e2e8f0` / `#cbd5e1`
    * Card Fill: `#f8fafc`
* **Typography:** System Sans-Serif (`-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`).
* **Animations:** Cubic-bezier scale and opacity entrance transition (`modalPopIn`).

---

## 5. Unified React JSX Component Source Code

```jsx
import React, { useState } from 'react';

/**
 * CampusCare Grievance Confirmation Modal
 * Unified single-file React component with embedded CSS styling.
 */
const ConfirmationModal = ({ 
  isOpen = true, 
  onClose, 
  onViewTickets, 
  onReturnDashboard,
  ticketId = '#CMP-2026-0042',
  assignedDepartment = 'Academic Affairs'
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    const rawId = ticketId.replace('#', '');
    navigator.clipboard.writeText(rawId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Embedded CSS Stylesheet */}
      <style>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999;
          padding: 1.25rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }

        .modal-card {
          position: relative;
          background-color: #ffffff;
          border-radius: 24px;
          width: 100%;
          max-width: 480px;
          padding: 2.25rem 2rem 2rem 2rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          animation: modalPopIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          box-sizing: border-box;
        }

        @keyframes modalPopIn {
          from {
            opacity: 0;
            transform: scale(0.94) translateY(12px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .modal-close-btn {
          position: absolute;
          top: 1.25rem;
          right: 1.25rem;
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 6px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .modal-close-btn:hover {
          background-color: #f1f5f9;
          color: #334155;
        }

        .success-icon-badge {
          width: 56px;
          height: 56px;
          background-color: #d1fae5;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.75rem;
          box-shadow: 0 0 0 8px rgba(209, 250, 229, 0.4);
        }

        .status-pill-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background-color: #ecfdf5;
          color: #059669;
          border: 1px solid #a7f3d0;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          margin-bottom: 1.25rem;
        }

        .status-pill-badge .dot {
          width: 6px;
          height: 6px;
          background-color: #10b981;
          border-radius: 50%;
        }

        .modal-title {
          font-size: 1.35rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.02em;
          margin: 0 0 0.5rem 0;
        }

        .modal-description {
          font-size: 0.8125rem;
          line-height: 1.5;
          color: #64748b;
          max-width: 380px;
          margin: 0 0 1.5rem 0;
        }

        .modal-description strong {
          color: #1e293b;
        }

        .ticket-info-box {
          width: 100%;
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 1.25rem;
          margin-bottom: 1.5rem;
          text-align: left;
          box-sizing: border-box;
        }

        .ticket-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 1rem;
          border-bottom: 1px dashed #cbd5e1;
          margin-bottom: 1rem;
        }

        .ticket-id-group {
          display: flex;
          flex-direction: column;
        }

        .ticket-label {
          font-size: 0.625rem;
          font-weight: 700;
          color: #64748b;
          letter-spacing: 0.05em;
          margin-bottom: 2px;
        }

        .ticket-value {
          font-size: 1.1rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.01em;
        }

        .copy-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background-color: #ffffff;
          border: 1px solid #cbd5e1;
          color: #475569;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .copy-btn:hover {
          background-color: #f1f5f9;
          color: #0f172a;
        }

        .ticket-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .detail-label {
          font-size: 0.6875rem;
          color: #94a3b8;
          font-weight: 600;
        }

        .detail-content {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .detail-text {
          font-size: 0.8125rem;
          font-weight: 700;
          color: #1e293b;
        }

        .detail-text.highlight {
          color: #059669;
        }

        .modal-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
        }

        .btn-secondary {
          flex: 1;
          background-color: #ffffff;
          border: 1px solid #cbd5e1;
          color: #334155;
          padding: 12px;
          border-radius: 12px;
          font-size: 0.8125rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-secondary:hover {
          background-color: #f8fafc;
          border-color: #94a3b8;
        }

        .btn-primary {
          flex: 1.2;
          background-color: #c81e1e;
          color: #ffffff;
          border: none;
          padding: 12px;
          border-radius: 12px;
          font-size: 0.8125rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(200, 30, 30, 0.25);
          transition: all 0.2s ease;
        }

        .btn-primary:hover {
          background-color: #9b1c1c;
        }
      `}</style>

      {/* Modal Backdrop Overlay */}
      <div className="modal-overlay" onClick={onClose}>
        {/* Main Card Container */}
        <div className="modal-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
          
          {/* Close Action */}
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Success Checkmark Badge */}
          <div className="success-icon-badge">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          {/* Status Badge */}
          <div className="status-pill-badge">
            <span className="dot"></span>
            <span>Submission Confirmed</span>
          </div>

          {/* Title & Description */}
          <h2 className="modal-title">Grievance Submitted Successfully!</h2>
          <p className="modal-description">
            Your report has been securely filed with the <strong>{assignedDepartment} Council</strong>. An official case tracking ticket has been generated.
          </p>

          {/* Ticket Metadata Box */}
          <div className="ticket-info-box">
            <div className="ticket-header-row">
              <div className="ticket-id-group">
                <span className="ticket-label">TICKET IDENTIFIER</span>
                <span className="ticket-value">{ticketId}</span>
              </div>
              <button className="copy-btn" onClick={handleCopy}>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                <span>{copied ? 'Copied!' : 'Copy ID'}</span>
              </button>
            </div>

            <div className="ticket-details-grid">
              <div className="detail-item">
                <span className="detail-label">Assigned Body</span>
                <div className="detail-content">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#64748b" strokeWidth="2">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                  <span className="detail-text">{assignedDepartment}</span>
                </div>
              </div>

              <div className="detail-item">
                <span className="detail-label">Evaluation SLA</span>
                <div className="detail-content">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#10b981" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span className="detail-text highlight">Within 48 hours</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="modal-actions">
            <button className="btn-secondary" onClick={onReturnDashboard || onClose}>
              Return to Dashboard
            </button>
            <button className="btn-primary" onClick={onViewTickets || onClose}>
              <span>View in My Tickets</span>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default ConfirmationModal;
```