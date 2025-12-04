import Image from "next/image";

export default function CTA() {
  return (
    <section className="py-16">
      <div className="max-w-[1240px] mx-auto px-4">
        <div className="flex flex-col items-center text-center space-y-6">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-snug max-w-2xl">
            Ready to simplify your home and construction needs?
          </h2>
          <p className="text-normal md:text-[20px] text-gray-500 leading-normal max-w-2xl">
            Download TreesIndia today and experience the convenience of
            managing everything in one place.
          </p>

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
      </div>
    </section>
  );
}
