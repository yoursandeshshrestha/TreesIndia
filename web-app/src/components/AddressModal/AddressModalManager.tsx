"use client";

import React, { useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { closeAddressModal } from "@/store/slices/addressModalSlice";
import { setSelectedAddress } from "@/store/slices/bookingSlice";
import { Address } from "@/types/booking";
import { AddressListModal, AddAddressModal, EditAddressModal } from "./index";

type ModalType = "list" | "add" | "edit";

export default function AddressModalManager() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.addressModal.isOpen);
  const initialModalType = useAppSelector(
    (state) => state.addressModal.initialModalType
  );
  const editingAddress = useAppSelector(
    (state) => state.addressModal.editingAddress
  );

  const [currentModal, setCurrentModal] = useState<ModalType>("list");

  const handleClose = () => {
    dispatch(closeAddressModal());
    setCurrentModal("list");
  };

  // Set initial modal type when modal opens
  React.useEffect(() => {
    if (isOpen && initialModalType && initialModalType !== "confirm") {
      setCurrentModal(initialModalType as ModalType);
    }
  }, [isOpen, initialModalType]);

  const handleAddNew = () => {
    setCurrentModal("add");
  };

  const handleEditAddress = (address: Address) => {
    // This is handled by the Redux state now
    setCurrentModal("edit");
  };

  const handleAddressSelected = (address: Address) => {
    // Directly set the selected address and close the modal
    dispatch(setSelectedAddress(address));
    handleClose();
  };

  const handleAddressAdded = () => {
    // Close the modal completely after adding an address
    handleClose();
  };

  const handleAddressUpdated = () => {
    // Close the modal completely after updating an address
    handleClose();
  };

  const handleAddressDeleted = () => {
    // If we're editing an address and it gets deleted, close the modal
    if (currentModal === "edit") {
      handleClose();
    }
  };

  const handleBackToList = () => {
    setCurrentModal("list");
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Address List Modal */}
      {currentModal === "list" && (
        <AddressListModal
          isOpen={isOpen}
          onClose={handleClose}
          onAddressSelected={handleAddressSelected}
          onAddNew={handleAddNew}
          onAddressDeleted={handleAddressDeleted}
          onEditAddress={handleEditAddress}
        />
      )}

      {/* Add Address Modal */}
      {currentModal === "add" && (
        <AddAddressModal
          isOpen={isOpen}
          onClose={handleBackToList}
          onAddressAdded={handleAddressAdded}
        />
      )}

      {/* Edit Address Modal */}
      {currentModal === "edit" && (
        <EditAddressModal
          isOpen={isOpen}
          onClose={handleBackToList}
          address={editingAddress}
          onAddressUpdated={handleAddressUpdated}
          isConfirming={false}
        />
      )}
    </>
  );
}
