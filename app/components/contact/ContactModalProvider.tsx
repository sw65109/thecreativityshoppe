"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import ContactModal from "./ContactModal";

type ContactModalContextValue = {
  isOpen: boolean;
  openContactModal: () => void;
  closeContactModal: () => void;
};

const ContactModalContext = createContext<ContactModalContextValue | null>(null);

export function ContactModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openContactModal = useCallback(() => setIsOpen(true), []);
  const closeContactModal = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeContactModal();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, closeContactModal]);

  const value = useMemo(
    () => ({ isOpen, openContactModal, closeContactModal }),
    [isOpen, openContactModal, closeContactModal],
  );

  return (
    <ContactModalContext.Provider value={value}>
      {children}
      <ContactModal isOpen={isOpen} onClose={closeContactModal} />
    </ContactModalContext.Provider>
  );
}

export function useContactModal() {
  const context = useContext(ContactModalContext);
  if (!context) {
    throw new Error("useContactModal must be used within a ContactModalProvider");
  }
  return context;
}