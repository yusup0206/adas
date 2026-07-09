import { IoMenu, IoLogOut, IoArrowBack } from "react-icons/io5";
import { MdLanguage } from "react-icons/md";
import LangModal from "./LangModal";
import { useState } from "react";
import Sidebar from "../Sidebar";
import { Button, Dropdown } from "antd";
import type { MenuProps } from "antd";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/store/slices/authSlice";
import { useLogoutMutation } from "@/services/authApi";
import type { RootState } from "@/store";
import { useTranslation } from "react-i18next";

interface MainHeaderProps {
  title: string;
  goBack?: boolean;
}

const Header = ({ title, goBack }: MainHeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const [logoutApi] = useLogoutMutation();
  const { t } = useTranslation();

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

  const menuItems: MenuProps["items"] = [
    {
      key: "profile-header",
      label: (
        <div className="px-2 py-1.5 border-b border-borderColor max-w-[180px]">
          <div className="font-semibold text-textColor truncate">
            {user?.username || "User"}
          </div>
          <div className="text-xs text-textColor/60 truncate mt-0.5 capitalize">
            {user?.role || t("user")}
          </div>
        </div>
      ),
      type: "group",
    },
    {
      key: "lang",
      label: (
        <LangModal
          trigger={
            <div className="flex items-center gap-2 py-1 text-textColor">
              <MdLanguage className="text-lg text-textColor/75" />
              <span>{t("select_language")}</span>
            </div>
          }
        />
      ),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      danger: true,
      label: (
        <div onClick={handleLogout} className="flex items-center gap-2 py-1">
          <IoLogOut className="text-lg" />
          <span>{t("logout")}</span>
        </div>
      ),
    },
  ];

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
        {goBack && (
          <Button
            onClick={() => navigate(-1)}
            type="default"
            size="large"
            icon={<IoArrowBack />}
          />
        )}

        <h1 className="text-headerColor text-xl md:text-2xl font-semibold">
          {title}
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <Dropdown
          menu={{ items: menuItems }}
          trigger={["click"]}
          placement="bottomRight"
          overlayClassName="min-w-[200px]"
          className="min-w-[200px]"
        >
          <div className="flex items-center justify-end gap-2.5 cursor-pointer group hover:bg-gray-100 dark:hover:bg-white/5 px-2.5 py-1.5 rounded-full transition-all duration-300">
            <div className="relative">
              <div className="size-9 overflow-hidden rounded-full bg-linear-to-tr from-primary to-blue-500 flex items-center justify-center text-white font-bold shadow-sm group-hover:scale-105 transition-transform duration-300">
                {user?.username?.[0]?.toUpperCase() || "U"}
              </div>
            </div>
            {/* {user && (
              <span className="text-textColor font-medium hidden sm:block select-none group-hover:text-primary transition-colors duration-300">
                {user.username}
              </span>
            )}
            <IoChevronDown className="text-textColor/50 group-hover:text-textColor transition-colors duration-300 size-3.5 hidden sm:block" /> */}
          </div>
        </Dropdown>
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
