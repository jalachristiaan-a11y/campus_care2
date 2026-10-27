import { useEffect, useRef } from 'react';
import { LogOut } from 'lucide-react';
import './LogoutConfirmation.css';

export default function LogoutConfirmation({ onCancel, onConfirm }) {
  const cancelButtonRef = useRef(null);

  useEffect(() => {
    cancelButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  return (
    <div
      className="logout-confirmation-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <section
        className="logout-confirmation-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-confirmation-title"
        aria-describedby="logout-confirmation-description"
      >
        <span className="logout-confirmation-icon" aria-hidden="true">
          <LogOut size={23} />
        </span>
        <h2 id="logout-confirmation-title">Do you want to log out?</h2>
        <p id="logout-confirmation-description">
          You will be returned to the CampusCare login page.
        </p>
        <div className="logout-confirmation-actions">
          <button
            ref={cancelButtonRef}
            type="button"
            className="logout-confirmation-no"
            onClick={onCancel}
          >
            No, stay logged in
          </button>
          <button
            type="button"
            className="logout-confirmation-yes"
            onClick={onConfirm}
          >
            Yes, log out
          </button>
        </div>
      </section>
    </div>
  );
}
