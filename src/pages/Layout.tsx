import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#313338] text-[#dbdee1]">
      <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex">
        <Sidebar 
          isOpen={isSidebarOpen} 
          setIsOpen={setIsSidebarOpen} 
          isCollapsed={isCollapsed} 
          setIsCollapsed={setIsCollapsed} 
        />

        {/* FIX: Removed 'flex-1' to prevent width conflicts.
            Added 'w-full' to ensure the background color fills.
        */}
        <main 
          className={`
            w-full transition-all duration-300 ease-in-out pt-[6vh] min-h-screen
            ${isCollapsed ? "md:pl-20" : "md:pl-64"} 
            pl-0
          `}
        >
          {/* FIX: This inner div is the 'Feed Container'. 
              'max-w-[680px]' matches the standard social feed width (Twitter/Discord).
          */}
          <div className="p-4 md:p-8 relative z-10 max-w-[680px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;