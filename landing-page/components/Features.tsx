
export default function Features() {
  const features = [
    {
      title: "Home Services",
      description:
        "Book trusted professionals for repairs, maintenance, and home care services.",
      color: "bg-blue-50",
    },
    {
      title: "Construction Projects",
      description:
        "Manage your construction projects with verified contractors and real-time tracking.",
      color: "bg-green-50",
    },
    {
      title: "Rental Properties",
      description:
        "Find and list rental properties with ease. Connect with property owners and tenants.",
      color: "bg-purple-50",
    },
    {
      title: "Vendor Network",
      description:
        "Access a wide network of verified vendors for all your home and construction needs.",
      color: "bg-amber-50",
    },
  ];

  return (
    <section className="py-16">
      <div className="max-w-[1240px] mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-snug mb-4">
            Everything in one platform
          </h2>
          <p className="text-normal md:text-[20px] text-gray-500 leading-normal max-w-2xl mx-auto">
            From home services to construction management, TreesIndia brings it
            all together.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* First item - spans 2 columns on desktop */}
          <div
            className={`${features[0].color} p-8 rounded-2xl md:col-span-2 flex flex-col justify-center`}
          >
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
              {features[0].title}
            </h3>
            <p className="text-base text-gray-600 leading-relaxed">
              {features[0].description}
            </p>
          </div>

          {/* Second item - spans 1 column */}
          <div
            className={`${features[1].color} p-8 rounded-2xl flex flex-col justify-center`}
          >
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
              {features[1].title}
            </h3>
            <p className="text-base text-gray-600 leading-relaxed">
              {features[1].description}
            </p>
          </div>

          {/* Third item - spans 1 column */}
          <div
            className={`${features[2].color} p-8 rounded-2xl flex flex-col justify-center`}
          >
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
              {features[2].title}
            </h3>
            <p className="text-base text-gray-600 leading-relaxed">
              {features[2].description}
            </p>
          </div>

          {/* Fourth item - spans 2 columns on desktop */}
          <div
            className={`${features[3].color} p-8 rounded-2xl md:col-span-2 flex flex-col justify-center`}
          >
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
              {features[3].title}
            </h3>
            <p className="text-base text-gray-600 leading-relaxed">
              {features[3].description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
