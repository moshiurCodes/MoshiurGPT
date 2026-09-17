import React from 'react';

export default function WelcomeScreen() {
  return (
    <div className="welcome-screen">
      <div className="welcome-avatar-wrapper">
        <img src="/avatar.jpg" alt="Moshiur" className="welcome-avatar-img" />
      </div>

      <h1 className="welcome-title">Hello, Moshiur</h1>
      <p className="welcome-subtitle">How can I help you today?</p>
    </div>
  );
}
