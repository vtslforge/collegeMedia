import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  return (
    <div
      className="min-h-screen overflow-x-hidden bg-primaryBg">
      <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <main
          className={`
            w-full transition-all duration-300 ease-in-out pt-[6vh] min-h-screen
            ${isCollapsed ? "md:pl-20" : "md:pl-64"} 
            pl-0
          `}>
          <div className="relative z-10 max-w-170 mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
