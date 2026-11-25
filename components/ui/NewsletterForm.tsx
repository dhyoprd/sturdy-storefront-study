"use client";

import { useState } from "react";

type NewsletterFormProps = {
  idPrefix: string;
  variant?: "footer" | "modal";
};

export default function NewsletterForm({ idPrefix, variant = "footer" }: NewsletterFormProps) {
  const inputId = `${idPrefix}-newsletter-email`;
  const [subscribed, setSubscribed] = useState(false);

  if (subscribed) {
    return (
      <p className="newsletter-success" role="status" data-testid={`${idPrefix}-newsletter-success`}>
        THANK YOU FOR SUBSCRIBING TO STÜSSY.
      </p>
    );
  }

  return (
    <form
      className={`newsletter-form newsletter-form--${variant}`}
      onSubmit={(event) => {
        event.preventDefault();
        setSubscribed(true);
      }}
    >
      <label className="visually-hidden" htmlFor={inputId}>
        Email address
      </label>
      <input
        className="newsletter-form__input"
        id={inputId}
        data-testid={`${idPrefix}-newsletter-input`}
        type="email"
        name="email"
        placeholder="NEWSLETTER *"
        autoComplete="email"
        required
        suppressHydrationWarning
      />
      <button
        className="newsletter-form__submit"
        type="submit"
        aria-label="Subscribe"
        data-testid={`${idPrefix}-newsletter-submit`}
      >
        →
      </button>
    </form>
  );
}
