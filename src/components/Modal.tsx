import type { ReactNode } from "react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
};

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md">
      <div className="relative w-[420px] rounded-3xl bg-white p-8 shadow-[0_25px_60px_rgba(0,0,0,0.15)] animate-in fade-in zoom-in-95">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-slate-400 transition hover:text-slate-700"
        >
          ✕
        </button>

        {children}
      </div>
    </div>
  );
}
