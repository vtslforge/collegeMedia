import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Rss, User, Users, MessageSquare, ChevronLeft, ChevronRight, Briefcase } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, isCollapsed, setIsCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      )}

      <aside
        className={`fixed left-0 top-[6vh] bottom-0 z-50 border-r border-white/40 bg-white/70 backdrop-blur-xl transition-all duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${isCollapsed ? "md:w-20" : "md:w-64"} w-64 flex flex-col`}
      >
        {/* Desktop Collapse Arrow */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 bg-slate-900 text-white rounded-full p-1 shadow-lg md:block hidden"
        >
          {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>

        <div className={`px-4 pt-6 pb-4 ${isCollapsed ? "md:px-2" : "md:px-5"}`}>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-semibold">
              PU
            </div>
            <div className={`${isCollapsed ? "md:hidden" : "block"}`}>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Presidency</p>
              <p className="text-sm font-semibold text-slate-900">Centralized App</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1">
          {[
            { label: "Home", path: "/home", icon: <Home size={20} /> },
            { label: "Feed", path: "/home/feed", icon: <Rss size={20} /> },
            { label: "Profile", path: "/home/profile", icon: <User size={20} /> },
            { label: "Community", path: "/home/community", icon: <Users size={20} /> },
            { label: "Chat", path: "/home/chat", icon: <MessageSquare size={20} /> },
            { label: "Career", path: "/home/career", icon: <Briefcase size={20} /> },
          ].map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setIsOpen(false);
                }}
                className={`group relative flex items-center w-full p-3 rounded-2xl transition-all ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white"
                }`}
              >
                <div className="flex items-center justify-center min-w-10">{item.icon}</div>
                <span
                  className={`ml-3 font-semibold text-sm whitespace-nowrap transition-opacity duration-200 ${
                    isCollapsed ? "md:opacity-0" : "opacity-100"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        <div className={`px-4 pb-5 ${isCollapsed ? "md:px-2" : "md:px-5"}`}>
          <div className="rounded-2xl border border-slate-200 bg-white/70 p-3 text-xs text-slate-600">
            <div className="font-semibold text-slate-900">Need help?</div>
            <p className="mt-1">Check announcements and updates in the Feed.</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
