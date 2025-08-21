"use client";

import React from "react";
import { useUserState } from "@/hooks/useUserState";

interface UserProviderProps {
  children: React.ReactNode;
}

const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  useUserState();

  return <>{children}</>;
};

export default UserProvider;
