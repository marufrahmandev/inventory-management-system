import {
  XMarkIcon,
  ChevronRightIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { navigation } from "../configs/navbar";
import type { NavItem, NavChild } from "../types";
import { classNames } from "../configs/navbar";
import { useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
export default function MobileSideBarOverlay({
  mobileSidebarOpen,
  setMobileSidebarOpen,
  openParent,
  setOpenParent,
}: {
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (mobileSidebarOpen: boolean) => void;
  openParent: string | null;
  setOpenParent: (openParent: string | null) => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const activeClass = "bg-indigo-50 text-indigo-700";
  
  // Get logged-in user from localStorage
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setMobileSidebarOpen(false);
    navigate("/login");
  };
  return (
    <>
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className="absolute inset-0 bg-gray-900/40"
            onClick={() => setMobileSidebarOpen(false)}
          />

          <aside className="relative z-50 flex h-full w-72 flex-col border-r border-gray-200 bg-white px-4 py-4 shadow-xl">
            {/* Sidebar header with logo and close */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-x-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-600">
                  <span className="text-xl font-semibold text-white">~</span>
                </div>
                <span className="text-base font-semibold text-gray-900">
                  Menu
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                className="inline-flex items-center justify-center rounded-md p-1 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <span className="sr-only">Close sidebar</span>
                <XMarkIcon aria-hidden="true" className="size-5" />
              </button>
            </div>

            <nav className="mt-8 flex-1 overflow-y-auto">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Main
              </p>
              <div className="mt-4 space-y-1">
                {navigation.map((item: NavItem) => {
                  const Icon = item.icon;
                  const hasChildren =
                    Array.isArray(item.children) && item.children.length > 0;
                  const isOpen = openParent === item.name;

                  return (
                    <div key={item.name}>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileSidebarOpen(false);
                          if (hasChildren) {
                            setOpenParent(isOpen ? null : item.name);
                          } 
                          else{
                            navigate(item.href);
                          }
                        }}
                        className={classNames(
                          item.href === location.pathname || item.children?.some((child: NavChild) => child.href === location.pathname)
                            ? "bg-indigo-50 text-indigo-700"
                            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                          "flex w-full items-center gap-x-3 rounded-md px-3 py-2 text-left text-sm font-medium"
                        )}
                      >
                        <Icon
                          aria-hidden="true"
                          className={classNames(
                            item.href === location.pathname || item.children?.some((child: NavChild) => child.href === location.pathname) ? "text-indigo-600" : "text-gray-400",
                            "size-5"
                          )}
                        />
                        <span className="flex-1">{item.name}</span>
                        {hasChildren && (
                          <ChevronRightIcon
                            aria-hidden="true"
                            className={classNames(
                              isOpen
                                ? "rotate-90 text-indigo-600"
                                : "text-gray-400",
                              "size-4 transition-transform"
                            )}
                          />
                        )}
                      </button>

                      {hasChildren && (
                        <div
                          className={classNames(
                            "mt-1 space-y-1 pl-10",
                            isOpen ? "block" : "hidden"
                          )}
                        >
                          {item.children!.map((child: NavChild) => (
                            <a
                              key={child.name}
                              href="javascript:void(0)"
                              onClick={() => {
                                setMobileSidebarOpen(false);
                                navigate(child.href);
                              }}
                              className={classNames(
                                `${child.href === location.pathname ? activeClass  : ""} text-gray-500 hover:bg-gray-50 hover:text-gray-900,
                                block rounded-md px-3 py-1.5 text-sm`
                              )}
                            >
                              {child.name}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </nav>

            {/* Sidebar user section */}
            <div className="mt-8 border-t border-gray-200 pt-6">
              <div className="flex items-center gap-x-3 rounded-xl bg-gray-50 px-3 py-2 text-sm">
                <div className="size-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email || ""}</p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center rounded-full bg-red-50 p-1.5 text-red-600 shadow-sm ring-1 ring-red-200 hover:bg-red-100"
                >
                  <span className="sr-only">Sign out</span>
                  <ArrowRightOnRectangleIcon
                    aria-hidden="true"
                    className="size-4"
                  />
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
