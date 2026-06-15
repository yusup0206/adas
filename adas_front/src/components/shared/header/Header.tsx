import { IoMenu, IoLogOut } from "react-icons/io5";
import LangModal from "./LangModal";
import { useState } from "react";
import Sidebar from "../Sidebar";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/store/slices/authSlice";
import { useLogoutMutation } from "@/services/authApi";
import type { RootState } from "@/store";

interface MainHeaderProps {
  title: string;
}

const Header = ({ title }: MainHeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const [logoutApi] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutApi({}).unwrap();
    } catch (error) {
      console.error("Logout error", error);
    }
    dispatch(logout());
    localStorage.removeItem("refreshToken");
    navigate("/login");
  };

  return (
    <div className="sticky top-0 z-40 bg-bgColor w-full flex items-center justify-between gap-4 p-6 border-b border-borderColor">
      <div className="flex items-center gap-4">
        <div className="flex md:hidden">
          <Button
            onClick={() => setIsMobileMenuOpen(true)}
            type="primary"
            size="large"
            icon={<IoMenu />}
          />
        </div>
        <h1 className="text-headerColor text-xl md:text-2xl font-semibold">
          {title}
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={handleLogout}
          className="text-textColor hover:text-red-500 active:text-red-500 transition-all cursor-pointer ml-2"
          title="Logout"
        >
          <IoLogOut className="size-6" />
        </button>
        <LangModal />
        <div className="flex items-center gap-4">
          {user && (
            <span className="text-textColor font-medium hidden sm:block">
              {user.username}
            </span>
          )}
          <div className="size-10 overflow-hidden rounded-full bg-gray-400 flex items-center justify-center text-white font-bold">
            {user?.username?.[0]?.toUpperCase() || "U"}
          </div>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 md:hidden ${
          isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <div
          className={`fixed top-0 left-0 bottom-0 w-[300px] max-w-[85vw] bg-bgColor transition-transform duration-300 shadow-xl ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
        </div>
      </div>
    </div>
  );
};

export default Header;
