"use client";

import { useCallback, useState } from "react";
import Modal from "@/components/overlays/Modal";
import { countries, type Country } from "@/data/countries";

type CountryModalProps = {
  open: boolean;
  country: Country;
  onClose: () => void;
  onSave: (code: string) => void;
};

export default function CountryModal({ open, country, onClose, onSave }: CountryModalProps) {
  const [draftCode, setDraftCode] = useState<string | null>(null);
  const selectedCode = draftCode ?? country.code;

  const handleClose = useCallback(() => {
    setDraftCode(null);
    onClose();
  }, [onClose]);

  return (
    <Modal open={open} onClose={handleClose} labelId="country-title" testId="country-modal">
      <form
        className="modal-country"
        onSubmit={(event) => {
          event.preventDefault();
          onSave(selectedCode);
          setDraftCode(null);
        }}
      >
        <button
          type="button"
          className="modal-close modal-country__close"
          data-testid="country-close"
          aria-label="Close"
          onClick={handleClose}
        >
          ×
        </button>
        <h2 id="country-title" className="modal-title modal-country__title">
          Country / Region
        </h2>
        <label className="visually-hidden" htmlFor="country-modal-select">
          Country / Region
        </label>
        <select
          className="modal-country__select"
          id="country-modal-select"
          data-testid="country-select"
          name="country"
          value={selectedCode}
          onChange={(event) => setDraftCode(event.target.value)}
        >
          {countries.map((entry) => (
            <option key={entry.code} value={entry.code}>
              {`${entry.name} / ${entry.currency}`}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="button-solid modal-country__save"
          data-testid="country-save"
        >
          Save
        </button>
      </form>
    </Modal>
  );
}
