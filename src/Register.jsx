import { useState } from 'react';
import './Register.css';

export default function Register({ onBackToLogin }) {
  const [id, setId] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          full_name: fullName,
          email,
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed.');
      }

      setSuccess('Account created successfully! Redirecting to login...');
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

            {error && <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
            {success && <div className="success-message" style={{ color: 'green', marginBottom: '10px' }}>{success}</div>}

            <form onSubmit={handleSubmit} className="register-form">
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label>Student ID</label>
                <input
                  type="text"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  placeholder="e.g. 2023-00001"
                  required
                  style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label>Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Juan Dela Cruz"
                  required
                  style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label>University Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. student@wmsu.edu.ph"
                  required
                  style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  required
                  minLength={8}
                  style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                />
              </div>

              <button
                type="submit"
                className="submit-profile-button"
                disabled={loading}
                style={{ width: '100%', marginBottom: '10px' }}
              >
                {loading ? 'Registering...' : 'Register'}
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