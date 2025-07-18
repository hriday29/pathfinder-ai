// components/Header.js

"use client"; // This directive makes it a Client Component

import { UserButton, SignInButton } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";

export default function Header() {
  const { user, isSignedIn } = useUser();

  return (
    <header className="p-4 sm:p-6 z-10">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 flex items-center justify-center">
            <div className="w-2.5 h-5 bg-white" style={{ clipPath: 'polygon(0 0, 100% 25%, 100% 100%, 0 75%)' }}></div>
          </div>
          <span className="text-xl font-bold tracking-tight">Pathfinder</span>
        </div>

        {/* Clerk Auth Button */}
        <div>
          {isSignedIn ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <SignInButton mode="modal">
              <button className="bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-4 rounded-lg text-sm transition-all duration-300 backdrop-blur-sm">
                Sign In
              </button>
            </SignInButton>
          )}
        </div>
      </div>
    </header>
  );
}