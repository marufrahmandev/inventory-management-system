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
  CreditCardIcon,
} from "@heroicons/react/24/outline";
import type { NavItem } from "../types";

export const user = {
  name: "Tom Cook",
  email: "tom@example.com",
  imageUrl:
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
};

export const navigation: NavItem[] = [
  { name: "Dashboard", href: "/", icon: HomeIcon, current: true },
  {
    name: "Catalog",
    href: "#",
    icon: Squares2X2Icon,
    children: [
      {
        name: "Categories",
        href: "/categories",
        children: [
          { name: "Add Category", href: "/categories/add", children: [] },
          { name: "Edit Category", href: "/categories/edit/:id", children: [] },
        ],
      },

      { name: "Products", href: "/products", children: [] },
      { name: "Product Variants", href: "/product-variants", children: [] },
      { name: "Brands", href: "/brands", children: [] },
      { name: "Units of Measure", href: "/units-of-measure", children: [] },
    ],
  },
  {
    name: "Purchase",
    href: "#",
    icon: ShoppingBagIcon,
    children: [
      { name: "Purchase Orders", href: "/purchase-orders", children: [] },
      { name: "Stock In", href: "/stock-in", children: [] },
    ],
  },
  {
    name: "Sales",
    href: "#",
    icon: CreditCardIcon,
    children: [
      { name: "Sales Orders", href: "/sales-orders", children: [] },
      { name: "Invoices", href: "/invoices", children: [] },
    ],
  },

  { name: "Suppliers", href: "/suppliers", icon: BuildingStorefrontIcon, children: [] },
  { name: "Customers", href: "/customers", icon: UserGroupIcon, children: [] },
  { name: "Reports", href: "/reports", icon: ChartPieIcon, children: [] },
  {
    name: "Settings",
    href: "#",
    icon: Cog6ToothIcon,
    children: [
      { name: "Profile", href: "/profile", children: [] },
      { name: "Logout", href: "/logout", children: [] },
    ],
  },
];

export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}


export function matchHref(storedHref: string, targetHref: string): boolean {
  // Convert "/categories/edit/:id" → "^/categories/edit/[^/]+$"
  const regex = new RegExp("^" + storedHref.replace(/:\w+/g, "[^/]+") + "$");
  return regex.test(targetHref);
}

export function findParentPath(
  items: NavItem[],
  targetHref: string,
  path: string[] = []
): string[] | null {
  for (const item of items) {
    const newPath = [...path, item.name];

    // Match static OR dynamic route
    if (item.href === targetHref || matchHref(item.href, targetHref)) {
      return newPath;
    }

    if (item.children && item.children.length > 0) {
      const childResult = findParentPath(item.children as any, targetHref, newPath);
      if (childResult) return childResult;
    }
  }

  return null;
}