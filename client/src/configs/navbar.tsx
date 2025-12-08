import {
  CalendarDaysIcon,
  ChartPieIcon,
  DocumentDuplicateIcon,
  FolderIcon,
  HomeIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import type { NavItem } from "../types";

export const user = {
  name: "Tom Cook",
  email: "tom@example.com",
  imageUrl:
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
};

export const navigation: NavItem[] = [
  { name: "Dashboard", href: "#", icon: HomeIcon, current: true },
  {
    name: "Team",
    href: "#",
    icon: UserGroupIcon,
    children: [
      { name: "Overview", href: "#" },
      { name: "Members", href: "#" },
      { name: "Settings", href: "#" },
    ],
  },
  {
    name: "Projects",
    href: "#",
    icon: FolderIcon,
    children: [
      { name: "Active", href: "#" },
      { name: "Archived", href: "#" },
    ],
  },
  { name: "Calendar", href: "#", icon: CalendarDaysIcon },
  { name: "Documents", href: "#", icon: DocumentDuplicateIcon },
  { name: "Reports", href: "#", icon: ChartPieIcon },
];

export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}
