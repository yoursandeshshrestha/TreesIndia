"use client";

import { Phone, Mail, MapPin, Globe, Users, Award, Shield } from "lucide-react";

export function AboutSection() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">
          About TreesIndia
        </h2>
        <p className="text-gray-600 mt-1">
          Learn more about our mission and values
        </p>
      </div>

      {/* Company Overview */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6 text-white">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-4">
            Connecting You with Trusted Service Providers
          </h3>
          <p className="text-green-100 text-lg leading-relaxed">
            TreesIndia is your trusted platform for finding reliable, verified
            service providers for all your home and business needs. We connect
            customers with skilled professionals to make your life easier and
            your spaces better.
          </p>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Award className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Our Mission</h3>
          </div>
          <p className="text-gray-700 leading-relaxed">
            To revolutionize the service industry by providing a seamless
            platform that connects customers with verified, skilled
            professionals, ensuring quality service delivery and customer
            satisfaction.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Globe className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Our Vision</h3>
          </div>
          <p className="text-gray-700 leading-relaxed">
            To become the leading service marketplace in India, empowering
            millions of service providers and customers with technology-driven
            solutions that make everyday tasks convenient and reliable.
          </p>
        </div>
      </div>

      {/* Key Features */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Why Choose TreesIndia?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">
              Verified Professionals
            </h4>
            <p className="text-gray-600 text-sm">
              All our service providers are thoroughly verified and
              background-checked for your safety and peace of mind.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Wide Network</h4>
            <p className="text-gray-600 text-sm">
              Access to thousands of skilled professionals across various
              service categories in your area.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">
              Quality Assurance
            </h4>
            <p className="text-gray-600 text-sm">
              We ensure high-quality service delivery with customer feedback and
              satisfaction guarantees.
            </p>
          </div>
        </div>
      </div>

      {/* Services Overview */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Our Services
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Home Cleaning</h4>
            <p className="text-sm text-gray-600">
              Professional house cleaning services
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Plumbing</h4>
            <p className="text-sm text-gray-600">
              Expert plumbing and repair services
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Electrical</h4>
            <p className="text-sm text-gray-600">
              Licensed electrician services
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Carpentry</h4>
            <p className="text-sm text-gray-600">
              Skilled carpentry and woodwork
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Painting</h4>
            <p className="text-sm text-gray-600">
              Professional painting services
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Pest Control</h4>
            <p className="text-sm text-gray-600">
              Safe and effective pest control
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Appliance Repair</h4>
            <p className="text-sm text-gray-600">
              Expert appliance repair services
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">And More...</h4>
            <p className="text-sm text-gray-600">
              Wide range of services available
            </p>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Us</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Mail className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Email</p>
              <p className="text-gray-600">support@treesindiaservices.com</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Phone className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Phone</p>
              <p className="text-gray-600">+91 9641864615</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Phone className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Phone</p>
              <p className="text-gray-600">+91 7363952622</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <MapPin className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Address</p>
              <p className="text-gray-600">
                Sevoke Road, Shastri Nagar, Siliguri, Darjeeling, West Bengal -
                734001
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
