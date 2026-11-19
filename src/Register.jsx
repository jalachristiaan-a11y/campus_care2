import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import './Register.css';
import { apiRequest } from './apiClient.js';

export default function Register({ onBackToLogin }) {
  const [id, setId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

    try {
      await apiRequest('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          full_name: fullName,
          email,
          password,
        }),
      });

      setSuccess('Account created successfully! Redirecting to login…');
      setTimeout(() => {
        onBackToLogin();
      }, 1500);

    } catch (err) {
      setError(err instanceof TypeError
        ? 'Could not connect to CampusCare. Run npm run dev from the project folder and try again.'
        : err instanceof Error
          ? err.message
          : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-wrapper">
        <div className="register-card" data-scroll-reveal>
          <div className="register-hero">
            <div className="hero-bg-overlay" />
            <div className="hero-text-content">
              <h1 className="hero-heading">
                Join
                <br />
                CampusCare,
                <br />
                <span className="hero-blue-accent">Crimsons.</span>
              </h1>
              <p className="hero-subtext">
                Create your student account to submit and track your campus grievances securely.
              </p>
            </div>
          </div>

          <div className="register-form-container">
            <div className="form-header-box">
              <h2 className="form-heading">Create an account</h2>
              <p className="form-subheading">
                Enter your details below to register your WMSU account.
              </p>
            </div>

            {error && <div className="error-message" role="alert">{error}</div>}
            {success && <div className="success-message" role="status">{success}</div>}

            <form onSubmit={handleSubmit} className="register-form">
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label htmlFor="register-student-id">Student ID</label>
                <input
                  id="register-student-id"
                  name="student-id"
                  type="text"
                  autoComplete="username"
                  spellCheck={false}
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  placeholder="e.g. 2023-00001"
                  required
                  style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label htmlFor="register-first-name">First Name</label>
                <input
                  id="register-first-name"
                  name="given-name"
                  type="text"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Juan"
                  required
                  style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label htmlFor="register-last-name">Last Name</label>
                <input
                  id="register-last-name"
                  name="family-name"
                  type="text"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Dela Cruz"
                  required
                  style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label htmlFor="register-email">University Email</label>
                <input
                  id="register-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  spellCheck={false}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. student@wmsu.edu.ph"
                  required
                  style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <div className="form-password-label">
                  <label htmlFor="register-password">Password</label>
                  <button
                    type="button"
                    className="form-password-toggle"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-controls="register-password"
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((isVisible) => !isVisible)}
                  >
                    {showPassword ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />}
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div className="form-password-control">
                  <input
                    id="register-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="submit-profile-button"
                disabled={loading}
                style={{ width: '100%', marginBottom: '10px' }}
              >
                {loading ? 'Registering…' : 'Register'}
              </button>
            </form>

            <button type="button" onClick={onBackToLogin} className="submit-profile-button secondary" style={{ width: '100%', background: 'transparent', border: '1px solid #ccc' }}>
              Back to Log In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}