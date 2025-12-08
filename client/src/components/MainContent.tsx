import React from "react";
import { classNames } from "../configs/navbar";
import { Outlet, useOutletContext } from "react-router";
export default function MainContent({ sidebarOpen, children, title }: { sidebarOpen: boolean, children: React.ReactNode, title: string   }) {
  return (
    <div className="flex-1 bg-gray-100">
      <header className="relative hidden bg-white shadow-sm md:block">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {title}
          </h1>
        </div>
      </header>
      <main>
        <div
          className={classNames(
            "mx-auto px-3 py-6 sm:px-4",
            sidebarOpen ? "max-w-7xl lg:px-6" : "max-w-none lg:px-4"
          )}
        >
          <div className="h-[32rem] rounded-2xl border border-gray-200 bg-white p-4">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
