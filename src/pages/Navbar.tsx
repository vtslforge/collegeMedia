import React from "react";
import { Menu } from "lucide-react";

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  return (
    <nav className="h-[6vh] z-60 bg-navbar_bg  fixed top-0 left-0 w-full flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <button 
          onClick={onMenuClick}
          className="p-2 hover:bg-[#35373c] rounded-lg md:hidden transition-colors"
        >
          <Menu size={20} />
        </button>

        </div>
    </nav>
  );
};

export default Navbar;