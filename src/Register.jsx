import { useState } from 'react';
import './Register.css';

const colleges = [
  'College of Agriculture',
  'College of Architecture',
  'College of Asian and Islamic Studies',
  'College of Criminal Justice Education',
  'College of Computing Studies',
  'College of Engineering',
  'College of Forestry and Environmental Studies',
  'College of Home Economics',
  'College of Law',
  'College of Liberal Arts',
  'College of Nursing',
  'College of Public Administration and Development Studies',
  'College of Science and Mathematics',
  'College of Social Work and Community Development',
  'College of Teacher Education',
  'College of Sports Science and Physical Education',
];

const yearLevels = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
  '5th Year',
  'Postgraduate / Masteral',
];

const initialFormState = {
  fullName: 'Maya Vance',
  universityEmail: 'maya.vance@wmsu.edu.ph',
  studentId: '2025-03461',
  college: '',
  yearLevel: '',
  contactPhone: '0912 345 6789',
  agreedToTerms: false,
};

export default function Register({ onBackToLogin, onComplete }) {
  const [formData, setFormData] = useState(initialFormState);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.agreedToTerms) {
      alert('Please agree to the WMSU Student Grievance Code and Privacy Policy to proceed.');
      return;
    }

    setIsLoading(true);
    setSuccessMessage(false);

    setTimeout(() => {
      setIsLoading(false);
      setSuccessMessage(true);

      setTimeout(() => {
        onComplete?.(formData);
      }, 1200);
    }, 1200);
  };

  return (
    <div className="register-page">
      <div className="register-wrapper">
        <div className="register-card">
        <div className="register-hero">
          <div className="hero-bg-overlay" />
          <div className="hero-text-content">
            <h1 className="hero-heading">
              Join
              <br />
              CampusCare,
              <br />
              <span className="hero-blue-accent">Normalite.</span>
            </h1>
            <p className="hero-subtext">
              Your official student grievance and support portal. Create your verified account to submit concerns safely, track status, and access ombudsman support.
            </p>
          </div>
        </div>

        <div className="register-form-container">
          <div className="form-header-box">
            <h2 className="form-heading">Complete Profile</h2>
            <p className="form-subheading">
              Confirm your student details to activate your grievance portal.
            </p>
          </div>

          {successMessage && (
            <div className="success-banner">
              <svg className="success-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>Profile registered successfully! You can now log in.</span>
            </div>
          )}

          <div className="google-account-badge">
            <div className="google-badge-left">
              <div className="google-icon-circle">
                <svg className="google-svg" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </div>
              <span className="google-email-text">{formData.universityEmail}</span>
            </div>
            <button type="button" className="switch-account-btn" onClick={onBackToLogin}>
              Switch
            </button>
          </div>

          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-grid">
              <div className="input-field-group">
                <label htmlFor="fullName" className="field-label">FULL NAME</label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Maya Vance"
                  className="field-input"
                />
              </div>

              <div className="input-field-group">
                <label htmlFor="universityEmail" className="field-label">UNIVERSITY EMAIL</label>
                <input
                  id="universityEmail"
                  name="universityEmail"
                  type="email"
                  required
                  value={formData.universityEmail}
                  onChange={handleChange}
                  placeholder="maya.vance@wmsu.edu.ph"
                  className="field-input"
                />
              </div>

              <div className="input-field-group">
                <label htmlFor="studentId" className="field-label">STUDENT ID NUMBER</label>
                <input
                  id="studentId"
                  name="studentId"
                  type="text"
                  required
                  value={formData.studentId}
                  onChange={handleChange}
                  placeholder="2025-03461"
                  className="field-input"
                />
              </div>

              <div className="input-field-group">
                <label htmlFor="college" className="field-label">COLLEGE / DEPARTMENT</label>
                <div className="select-wrapper">
                  <select
                    id="college"
                    name="college"
                    required
                    value={formData.college}
                    onChange={handleChange}
                    className="field-select"
                  >
                    <option value="" disabled>
                      Select your College
                    </option>
                    {colleges.map((college, index) => (
                      <option key={index} value={college}>
                        {college}
                      </option>
                    ))}
                  </select>
                  <svg className="dropdown-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>

              <div className="input-field-group">
                <label htmlFor="yearLevel" className="field-label">YEAR LEVEL</label>
                <div className="select-wrapper">
                  <select
                    id="yearLevel"
                    name="yearLevel"
                    required
                    value={formData.yearLevel}
                    onChange={handleChange}
                    className="field-select"
                  >
                    <option value="" disabled>
                      Select Year
                    </option>
                    {yearLevels.map((year, index) => (
                      <option key={index} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  <svg className="dropdown-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>

              <div className="input-field-group">
                <label htmlFor="contactPhone" className="field-label">CONTACT PHONE (OPTIONAL)</label>
                <input
                  id="contactPhone"
                  name="contactPhone"
                  type="tel"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  placeholder="0912 345 6789"
                  className="field-input"
                />
              </div>
            </div>

            <div className="terms-checkbox-container">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="agreedToTerms"
                  checked={formData.agreedToTerms}
                  onChange={handleChange}
                  className="custom-checkbox"
                />
                <span className="checkbox-text">
                  I agree to the{' '}
                  <a href="#grievance-code" className="crimson-link">
                    WMSU Student Grievance Code
                  </a>{' '}
                  and{' '}
                  <a href="#privacy-policy" className="crimson-link">
                    RA 10173 Privacy Policy
                  </a>
                  .
                </span>
              </label>
            </div>

            <button type="submit" disabled={isLoading} className="submit-profile-button">
              {isLoading ? (
                <div className="spinner" />
              ) : (
                <>
                  <svg className="checkmark-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Complete Profile</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
    </div>
  );
}
