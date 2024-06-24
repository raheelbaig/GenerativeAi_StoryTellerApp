import { BookOpen, FilePen } from "lucide-react";
import Link from "next/link";

function Header() {
  return (
    <header className="relative py-16 px-8 text-center">
      <Link href="/">
        <h1 className="text-3xl md:text-4xl font-black">StoryTeller AI</h1>
        <div className="flex justify-center space-x-2 text-lg md:text-2xl lg:text-4xl">
          <h2 className="font-semibold">Bringing Your Stories</h2>
          <div className="relative">
            <div className=" bg-purple-500 px-1 -rotate-2">
              <p className=" text-white">To Life!</p>
            </div>
          </div>
        </div>
      </Link>

      {/* Nav Icons */}
      <div className="absolute -top-5 right-5 flex space-x-2">
        <Link href="/">
          <FilePen className="w-8 h-8 lg:w-10 lg:h-10 mx-auto text-purple-500 mt-10 border border-purple-500 p-2 rounded-md hover:opacity-50 cursor-pointer" />
        </Link>
        <Link href="/stories">
          <BookOpen className="w-8 h-8 lg:w-10 lg:h-10 mx-auto text-purple-500 mt-10 border border-purple-500 p-2 rounded-md hover:opacity-50 cursor-pointer" />
        </Link>
      </div>
    </header>
  );
}

export default Header;
