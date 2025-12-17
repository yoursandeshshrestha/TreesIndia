import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Contact Us</h1>

        <div className="space-y-6">
          <p className="text-gray-700 text-lg">
            If you have any questions or concerns regarding the company, please
            contact us at:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Email</h3>
              </div>
              <p className="text-gray-600">support@treesindiaservices.com</p>
            </div>

            {/* Phone 1 */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Phone className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Phone</h3>
              </div>
              <p className="text-gray-600">+91 9641864615</p>
            </div>

            {/* Phone 2 */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Phone className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Phone</h3>
              </div>
              <p className="text-gray-600">+91 7363952622</p>
            </div>

            {/* Address */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Address</h3>
              </div>
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
