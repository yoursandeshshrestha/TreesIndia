export default function HowItWorks() {
  const steps = [
    {
      number: "1",
      title: "Download the app",
      description: "Get TreesIndia from App Store or Play Store.",
    },
    {
      number: "2",
      title: "Choose your service",
      description: "Browse through services and select what you need.",
    },
    {
      number: "3",
      title: "Book instantly",
      description: "Schedule and pay securely within the app.",
    },
    {
      number: "4",
      title: "Track everything",
      description: "Monitor progress and communicate in real-time.",
    },
  ];

  return (
    <section className="py-16">
      <div className="max-w-[1240px] mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-snug mb-4">
            How it works
          </h2>
          <p className="text-normal md:text-[20px] text-gray-500 leading-normal max-w-2xl mx-auto">
            Getting started with TreesIndia is simple and straightforward.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-bold text-gray-300 mb-3">
                {step.number}
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                {step.title}
              </h3>
              <p className="text-sm md:text-base text-gray-500 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
