"use client";

import { useState, useRef } from "react";

interface AboutUsSectionProps {
  className?: string;
}

export default function AboutUsSection({
  className = "",
}: AboutUsSectionProps) {
  return (
    <section className={`py-20 px-6 max-w-7xl mx-auto ${className} `}>
      {/* Top Section - Text Content */}
      <div className="grid lg:grid-cols-2 gap-16 items-start mb-20">
        {/* Left Side */}
        <div className="space-y-8">
          <div className="inline-block bg-[#055c3a] text-white px-4 py-2 rounded-md text-sm font-medium shadow-md">
            ABOUT US
          </div>
          <h2 className="text-3xl font-medium text-gray-900 leading-tight">
            Trusted By Hundreds Of
            <br />
            Happy Homes
          </h2>
        </div>

        {/* Right Side */}
        <div className="pt-12">
          <p className="text-gray-500 text-md leading-relaxed max-w-lg">
            We believe a clean home creates space for a better life. From
            standard upkeep to detailed deep cleaning, we handle every corner
            with care, precision, and eco-friendly solutions.
          </p>
        </div>
      </div>

      {/* Middle Section - Video Player */}
      <div className="mb-20">
        <div className="relative rounded-3xl overflow-hidden shadow-xl">
          <video
            className="w-full h-96 lg:h-[500px] object-cover"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src="/video/cleaning.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>

      {/* Bottom Section - Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
        <div className="text-center">
          <div className="text-3xl font-normal text-gray-900 mb-3">1,200+</div>
          <div className="text-gray-600 text-sm">Services Booked</div>
        </div>

        <div className="text-center">
          <div className="text-3xl font-normal text-gray-900 mb-3">98%</div>
          <div className="text-gray-600 text-sm">Customer Satisfaction</div>
        </div>

        <div className="text-center">
          <div className="text-3xl font-normal text-gray-900 mb-3">4.9/5</div>
          <div className="text-gray-600 text-sm">Average Rating</div>
        </div>

        <div className="text-center">
          <div className="text-3xl font-normal text-gray-900 mb-3">5+</div>
          <div className="text-gray-600 text-sm">Years of Experience</div>
        </div>
      </div>
    </section>
  );
}
