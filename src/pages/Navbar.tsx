import React, { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { auth } from "../firebase";
import { onAuthStateChanged, type User } from "firebase/auth";
import logo from "../assets/logo.svg";

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser || null);
    });
    return () => unsub();
  }, []);

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Guest";

  return (
    <nav className="h-[6vh] z-60 fixed top-0 left-0 w-full flex items-center justify-between px-4 md:px-6 bg-[linear-gradient(135deg,rgba(255,255,255,0.75),rgba(255,255,255,0.55))] backdrop-blur-xl border-b border-slate-200/60">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-xl bg-white/80 border border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300 md:hidden transition-colors"
        >
          <Menu size={20} />
        </button>
        <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-600">
          <img src={logo} alt="College Media App" className="h-7 w-7 rounded-xl" />
          <span>College Media App</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-3 rounded-full border border-slate-200 bg-white/80 px-3 py-2">
          <div className="h-8 w-8 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xs font-semibold">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="text-sm font-semibold text-slate-900">{displayName}</div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

