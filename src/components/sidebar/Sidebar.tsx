import clsx from "clsx";
import React from "react";
import { FaRegCircleUser } from "react-icons/fa6";
import { FiMessageSquare } from "react-icons/fi";
import { GoChevronRight } from "react-icons/go";
import { IoIosSearch } from "react-icons/io";
import {
  IoCarSportSharp,
  IoDocumentTextOutline,
  IoExitOutline,
  IoNewspaperOutline,
} from "react-icons/io5";
import { MdAttachMoney } from "react-icons/md";
import { RxHamburgerMenu } from "react-icons/rx";
import { useLocation, useNavigate } from "react-router-dom";
import { useSidebar } from "./SidebarContext";

import type { ReactElement, SVGProps } from "react";
import { useUserStore } from "../../store/useUserStore";

interface SidebarLink {
  name: string;
  icon: ReactElement<SVGProps<SVGAElement>>;
  path: string;
  disabled?: boolean;
}

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUserStore();

  const { isOpen, setIsOpen } = useSidebar();

  // links
  const links: SidebarLink[] = [
    { name: "Профиль", icon: <FaRegCircleUser />, path: "/account/profile" },
    {
      name: "История запросов",
      icon: <IoDocumentTextOutline />,
      path: "/account/query",
      disabled: !user?.is_email_verified,
    },
    {
      name: "Тарифы",
      icon: <MdAttachMoney />,
      path: "/account/plans",
    },
    {
      name: "Техподдержка",
      icon: <FiMessageSquare />,
      path: "/account/appeals",
    },
    {
      name: "Новости",
      icon: <IoNewspaperOutline />,
      path: "/account/news",
    },
    { name: "Поиск физ.лица", icon: <IoIosSearch />, path: "/account/search" },
    {
      name: "Поиск авто",
      icon: <IoCarSportSharp />,
      path: "/account/search-car",
    },
  ];

  const isActive = (path: string): boolean => {
    if (path === "/account/search") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <section
      className={clsx(
        "fixed z-50 h-screen text-slate-300 bg-sbr pl-4 py-4 flex flex-col justify-between transition-all duration-300 ease-in-out min-w-[80px]",
        isOpen ? "w-[80px]" : "w-[300px]",
      )}
    >
      {/* hamburger */}
      <button
        data-testid="hamburger-button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={clsx(
          "flex justify-end px-3 py-2 mb-6 text-slate-400 hover:text-white transition",
          isOpen && "items-center justify-center",
        )}
      >
        {isOpen ? <GoChevronRight size={36} /> : <RxHamburgerMenu size={30} />}
      </button>

      {/* links */}
      <div className="flex flex-col gap-4 flex-1">
        {links.map((link) => (
          <button
            key={link.path}
            onClick={() => navigate(link.path)}
            className={clsx(
              "flex items-center gap-3 rounded-l-md px-3 py-2 text-left transition-colors",
              isActive(link.path)
                ? "bg-white text-blue01"
                : "bg-transparent text-slate-300 hover:text-white",
            )}
          >
            <span
              className={clsx(
                "flex-shrink-0 flex items-center justify-center transition-all duration-300",
              )}
            >
              {React.cloneElement(link.icon, {
                className: isOpen ? "w-8 h-8" : "w-5 h-5",
              })}
            </span>
            <span
              className={clsx(
                "transition-opacity duration-300 whitespace-nowrap",
                isOpen ? "opacity-0 w-0" : "opacity-100 w-auto",
              )}
            >
              {link.name}
            </span>
          </button>
        ))}
      </div>

      {/* exit */}
      <button
        onClick={() => {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          navigate("/sign-in", { replace: true });
        }}
        className={clsx(
          "flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-blue01 hover:bg-white rounded-l-md transition",
        )}
      >
        <IoExitOutline
          className={clsx(
            "transition-all duration-300 rotate-180 flex-shrink-0",
            isOpen ? "w-8 h-8" : "w-5 h-5",
          )}
        />
        <span
          className={clsx(
            "transition-opacity duration-300 text-left min-w-[50px]",
            isOpen && "opacity-0",
          )}
        >
          Выход
        </span>
      </button>
    </section>
  );
};

export default Sidebar;
