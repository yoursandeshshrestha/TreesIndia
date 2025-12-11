export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Contact Us</h1>

        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-6">
          <p>
            If you have any questions or concerns regarding the company, please
            contact us at:
          </p>

          <p>📧 Email: support@treesindiaservices.com</p>

          <p>📞 Phone: +91 9641864615</p>
          <p>📞 Phone: +91 7363952622</p>

          <div>
            <p className="font-semibold mb-2">🏢 Address:</p>
            <p className="ml-6">
              Road/Street: Sevoke Road
              <br />
              Locality/Sub Locality: Shastri Nagar
              <br />
              City/Town/Village: Siliguri
              <br />
              District: Darjeeling
              <br />
              State: West Bengal
              <br />
              PIN Code: 734001
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
