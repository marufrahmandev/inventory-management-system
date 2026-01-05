import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowRightOnRectangleIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import { navigation } from "../configs/navbar";
import type { NavItem, NavChild } from "../types";
import { classNames } from "../configs/navbar";
import { useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { findParentPath } from "../configs/navbar";
export default function SideBar({
  sidebarOpen,
  setSidebarOpen,
  openParent,
  setOpenParent,
}: {
  sidebarOpen: boolean;
  setSidebarOpen: (sidebarOpen: boolean) => void;
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
    navigate("/login");
  };
  useEffect(() => {
    const parentPath = findParentPath(navigation, location.pathname);
    if (parentPath && parentPath[0]) {
      setOpenParent(parentPath[0]);
    }
  }, [location.pathname]);

  return (
    <>
      {sidebarOpen ? (
        <aside className="hidden w-72 flex-shrink-0 flex-col border-r border-gray-200 bg-white px-4 py-6 md:flex">
          {/* Sidebar header with logo and collapse toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-x-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-600">
                <span className="text-xl font-semibold text-white">~</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white p-1 text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <ChevronLeftIcon aria-hidden="true" className="size-4" />
              <span className="sr-only">Collapse sidebar</span>
            </button>
          </div>

          <nav className="mt-8 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Main
            </p>
            <div className="mt-4 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const hasChildren =
                  Array.isArray(item.children) && item.children.length > 0;
                const isOpen = openParent === item.name;

                return (
                  <div key={item.name} className="group">
                    <button
                      type="button"
                      onClick={() => {
                        if (hasChildren) {
                          setOpenParent(isOpen ? null : item.name);
                        } else {
                          navigate(item.href);
                        }
                      }}
                      className={classNames(
                        item.href === location.pathname ||
                          item.children?.some((child: NavChild) =>
                            location.pathname.includes(
                              child.href?.toString() || ""
                            )
                          ) ||
                          item.children?.some((child: NavChild) =>
                            child.children?.some((child: NavChild) =>
                              location.pathname.includes(
                                child.href?.toString() || ""
                              )
                            )
                          )
                          ? activeClass
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                        "flex w-full items-center gap-x-3 rounded-md px-3 py-2 text-left text-sm font-medium cursor-pointer group-has-[a]:cursor-pointer"
                      )}
                    >
                      <Icon
                        aria-hidden="true"
                        className={classNames(
                          item.children?.some((child: NavChild) =>
                            location.pathname.includes(
                              child.href?.toString() || ""
                            )
                          )
                            ? "text-indigo-600"
                            : "text-gray-400",
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
                              navigate(child.href);
                            }}
                            className={`${
                              location.pathname.includes(
                                child.href?.toString() || ""
                              ) ||
                              child.children?.some((child: NavChild) =>
                                location.pathname.includes(
                                  child.href?.toString() || ""
                                )
                              ) ||
                              child.children?.some((child: NavChild) =>
                                child.children?.some((child: NavChild) =>
                                  location.pathname.includes(
                                    child.href?.toString() || ""
                                  )
                                )
                              )
                                ? activeClass
                                : ""
                            } block rounded-md px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900`}
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

          {/* Sidebar user section at the bottom */}
          <div className="mt-8 border-t border-gray-200 pt-6">
            <div className="flex items-center gap-x-3 rounded-xl bg-gray-50 px-3 py-2 text-sm">
              <div className="size-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{user?.name || "User"}</p>
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
      ) : (
        // Collapsed sidebar: icon-only vertical rail (desktop only)
        <aside className="hidden w-16 flex-shrink-0 flex-col items-center border-r border-gray-200 bg-white py-4 md:flex">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white p-1 text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <ChevronRightIcon aria-hidden="true" className="size-4" />
            <span className="sr-only">Expand sidebar</span>
          </button>

          <div className="mt-4 flex flex-1 flex-col items-start gap-y-2 md:mt-6 md:items-center md:gap-y-4">
            {navigation.map((item: NavItem) => {
              const Icon = item.icon;
              const hasChildren =
                Array.isArray(item.children) && item.children.length > 0;
              return (
                <button
                  key={item.name}
                  type="button"
                  className="flex size-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-900 md:size-10"
                >
                  <Icon aria-hidden="true" className="size-5" />
                  {hasChildren && (
                    <span className="sr-only">{item.name} (has sub menu)</span>
                  )}
                </button>
              );
            })}
          </div>
        </aside>
      )}
    </>
  );
}
