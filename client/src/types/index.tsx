import type { SVGProps } from "react"
import type { ComponentType } from "react"
export type NavChild = {
  name: string
  href: string,
  children: NavChild[]
}

export type NavItem = {
  name: string
  href: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  current?: boolean
  children?: NavChild[]
}

export type Category = {
  id: string
  name: string,
  description: string,
  parent_category: string | null,
  category_image: string | null,
}

export type Product = {
  id: string
  name: string
  categoryId: string
  price: number
  quantity: number
  description: string
};