import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { openSlotModal, closeSlotModal, toggleSlotModal } from "@/store/slices/slotModalSlice";

export const useSlotModal = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.slotModal.isOpen);

  const open = () => {
    dispatch(openSlotModal());
  };

  const close = () => {
    dispatch(closeSlotModal());
  };

  const toggle = () => {
    dispatch(toggleSlotModal());
  };

  return {
    isOpen,
    open,
    close,
    toggle,
  };
};
