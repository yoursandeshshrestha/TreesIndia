import Image from "next/image";

export default function Footer() {
  return (
    <footer className="py-16 border-t border-gray-200 mt-16">
      <div className="max-w-[1240px] mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <Image
              src="/assets/main_logo_with_name.png"
              alt="TreesIndia"
              width={180}
              height={50}
              className="h-10 w-auto"
            />
            <p className="text-sm text-gray-500 leading-relaxed">
              Everything you need for your home and construction needs, in one
              platform.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Quick Links</h3>
            <div className="space-y-3">
              <a
                href="https://treesindiaservices.com/about"
                className="block text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                About Us
              </a>
              <a
                href="https://treesindiaservices.com/contact"
                className="block text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Contact
              </a>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Legal</h3>
            <div className="space-y-3">
              <a
                href="https://treesindiaservices.com/privacy-policy"
                className="block text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="https://treesindiaservices.com/terms-and-conditions"
                className="block text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Terms & Conditions
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            © 2024 TreesIndia. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
