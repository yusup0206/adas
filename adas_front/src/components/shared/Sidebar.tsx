import { useLocation, useNavigate } from "react-router-dom";
import { sidebarData } from "@/pageData/sidebarData";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar = ({ onClose }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});

  const toggleDropdown = (key: string) => {
    setOpenDropdowns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="w-full h-screen flex flex-col border-r border-borderColor bg-bgColor">
      <div className="w-full h-[89px] p-4 flex items-center justify-between gap-4 border-b border-borderColor">
        <img
          src="/assets/images/logo2.png"
          alt="logo"
          className="h-14 object-contain mx-auto"
        />
      </div>

      <div className="w-full overflow-y-auto p-4">
        <div className="w-full h-full flex flex-col gap-2">
          {sidebarData.sidebarElements.map((item, index) => {
            if (item.children) {
              const isOpen = openDropdowns[item.labelKey];
              return (
                <div key={index} className="w-full flex flex-col gap-1">
                  <button
                    onClick={() => toggleDropdown(item.labelKey)}
                    className="w-full flex items-center justify-between gap-2 rounded-md px-3 py-2 hover:bg-primary/10 active:bg-primary/10 text-textColor cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-start gap-2">
                      {item.icon}
                      <h5 className="text-base font-semibold">{t(item.labelKey)}</h5>
                    </div>
                    {isOpen ? <FaChevronUp className="size-3" /> : <FaChevronDown className="size-3" />}
                  </button>
                  {isOpen && (
                    <div className="flex flex-col gap-1 pl-4">
                      {item.children.map((child, childIndex) => (
                        <button
                          key={childIndex}
                          onClick={() => {
                            if (child.url) navigate(child.url);
                            if (onClose) onClose();
                          }}
                          className={
                            child.url && location.pathname.includes(child.url)
                              ? "w-full flex items-center justify-start gap-2 rounded-md px-3 py-2 bg-primary/10 text-primary cursor-pointer text-start"
                              : "w-full flex items-center justify-start gap-2 rounded-md px-3 py-2 hover:bg-primary/10 active:bg-primary/10 text-textColor cursor-pointer text-start transition-all"
                          }
                        >
                          {child.icon}
                          <h5 className="text-sm font-medium">{t(child.labelKey)}</h5>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <button
                onClick={() => {
                  if (item.url) navigate(item.url);
                  if (onClose) onClose();
                }}
                key={index}
                className={
                  item.url && location.pathname.includes(item.url)
                    ? "w-full flex items-center justify-start gap-2 rounded-md px-3 py-2 bg-primary/10 text-primary cursor-pointer text-start"
                    : "w-full flex items-center justify-start gap-2 rounded-md px-3 py-2 hover:bg-primary/10 active:bg-primary/10 text-textColor cursor-pointer text-start transition-all"
                }
              >
                {item.icon}
                <h5 className="text-base font-semibold">{t(item.labelKey)}</h5>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
