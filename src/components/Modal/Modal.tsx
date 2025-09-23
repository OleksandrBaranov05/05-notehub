import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from "react-dom";
import css from "./Modal.module.css";

export interface ModalProps {
  children: ReactNode;
  onClose: () => void;
}

const modalRoot =
  document.getElementById("modal-root") ||
  (() => {
    const el = document.createElement("div");
    el.id = "modal-root";
    document.body.appendChild(el);
    return el;
  })();

export default function Modal({ children, onClose }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const node = (
    <div
      className={css.backdrop}
      role="dialog"
      aria-modal="true"
      onClick={handleBackdrop}
    >
      <div className={css.modal}>{children}</div>
    </div>
  );

  return createPortal(node, modalRoot);
}
