"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "stussy.localAccount";

export default function AccountPanel() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [activeEmail, setActiveEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setActiveEmail(window.localStorage.getItem(STORAGE_KEY));
    setReady(true);
  }, []);

  if (!ready) {
    return <div className="account-panel" aria-hidden="true" />;
  }

  if (activeEmail) {
    return (
      <div className="account-panel" data-testid="account-signed-in">
        <p className="account-panel__eyebrow">Signed In</p>
        <p className="account-panel__welcome">Welcome</p>
        <p className="account-panel__email">{activeEmail}</p>
        <button
          type="button"
          className="button-outline account-panel__button"
          onClick={() => {
            window.localStorage.removeItem(STORAGE_KEY);
            setActiveEmail(null);
          }}
          data-testid="account-signout"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <form
      className="account-panel"
      onSubmit={(event) => {
        event.preventDefault();
        if (!email.trim() || !password) return;
        window.localStorage.setItem(STORAGE_KEY, email.trim());
        setActiveEmail(email.trim());
        setPassword("");
      }}
      data-testid="account-form"
    >
      <p className="account-panel__eyebrow">Sign In</p>
      <label className="account-field">
        <span className="account-field__label">Email</span>
        <input
          className="account-field__input"
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          suppressHydrationWarning
          data-testid="account-email"
        />
      </label>
      <label className="account-field">
        <span className="account-field__label">Password</span>
        <input
          className="account-field__input"
          type="password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          suppressHydrationWarning
          data-testid="account-password"
        />
      </label>
      <button type="submit" className="button-solid account-panel__button">
        Sign In
      </button>
      <p className="account-panel__note">
        This local account is stored only on this device.
      </p>
    </form>
  );
}
