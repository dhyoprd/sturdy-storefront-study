"use client";

import { useRef, type ReactNode } from "react";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useDialogFocus } from "@/hooks/useDialogFocus";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  labelId: string;
  children: ReactNode;
  testId: string;
};

export default function Modal({ open, onClose, labelId, children, testId }: ModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useBodyScrollLock(open);
  useDialogFocus(open, cardRef, onClose);

  return (
    <>
      <button
        className="modal-scrim"
        data-open={open}
        aria-label="Close"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
        data-testid={`${testId}-scrim`}
      />
      <div
        ref={cardRef}
        className="modal-card"
        data-open={open}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelId}
        aria-hidden={!open}
        inert={!open}
        data-testid={testId}
      >
        {children}
      </div>
    </>
  );
}
