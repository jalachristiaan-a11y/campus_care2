/* Reset & Box Sizing */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background-color: #f1f3f6;
  color: #1f2937;
  -webkit-font-smoothing: antialiased;
}

/* Page Outer Wrapper */
.register-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

/* Main Two-Column Card Container */
.register-card {
  width: 100%;
  max-width: 1040px;
  background-color: #ffffff;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
}

@media (min-width: 850px) {
  .register-card {
    flex-direction: row;
    min-height: 600px;
  }
}

/* Left Hero Section */
.register-hero {
  position: relative;
  background: #1e293b url('https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?q=80&w=1000&auto=format&fit=crop') center/cover no-repeat;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 2.5rem;
  color: #ffffff;
  min-height: 340px;
}

@media (min-width: 850px) {
  .register-hero {
    width: 42%;
    min-height: 100%;
  }
}

.hero-bg-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.25) 0%, rgba(15, 23, 42, 0.92) 100%);
  z-index: 1;
}

.hero-text-content {
  position: relative;
  z-index: 2;
}

.hero-heading {
  font-size: 2.4rem;
  font-weight: 800;
  line-height: 1.12;
  margin-bottom: 1rem;
  letter-spacing: -0.02em;
}

.hero-blue-accent {
  color: #00a3ff;
}

.hero-subtext {
  font-size: 0.85rem;
  line-height: 1.5;
  color: #cbd5e1;
  max-width: 360px;
}

/* Right Form Panel */
.register-form-container {
  flex: 1;
  padding: 2.5rem 3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: #ffffff;
}

.form-header-box {
  margin-bottom: 1.25rem;
}

.form-heading {
  font-size: 1.75rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 0.35rem;
  letter-spacing: -0.02em;
}

.form-subheading {
  font-size: 0.875rem;
  color: #64748b;
  line-height: 1.4;
}

/* Success Banner */
.success-banner {
  background-color: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  font-size: 0.8125rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.success-icon {
  width: 18px;
  height: 18px;
  shrink: 0;
}

/* Active Google Badge */
.google-account-badge {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 0.6rem 1rem;
  margin-bottom: 1.25rem;
}

.google-badge-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.google-icon-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
}

.google-svg {
  width: 16px;
  height: 16px;
}

.google-email-text {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #334155;
}

.switch-account-btn {
  background: none;
  border: none;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: color 0.2s;
}

.switch-account-btn:hover {
  color: #0f172a;
}

/* Form Layout Grid */
.register-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 600px) {
  .form-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.input-field-group {
  display: flex;
  flex-direction: column;
}

.field-label {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: #64748b;
  margin-bottom: 0.35rem;
  text-transform: uppercase;
}

.field-input {
  width: 100%;
  padding: 0.65rem 0.85rem;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.875rem;
  color: #0f172a;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  background-color: #ffffff;
}

.field-input:focus {
  border-color: #800020;
  box-shadow: 0 0 0 3px rgba(128, 0, 32, 0.08);
}

.field-input::placeholder {
  color: #94a3b8;
}

/* Select Field Custom Styling */
.select-wrapper {
  position: relative;
  width: 100%;
}

.field-select {
  width: 100%;
  padding: 0.65rem 2.2rem 0.65rem 0.85rem;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.875rem;
  color: #0f172a;
  outline: none;
  appearance: none;
  background-color: #ffffff;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.field-select:focus {
  border-color: #800020;
  box-shadow: 0 0 0 3px rgba(128, 0, 32, 0.08);
}

.field-select:invalid,
.field-select value="" {
  color: #94a3b8;
}

.dropdown-arrow {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #64748b;
  pointer-events: none;
}

/* Checkbox Terms Section */
.terms-checkbox-container {
  margin-top: 0.25rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
}

.custom-checkbox {
  width: 16px;
  height: 16px;
  accent-color: #800020;
  border-radius: 4px;
  cursor: pointer;
}

.checkbox-text {
  font-size: 0.75rem;
  color: #64748b;
}

.crimson-link {
  color: #800020;
  font-weight: 600;
  text-decoration: none;
}

.crimson-link:hover {
  text-decoration: underline;
}

/* Submit Button */
.submit-profile-button {
  width: 100%;
  background-color: #800020;
  color: #ffffff;
  padding: 0.8rem 1rem;
  border: none;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  box-shadow: 0 4px 12px rgba(128, 0, 32, 0.25);
  transition: background-color 0.2s ease, transform 0.1s ease;
}

.submit-profile-button:hover {
  background-color: #660019;
}

.submit-profile-button:active {
  transform: scale(0.99);
}

.submit-profile-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.checkmark-icon {
  width: 18px;
  height: 18px;
}

/* Loading Spinner */
.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}