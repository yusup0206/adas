// components
import Sidebar from "@/components/shared/Sidebar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <>
      <div className="w-full max-h-screen flex overflow-hidden">
        <div className="hidden md:flex w-full max-w-[300px]">
          <Sidebar />
        </div>
        <div className="w-full min-h-screen flex flex-1 flex-col bg-bgColor">
          <main className="relative max-h-screen overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
};

export default Layout;
