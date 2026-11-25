"use client";

import { useRef, type ReactNode } from "react";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useDialogFocus } from "@/hooks/useDialogFocus";

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  labelId: string;
  children: ReactNode;
  testId: string;
};

export default function Drawer({ open, onClose, labelId, children, testId }: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useBodyScrollLock(open);
  useDialogFocus(open, panelRef, onClose);

  return (
    <>
      <button
        className="overlay-scrim"
        data-open={open}
        aria-label="Close"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
        data-testid={`${testId}-scrim`}
      />
      <div
        ref={panelRef}
        className="drawer-panel"
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
