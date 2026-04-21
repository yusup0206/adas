import {  IoMenu } from "react-icons/io5";
import LangModal from "./LangModal";
import { useState } from "react";
import Sidebar from "../Sidebar";
import { Button } from "antd";

interface MainHeaderProps {
  title: string;
}

const Header = ({ title }: MainHeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // const navigate = useNavigate();

  // const handleLogout = () => {
  //   navigate("/admin/sign-in");
  // };

  return (
    <div className="sticky top-0 z-40 bg-bgColor w-full flex items-center justify-between gap-4 p-6 border-b border-borderColor">
      
      <div className="flex items-center gap-4">
        <div className="flex md:hidden">
        <Button 
          onClick={() => setIsMobileMenuOpen(true)}
          type="text"
          size="large"
          icon={<IoMenu className="size-6" />}
        />
        </div>
        <h1 className="text-headerColor text-2xl font-semibold">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        <LangModal />
        {/* <div className="flex items-center gap-2">
          <button
            onClick={handleLogout}
            className="text-textColor hover:text-red-500 active:text-red-500 transition-all cursor-pointer"
          >
            <IoLogOut className="size-6" />
          </button>
        </div> */}
        <div className="size-10 overflow-hidden rounded-full bg-gray-400">
          {/* <img src="" alt="" className="size-full object-cover" /> */}
        </div>
      </div>

      <div 
        className={`fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 md:hidden ${
          isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`} 
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <div 
          className={`fixed top-0 left-0 bottom-0 w-[300px] max-w-[85vw] bg-bgColor transition-transform duration-300 shadow-xl ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`} 
          onClick={e => e.stopPropagation()}
        >
          <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
        </div>
      </div>
    </div>
  );
};

export default Header;
