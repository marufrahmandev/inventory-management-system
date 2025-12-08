import type { ComponentType, SVGProps } from 'react'

export type NavChild = {
  name: string
  href: string
}

export type NavItem = {
  name: string
  href: string
  icon: ComponentType<SVGProps<SVGSVGElement>>  
  current?: boolean
  children?: NavChild[]
}