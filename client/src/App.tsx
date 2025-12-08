import { useState } from 'react'
import type { ComponentType, SVGProps } from 'react'
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  UserGroupIcon,
  FolderIcon,
  CalendarDaysIcon,
  DocumentDuplicateIcon,
  ChartPieIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'

const user = {
  name: 'Tom Cook',
  email: 'tom@example.com',
  imageUrl:
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
}

type NavChild = {
  name: string
  href: string
}

type NavItem = {
  name: string
  href: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  current?: boolean
  children?: NavChild[]
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '#', icon: HomeIcon, current: true },
  {
    name: 'Team',
    href: '#',
    icon: UserGroupIcon,
    children: [
      { name: 'Overview', href: '#' },
      { name: 'Members', href: '#' },
      { name: 'Settings', href: '#' },
    ],
  },
  {
    name: 'Projects',
    href: '#',
    icon: FolderIcon,
    children: [
      { name: 'Active', href: '#' },
      { name: 'Archived', href: '#' },
    ],
  },
  { name: 'Calendar', href: '#', icon: CalendarDaysIcon },
  { name: 'Documents', href: '#', icon: DocumentDuplicateIcon },
  { name: 'Reports', href: '#', icon: ChartPieIcon },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [openParent, setOpenParent] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile top bar with hamburger */}
      <header className="flex items-center justify-between bg-white px-4 py-3 shadow-sm md:hidden">
        <div className="flex items-center gap-x-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-600">
            <span className="text-xl font-semibold text-white">~</span>
          </div>
          <span className="text-lg font-semibold text-gray-900">Dashboard</span>
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

      {/* Mobile sidebar overlay */}
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
                <span className="text-base font-semibold text-gray-900">Menu</span>
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
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Main</p>
              <div className="mt-4 space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon
                  const hasChildren = Array.isArray(item.children) && item.children.length > 0
                  const isOpen = openParent === item.name

                  return (
                    <div key={item.name}>
                      <button
                        type="button"
                        onClick={() => {
                          if (hasChildren) {
                            setOpenParent(isOpen ? null : item.name)
                          }
                        }}
                        className={classNames(
                          item.current
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
                          'flex w-full items-center gap-x-3 rounded-md px-3 py-2 text-left text-sm font-medium',
                        )}
                      >
                        <Icon
                          aria-hidden="true"
                          className={classNames(
                            item.current ? 'text-indigo-600' : 'text-gray-400',
                            'size-5',
                          )}
                        />
                        <span className="flex-1">{item.name}</span>
                        {hasChildren && (
                          <ChevronRightIcon
                            aria-hidden="true"
                            className={classNames(
                              isOpen ? 'rotate-90 text-indigo-600' : 'text-gray-400',
                              'size-4 transition-transform',
                            )}
                          />
                        )}
                      </button>

                      {hasChildren && (
                        <div
                          className={classNames(
                            'mt-1 space-y-1 pl-10',
                            isOpen ? 'block' : 'hidden',
                          )}
                        >
                          {item.children!.map((child) => (
                            <a
                              key={child.name}
                              href={child.href}
                              className="block rounded-md px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                            >
                              {child.name}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </nav>

            {/* Sidebar user section */}
            <div className="mt-8 border-t border-gray-200 pt-6">
              <button
                type="button"
                className="flex w-full items-center gap-x-3 rounded-md px-3 py-2 text-left text-sm hover:bg-gray-50"
              >
                <img
                  alt={user.name}
                  src={user.imageUrl}
                  className="size-9 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">View profile</p>
                </div>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop layout: sidebar + main content */}
      <div className="flex min-h-[calc(100vh-3.5rem)] flex-col md:min-h-screen md:flex-row bg-gray-100 text-gray-700">
        {/* Left sidebar (expanded or collapsed) on desktop only */}
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
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Main</p>
              <div className="mt-4 space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon
                  const hasChildren = Array.isArray(item.children) && item.children.length > 0
                  const isOpen = openParent === item.name

                  return (
                    <div key={item.name}>
                      <button
                        type="button"
                        onClick={() => {
                          if (hasChildren) {
                            setOpenParent(isOpen ? null : item.name)
                          }
                        }}
                        className={classNames(
                          item.current
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
                          'flex w-full items-center gap-x-3 rounded-md px-3 py-2 text-left text-sm font-medium',
                        )}
                      >
                        <Icon
                          aria-hidden="true"
                          className={classNames(
                            item.current ? 'text-indigo-600' : 'text-gray-400',
                            'size-5',
                          )}
                        />
                        <span className="flex-1">{item.name}</span>
                        {hasChildren && (
                          <ChevronRightIcon
                            aria-hidden="true"
                            className={classNames(
                              isOpen ? 'rotate-90 text-indigo-600' : 'text-gray-400',
                              'size-4 transition-transform',
                            )}
                          />
                        )}
                      </button>

                      {hasChildren && (
                        <div
                          className={classNames(
                            'mt-1 space-y-1 pl-10',
                            isOpen ? 'block' : 'hidden',
                          )}
                        >
                          {item.children!.map((child) => (
                            <a
                              key={child.name}
                              href={child.href}
                              className="block rounded-md px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                            >
                              {child.name}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </nav>

            {/* Sidebar user section at the bottom */}
            <div className="mt-8 border-t border-gray-200 pt-6">
              <button
                type="button"
                className="flex w-full items-center gap-x-3 rounded-md px-3 py-2 text-left text-sm hover:bg-gray-50"
              >
                <img
                  alt={user.name}
                  src={user.imageUrl}
                  className="size-9 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">View profile</p>
                </div>
              </button>
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
              {navigation.map((item) => {
                const Icon = item.icon
                const hasChildren = Array.isArray(item.children) && item.children.length > 0
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
                )
              })}
            </div>
          </aside>
        )}

        {/* Right content area */}
        <div className="flex-1 bg-gray-100">
          <header className="relative hidden bg-white shadow-sm md:block">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
            </div>
          </header>
          <main>
            <div
              className={classNames(
                'mx-auto px-4 py-6 sm:px-6',
                sidebarOpen ? 'max-w-7xl lg:px-8' : 'max-w-none lg:px-6',
              )}
            >
              <div className="h-[32rem] rounded-2xl border border-gray-200 bg-white">
                {/* Your dashboard content goes here */}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

