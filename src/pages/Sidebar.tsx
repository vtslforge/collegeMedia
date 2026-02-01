import React from "react";
import { useNavigate } from "react-router-dom";
import { Home, Rss, User, Users, MessageSquare, ChevronLeft, ChevronRight} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, isCollapsed, setIsCollapsed }) => {
  const navigate = useNavigate();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-[45] md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside 
        className={`fixed left-0 top-[6vh] bottom-0 z-50 bg-[#2b2d31] border-r border-[#1e1f22] transition-all duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${isCollapsed ? "md:w-20" : "md:w-64"} w-64 flex flex-col`}
      >
        {/* Desktop Collapse Arrow */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 bg-amber-600 text-white rounded-full p-1 shadow-lg md:block hidden"
        >
          {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>

        <nav className="flex-1 px-3 py-6 space-y-2">
          {[ 
            { label: "Home", path: "/home", icon: <Home size={22} /> },
            { label: "Feed", path: "/home/feed", icon: <Rss size={22} /> },
            { label: "Profile", path: "/home/profile", icon: <User size={22} /> },
            { label: "Community", path: "/home/community", icon: <Users size={22} /> },
            { label: "Chat", path: "/home/chat", icon: <MessageSquare size={22} /> },
          ].map((item) => (
            <button
              key={item.path}
              onClick={() => { navigate(item.path); setIsOpen(false); }}
              className="group relative flex items-center w-full p-3 rounded-xl hover:bg-[#35373c] text-[#949ba4] hover:text-white transition-all"
            >
              <div className="flex items-center justify-center min-w-[40px]">{item.icon}</div>
              <span className={`ml-3 font-semibold text-sm whitespace-nowrap transition-opacity duration-200 
                ${isCollapsed ? "md:opacity-0" : "opacity-100"}`}>
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        {/* User Profile Area */}
        
      </aside>
    </>
  );
};

export default Sidebar;