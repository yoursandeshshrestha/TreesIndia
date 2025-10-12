"use client";

import Image from "next/image";
import { Worker } from "@/types/worker";
import { MapPin, Phone, Mail, Check, MessageCircle } from "lucide-react";
import { parseSkills } from "@/utils/workerTransformers";

interface WorkerCardProps {
  worker: Worker;
  className?: string;
  onClick?: (worker: Worker) => void;
  onChatClick?: (worker: Worker) => void;
  currentUserId?: number;
}

export function WorkerCard({
  worker,
  className = "",
  onClick,
  onChatClick,
  currentUserId,
}: WorkerCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(worker);
    }
  };

  const handleChatClick = () => {
    if (onChatClick) {
      onChatClick(worker);
    }
  };

  const workerSkills = parseSkills(worker.skills);

  const getDefaultImage = () => {
    return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTUwQzE4NS4wNDcgMTUwIDE3MyAxMzcuOTUzIDE3MyAxMjNDMTczIDEwOC4wNDcgMTg1LjA0NyA5NiAyMDAgOTZDMjE0Ljk1MyA5NiAyMjcgMTA4LjA0NyAyMjcgMTIzQzIyNyAxMzcuOTUzIDIxNC45NTMgMTUwIDIwMCAxNTBaIiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik0yMDAgMTgwQzE2NS42NDkgMTgwIDEzNyAxNjUuNjQ5IDEzNyAxNDdDMTM3IDEyOC4zNTEgMTY1LjY0OSAxMTQgMjAwIDExNEMyMzQuMzUxIDExNCAyNjMgMTI4LjM1MSAyNjMgMTQ3QzI2MyAxNjUuNjQ5IDIzNC4zNTEgMTgwIDIwMCAxODBaIiBmaWxsPSIjOUI5QkEwIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUI5QkEwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K";
  };

  const formatLocation = () => {
    const { city, state } = worker.address;
    if (city && state) return `${city}, ${state}`;
    if (city) return city;
    if (state) return state;
    return "Location not specified";
  };

  const formatContactInfo = () => {
    const contactInfo =
      typeof worker.contact_info === "string"
        ? JSON.parse(worker.contact_info)
        : worker.contact_info;

    return {
      email: contactInfo.email || worker.user?.email || "Email not provided",
      phone: contactInfo.phone || worker.user?.phone || "Phone not provided",
      name: contactInfo.name || worker.user?.name || "Unknown Worker",
    };
  };

  const contactInfo = formatContactInfo();

  // Check if current user is the same as the worker
  const isCurrentUserWorker = currentUserId && currentUserId === worker.user_id;

  return (
    <div className={`group cursor-pointer ${className}`} onClick={handleClick}>
      <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-4 sm:p-6 w-full h-full hover:shadow-lg transition-shadow duration-300">
        {/* Top Section - Profile Picture, Name, Role, Rating, Availability */}
        <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
          {/* Profile Picture with Verification Badge */}
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden">
              <Image
                src={
                  worker.documents.profile_pic
                    ? worker.documents.profile_pic
                    : getDefaultImage()
                }
                alt={contactInfo.name}
                width={64}
                height={64}
                className="object-cover w-full h-full"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.src.includes("data:image/svg+xml")) {
                    target.src = getDefaultImage();
                  }
                }}
              />
            </div>
            {/* Verification Badge */}
            {worker.worker_type === "treesindia_worker" && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                <Check className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" />
              </div>
            )}
          </div>

          {/* Worker Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
              {contactInfo.name}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              {worker.worker_type === "treesindia_worker"
                ? "TreesIndia Worker"
                : "Independent Worker"}
            </p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-6">
          <div className="flex items-center text-gray-600">
            <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 sm:mr-3 text-gray-400 flex-shrink-0" />
            <span className="text-xs sm:text-sm truncate">
              {contactInfo.email}
            </span>
          </div>
          <div className="flex items-center text-gray-600">
            <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 sm:mr-3 text-gray-400 flex-shrink-0" />
            <span className="text-xs sm:text-sm truncate">
              {contactInfo.phone}
            </span>
          </div>
          <div className="flex items-center text-gray-600">
            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 sm:mr-3 text-gray-400 flex-shrink-0" />
            <span className="text-xs sm:text-sm truncate">
              {formatLocation()}
            </span>
          </div>
        </div>

        {/* Key Skills Section */}
        {workerSkills && workerSkills.length > 0 && (
          <div className="mb-4 sm:mb-6">
            <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 sm:mb-3">
              Key Skills
            </h4>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {workerSkills.slice(0, 4).map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700"
                >
                  {skill}
                </span>
              ))}
              {workerSkills.length > 4 && (
                <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                  +{workerSkills.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 sm:gap-3">
          {!isCurrentUserWorker && (
            <button
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium sm:font-semibold py-2 px-3 sm:px-4 rounded-lg flex items-center justify-center space-x-1 sm:space-x-2 transition-colors text-sm"
              onClick={(e) => {
                e.stopPropagation();
                handleChatClick();
              }}
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat</span>
            </button>
          )}
          <button
            className={`${
              isCurrentUserWorker ? "w-full" : "flex-1"
            } bg-white text-black border border-gray-300 hover:bg-gray-50 font-medium sm:font-semibold py-2 px-3 sm:px-4 rounded-lg flex items-center justify-center space-x-1 sm:space-x-2 transition-colors text-sm`}
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span>Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}
