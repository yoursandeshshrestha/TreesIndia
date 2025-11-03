export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        
        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>
            <p>We may collect the following types of information when you use our Services:</p>
            <p>
              <strong>Personal Information:</strong> Name, phone number, email address, and location details when you register or book a service.
            </p>
            <p>
              <strong>Service Information:</strong> Details related to the services you request, such as category, timing, and location.
            </p>
            <p>
              <strong>Payment Information:</strong> When you make payments through our platform, we may collect transaction details. (Note: Payment processing is handled by secure third-party providers.)
            </p>
            <p>
              <strong>Device Information:</strong> IP address, browser type, operating system, and device identifiers to help us improve user experience.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. How We Use Your Information</h2>
            <p>We use the collected information to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide, manage, and improve our Services.</li>
              <li>Connect you with verified professionals for the requested services.</li>
              <li>Communicate updates, offers, and service-related information.</li>
              <li>Ensure customer support and respond to queries.</li>
              <li>Comply with legal and regulatory obligations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Sharing of Information</h2>
            <p>We do not sell or rent your personal data. We may share information only with:</p>
            <p>
              <strong>Service Professionals:</strong> To fulfill your requested services.
            </p>
            <p>
              <strong>Payment Gateways:</strong> For secure transaction processing.
            </p>
            <p>
              <strong>Third-Party Partners:</strong> Who assist in analytics, support, or marketing (under strict confidentiality agreements).
            </p>
            <p>
              <strong>Legal Authorities:</strong> When required by law or to protect the rights and safety of users or the company.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Data Security</h2>
            <p>
              We implement robust technical and organizational measures to protect your data against unauthorized access, alteration, disclosure, or destruction. All sensitive information is encrypted and transmitted over secure channels.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access and review your personal data.</li>
              <li>Request correction or deletion of your information.</li>
              <li>Withdraw consent for data processing (subject to legal obligations).</li>
            </ul>
            <p>You can exercise these rights by contacting us at [insert support email].</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Cookies and Tracking</h2>
            <p>
              Our app and website may use cookies or similar technologies to enhance user experience and analyze usage patterns. You can manage cookie preferences through your device or browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Updates to This Policy</h2>
            <p>
              We may update this Privacy Policy periodically. Any changes will be posted on our website/app with an updated effective date. We encourage users to review this policy regularly.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

