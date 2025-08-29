import Link from "next/link";

const PageNotFound = () => {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Background text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <h2 className="text-9xl md:text-[200px] font-bold text-gray-100 select-none whitespace-nowrap">
          TREESINDIA
        </h2>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-2xl w-full text-center">
        {/* 404 badge */}
        <div className="inline-block bg-blue-50 rounded-lg px-6 py-2 mb-8">
          <span className="text-blue-800 font-medium">404</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Oops! Page not found.
        </h1>

        <p className="text-xl text-gray-600 mb-12 mx-auto max-w-lg">
          We couldn&apos;t find the page you&apos;re looking for. It might have
          been moved or doesn&apos;t exist anymore.
        </p>
      </div>

      <Link
        href="/"
        className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-[#055c3a] rounded-lg hover:bg-[#044a2f] focus:outline-none focus:ring-2 focus:ring-[#055c3a] focus:ring-offset-2 transition-colors duration-200"
      >
        Back to homepage
      </Link>
    </div>
  );
};

export default PageNotFound;
