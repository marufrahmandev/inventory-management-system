import {
  CalendarDaysIcon,
  ChartPieIcon,
  DocumentDuplicateIcon,
  FolderIcon,
  HomeIcon,
  UserGroupIcon,
  Squares2X2Icon,
  ShoppingBagIcon,
  BuildingStorefrontIcon,
  Cog6ToothIcon,
  CreditCardIcon 
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
    name: "Catalog",
    href: "#",
    icon: Squares2X2Icon, 
    children: [
      { name: "Categories", href: "/categories" },
      { name: "Products", href: "/products" },
      { name: "Product Variants", href: "/product-variants" },
      { name: "Brands", href: "/brands" },
      { name: "Units of Measure", href: "/units-of-measure" },
    ],
  },
  {
    name: "Purchase",
    href: "#",
    icon: ShoppingBagIcon,
    children: [
      { name: "Purchase Orders", href: "/purchase-orders" },
      { name: "Stock In", href: "/stock-in" },
    ],
  },
  {
    name: "Sales",
    href: "#",
    icon: CreditCardIcon,
    children: [
      { name: "Sales Orders", href: "/sales-orders" },
      { name: "Invoices", href: "/invoices" },
    ],
  },

  { name: "Suppliers", href: "/suppliers", icon: BuildingStorefrontIcon },
  { name: "Customers", href: "/customers", icon: UserGroupIcon },
  { name: "Reports", href: "/reports", icon: ChartPieIcon },
  {
    name: "Settings",
    href: "#",
    icon: Cog6ToothIcon,
    children: [
      { name: "Profile", href: "/profile" },
      { name: "Logout", href: "/logout" },
    ],
  },
];

export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}
