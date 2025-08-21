"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProfileLayout from "@/core/ProfileLayout";

const SecurityPage: React.FC = () => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenDeleteModal = () => {
    setIsDeleteModalOpen(true);
    setDeleteConfirmation("");
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "Delete account") return;

    setIsDeleting(true);
    try {
      // API call to delete account would go here
      // await deleteAccountAPI();

      // For now, just close the modal
      setIsDeleteModalOpen(false);
      setDeleteConfirmation("");
    } catch (error) {
      console.error("Error deleting account:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteConfirmation("");
  };

  return (
    <ProfileLayout>
      <div className="pb-4 border-b border-gray-200">
        <h1 className="text-[17px] font-semibold text-[#212126]">Security</h1>
      </div>

      <div className="space-y-4 mt-6">
        <div className="flex  py-3">
          <span className="text-[#212126] w-1/3 font-medium">
            Delete account
          </span>
          {!isDeleteModalOpen ? (
            <div className="flex items-center justify-center">
              <button
                onClick={handleOpenDeleteModal}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Delete account
              </button>
            </div>
          ) : (
            <AnimatePresence>
              {isDeleteModalOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="w-[70%] bg-white border border-gray-200 shadow-md rounded-lg"
                >
                  <div className="p-3 space-y-3">
                    <div className="space-y-2">
                      <h4 className="text-md font-semibold text-black">
                        Delete account
                      </h4>

                      <div>
                        <p className="text-gray-700 text-[12px] opacity-70">
                          Are you sure you want to delete your account?
                        </p>

                        <p className="text-red-600 font-medium text-[12px] opacity-70">
                          This action is permanent and irreversible.
                        </p>
                      </div>
                    </div>

                    <p className="text-gray-700 text-[12px]">
                      Type{" "}
                      <span className="font-semibold">
                        &quot;Delete account&quot;
                      </span>{" "}
                      below to continue.
                    </p>

                    <input
                      type="text"
                      value={deleteConfirmation}
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
                      placeholder="Delete account"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-transparent"
                    />

                    <div className="flex items-center justify-end space-x-4 pt-2">
                      <button
                        onClick={handleCloseDeleteModal}
                        className="text-[#212126] hover:text-gray-700 font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDeleteAccount}
                        disabled={
                          deleteConfirmation !== "Delete account" || isDeleting
                        }
                        className="px-4 py-2 bg-red-500 text-white rounded-md font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isDeleting ? "Deleting..." : "Delete account"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </ProfileLayout>
  );
};

export default SecurityPage;
