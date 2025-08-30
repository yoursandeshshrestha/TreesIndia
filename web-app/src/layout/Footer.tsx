"use client";

import { Facebook, Linkedin, Instagram, Twitter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface FooterProps {
  className?: string;
}

export default function Footer({ className = "" }: FooterProps) {
  return (
    <footer
      className={`bg-[#f5f5f5] text-gray-800 relative overflow-hidden ${className}`}
    >
      {/* Geometric Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #374151 2px, transparent 2px), radial-gradient(circle at 75% 75%, #374151 2px, transparent 2px)`,
            backgroundSize: "50px 50px",
          }}
        ></div>
      </div>

      <div className="relative z-10">
        {/* Logo and Navigation Section */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Logo */}
          <Link href="/" className="flex items-center mb-8">
            <Image
              src="/logo/treesindia-logo.png"
              alt="Trees India Logo"
              width={250}
              height={250}
            />
          </Link>

          {/* Four Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Column 1: Company */}
            <div className="space-y-4">
              <h3 className="font-bold  text-gray-900 tracking-wide uppercase text-sm">
                Company
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium text-sm"
                  >
                    About us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium text-sm"
                  >
                    Terms & conditions
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium text-sm"
                  >
                    Privacy policy
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 2: For customers */}
            <div className="space-y-4">
              <h3 className="font-bold  text-gray-900 tracking-wide uppercase text-sm">
                For customers
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium text-sm"
                  >
                    Contact us
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: For professionals */}
            <div className="space-y-4">
              <h3 className="font-bold  text-gray-900 tracking-wide uppercase text-sm">
                For professionals
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="/apply/worker"
                    className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium text-sm"
                  >
                    Register as a worker
                  </a>
                </li>
                <li>
                  <a
                    href="/apply/broker"
                    className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium text-sm"
                  >
                    Register as a broker
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4: Social links */}
            <div className="space-y-6">
              <h3 className="font-semibold text-gray-900 uppercase text-xs tracking-wider">
                Follow us
              </h3>

              {/* Social Media Icons */}
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="text-gray-500 hover:text-gray-900 transition-colors duration-200"
                  aria-label="Follow us on Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="text-gray-500 hover:text-gray-900 transition-colors duration-200"
                  aria-label="Follow us on Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="text-gray-500 hover:text-gray-900 transition-colors duration-200"
                  aria-label="Follow us on Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="text-gray-500 hover:text-gray-900 transition-colors duration-200"
                  aria-label="Follow us on LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>

              {/* App Download Buttons */}
              <div className="space-y-3">
                <button className="flex items-center hover:opacity-80 transition-opacity duration-200">
                  <Image
                    src="/images/footer/app_store.svg"
                    alt="Download on the App Store"
                    width={120}
                    height={40}
                  />
                </button>
                <button className="flex items-center hover:opacity-80 transition-opacity duration-200">
                  <Image
                    src="/images/footer/play_store.svg"
                    alt="GET IT ON Google Play"
                    width={120}
                    height={40}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright and Legal Information */}
        <div className="border-t border-gray-300">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <p className="text-gray-500 text-sm text-center font-medium leading-relaxed">
              * As on December 31, 2024 Copyright 2025 Trees India Ltd. All
              rights reserved. | CIN: U74140DL2014PTC274413
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
