import type { Metadata } from "next";
import Image from "next/image";
import "./globals.css";

export const metadata: Metadata = {
  title: "Enneagram Assessment",
  description: "Take the comprehensive Enneagram assessment to understand your deep motivations, personality type, and paths to growth..",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className="bg-gray-50 min-h-screen flex flex-col">
        {/* Navigation Bar */}
        <nav className="bg-white border-b border-gray-100 p-4 mb-8">
          <div className="container mx-auto flex justify-between items-center max-w-4xl">
            <a href="/" className="flex items-center space-x-2">
              <Image src="/logo.png" alt="Enneagram Assessment Logo" width={32} height={32} className="h-8 w-8 object-contain" />
              <span className="text-xl font-bold text-black tracking-wide">Enneagram Assessment</span>
            </a>
            <div className="relative">
              <button id="menu-button" className="text-gray-600 hover:text-black hover:bg-gray-50 p-2 rounded-lg transition-colors flex items-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              </button>
              <div id="dropdown-menu" className="hidden absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50">
                <a href="/" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors">Home</a>
                <div className="border-t border-gray-100 my-1"></div>
                <a href="/admin" className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Settings</span>
                </a>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="main-content max-w-4xl mx-auto flex-grow w-full px-4">
          {/* Centered Header */}
          <div className="text-center mb-4">
            <Image
              src="/logo.png"
              alt="Enneagram Assessment Logo"
              width={64}
              height={64}
              className="w-16 h-16 drop-shadow-lg mx-auto mb-4 object-contain"
            />
            <h1 className="text-4xl font-extrabold text-black tracking-wide mb-2">
              Enneagram Assessment
            </h1>
            <p className="text-gray-500 text-lg">
              Take the comprehensive Enneagram assessment to understand<br />
              your deep motivations, personality type, and paths to growth.
            </p>
          </div>

          {children}
        </main>

        {/* Dropdown JS */}
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              var btn = document.getElementById('menu-button');
              var menu = document.getElementById('dropdown-menu');
              if (btn && menu) {
                btn.addEventListener('click', function(e) {
                  e.stopPropagation();
                  menu.classList.toggle('hidden');
                });
                document.addEventListener('click', function(e) {
                  if (!menu.contains(e.target) && !btn.contains(e.target)) {
                    menu.classList.add('hidden');
                  }
                });
              }
            })();
          `
        }} />
      </body>
    </html>
  );
}
