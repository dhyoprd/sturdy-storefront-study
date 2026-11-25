"use client";

import Modal from "@/components/overlays/Modal";
import NewsletterForm from "@/components/ui/NewsletterForm";

type NewsletterModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function NewsletterModal({ open, onClose }: NewsletterModalProps) {
  return (
    <Modal open={open} onClose={onClose} labelId="newsletter-title" testId="newsletter-modal">
      <div className="modal-newsletter">
        <button
          type="button"
          className="modal-close modal-newsletter__close"
          data-testid="newsletter-close"
          aria-label="Close"
          onClick={onClose}
        >
          ×
        </button>
        <h2 id="newsletter-title" className="modal-title modal-newsletter__title">
          Newsletter
        </h2>
        <NewsletterForm idPrefix="modal" variant="modal" />
      </div>
    </Modal>
  );
}
