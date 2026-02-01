import React from "react";
import { Search, Grid, Menu } from "lucide-react";

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  return (
    <nav className="h-[6vh] z-[60] fixed top-0 left-0 w-full bg-[#1e1f22]/95 backdrop-blur-sm border-b border-[#1e1f22] flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <button 
          onClick={onMenuClick}
          className="p-2 hover:bg-[#35373c] rounded-lg md:hidden transition-colors"
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-2">
          <Grid size={22} className="text-amber-500" />
          <span className="font-black text-white text-lg tracking-tighter">
            COLLEGE<span className="text-amber-500 uppercase">Media</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center bg-[#111214] rounded-md px-3 py-1.5 border border-[#1e1f22]">
          <Search size={14} className="text-[#949ba4]" />
          <input className="bg-transparent border-none text-xs ml-2 outline-none text-white" placeholder="Search..." />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;