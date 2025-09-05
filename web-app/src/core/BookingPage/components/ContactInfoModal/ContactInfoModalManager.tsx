"use client";

import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { closeContactInfoModal } from "@/store/slices/contactInfoModalSlice";
import ContactInfoModal from "./ContactInfoModal";

export default function ContactInfoModalManager() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.contactInfoModal.isOpen);

  const handleClose = () => {
    dispatch(closeContactInfoModal());
  };

  const handleSubmit = () => {
    dispatch(closeContactInfoModal());
  };

  return (
    <ContactInfoModal
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={handleSubmit}
    />
  );
}
