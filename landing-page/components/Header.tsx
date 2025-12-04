import Image from "next/image";

export default function Header() {
  return (
    <header className="sticky top-0 bg-white z-50">
      <div className="max-w-[1240px] mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Image
            src="/assets/main_logo_with_name.png"
            alt="TreesIndia"
            width={180}
            height={50}
            className="h-10 w-auto"
          />
        </div>
      </div>
    </header>
  );
}
