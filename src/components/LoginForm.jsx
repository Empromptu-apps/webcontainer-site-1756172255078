import React, { useState } from 'react';

const LoginForm = ({ onLogin, userTimezone, setUserTimezone }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [userType, setUserType] = useState('client');
  const [timezone, setTimezone] = useState(userTimezone);
  const [coachLink, setCoachLink] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && username && timezone) {
      onLogin(email, username, userType, timezone, coachLink);
    }
  };

  return (
    <div className="min-h-screen gradient-brand flex items-center justify-center p-4">
      <div className="card-luxury p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 gradient-brand rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-brand-main mb-2">Tiny HabitsÂ®</h1>
          <p className="text-brand-brown">Build lasting habits, one tiny step at a time</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-brand-brown mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-luxury"
              placeholder="your@email.com"
              required
              aria-label="Email address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-brown mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-luxury"
              placeholder="Your full name"
              required
              aria-label="Full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-brown mb-2">
              Account Type
            </label>
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              className="input-luxury"
              aria-label="Account type"
            >
              <option value="client">Client (Free Registration)</option>
              <option value="coach">Coach (Admin Setup Required)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-brown mb-2">
              Timezone
            </label>
            <input
              type="text"
              value={timezone}
              onChange={(e) => {
                setTimezone(e.target.value);
                setUserTimezone(e.target.value);
              }}
              className="input-luxury"
              placeholder="Auto-detected timezone"
              required
              aria-label="Timezone"
            />
            <p className="text-xs text-brand-secondary mt-1">
              Auto-detected from your browser, but you can modify it
            </p>
          </div>

          {userType === 'client' && (
            <div>
              <label className="block text-sm font-medium text-brand-brown mb-2">
                Coach Affiliate Link (Optional)
              </label>
              <input
                type="url"
                value={coachLink}
                onChange={(e) => setCoachLink(e.target.value)}
                className="input-luxury"
                placeholder="https://app.com/coach/123"
                aria-label="Coach affiliate link"
              />
              <p className="text-xs text-brand-secondary mt-1">
                Link to your coach to get personalized guidance
              </p>
            </div>
          )}

          <button
            type="submit"
            className="w-full btn-primary py-3 text-lg font-semibold"
            aria-label="Create account and get started"
          >
            Get Started
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-brand-secondary">
            By signing up, you agree to build tiny, sustainable habits that will transform your life.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
