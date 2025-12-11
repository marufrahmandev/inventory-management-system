import {
  Bars3Icon,
} from '@heroicons/react/24/outline'    

export default function MobileTopBarWithHamburger({ setMobileSidebarOpen, pageTitle }: { setMobileSidebarOpen: (mobileSidebarOpen: boolean) => void, pageTitle: string }) {
  return (
    <>
     {/* Mobile top bar with hamburger */}
      <header className="flex items-center justify-between bg-white px-4 py-3 shadow-sm md:hidden">
        <div className="flex items-center gap-x-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-600">
            <span className="text-xl font-semibold text-white">~</span>
          </div>
          <span className="text-lg font-semibold text-gray-900">{pageTitle}</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(true)}
          className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <span className="sr-only">Open sidebar</span>
          <Bars3Icon aria-hidden="true" className="size-6" />
        </button>
      </header>
    </>
  )
}