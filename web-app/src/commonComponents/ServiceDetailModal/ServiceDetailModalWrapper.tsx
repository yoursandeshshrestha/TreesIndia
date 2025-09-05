"use client";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { closeServiceDetailModal } from "@/store/slices/serviceDetailModalSlice";
import { ServiceDetailModal } from "./ServiceDetailModal";

export default function ServiceDetailModalWrapper() {
  const dispatch = useDispatch();
  const { isOpen, service } = useSelector(
    (state: RootState) => state.serviceDetailModal
  );

  const handleClose = () => {
    dispatch(closeServiceDetailModal());
  };

  return (
    <ServiceDetailModal
      service={service}
      isOpen={isOpen}
      onClose={handleClose}
    />
  );
}
