"use client";

// Social media icons removed - using text links instead
import Image from "next/image";
import Link from "next/link";

interface FooterProps {
  className?: string;
}

export default function Footer({ className = "" }: FooterProps) {
  return (
    <footer
      className={`bg-[#f5f5f5] text-gray-800 relative overflow-hidden mt-20 ${className}`}
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
                  <Link
                    href="/about"
                    className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium text-sm"
                  >
                    About us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-and-conditions"
                    className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium text-sm"
                  >
                    Terms & conditions
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium text-sm"
                  >
                    Privacy policy
                  </Link>
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
                  <Link
                    href="/contact"
                    className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium text-sm"
                  >
                    Contact us
                  </Link>
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
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900 tracking-wide uppercase text-sm">
                Follow us
              </h3>

              {/* Social Media Links */}
              <ul className="space-y-3">
                <li>
                  <a
                    href="https://www.facebook.com/profile.php?id=61579782072503"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium text-sm"
                  >
                    Facebook
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.instagram.com/treesindiaservices/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium text-sm"
                  >
                    Instagram
                  </a>
                </li>
              </ul>

              {/* App Download Buttons */}
              {/* <div className="space-y-3">
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
              </div> */}
            </div>
          </div>
        </div>

        {/* Copyright and Legal Information */}
        <div className="border-t border-gray-300">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <p className="text-gray-500 text-sm text-center font-medium leading-relaxed">
              * As on October 7, 2025 Copyright 2025 Trees India Ltd. All rights
              reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
