import Image from "next/image";

export default function Hero() {
  return (
    <section className="py-10">
      <div className="max-w-[1240px] mx-auto px-4">
        <div className="flex flex-col items-center text-center space-y-12">
          {/* Content */}
          <div className="max-w-3xl space-y-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-snug">
              Everything you need for your home, in one app.
            </h1>

            <p className="text-normal md:text-[24px] text-gray-500 leading-normal">
              TreesIndia brings together home services, construction projects,
              rental properties, vendors and workforce into a single, easy
              platform. Discover, book and track everything from one place.
            </p>

            {/* Download Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <a
                href="https://apps.apple.com/in/app/trees-india/id6755545594"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity duration-200"
                aria-label="Download on the App Store"
              >
                <Image
                  src="/assets/app_store.svg"
                  alt="Download on the App Store"
                  width={140}
                  height={48}
                />
              </a>
              <a
                href="https://play.google.com/store/apps/details?id=com.treesIndia.treesIndia&pcampaignid=web_share"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity duration-200"
                aria-label="Get it on Google Play"
              >
                <Image
                  src="/assets/play_store.svg"
                  alt="Get it on Google Play"
                  width={140}
                  height={48}
                />
              </a>
            </div>
          </div>

          {/* Mobile Mockup */}
          <div className="flex justify-center ">
            <div className="relative w-full max-w-[900px] border-b-2 border-gray-300 ">
              <Image
                src="/assets/mockup.png"
                alt="TreesIndia Mobile App"
                width={900}
                height={600}
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
