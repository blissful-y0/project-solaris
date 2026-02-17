import { BookOpen, Home, Radio, Swords, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/world", label: "Lore", icon: BookOpen },
  { href: "/operation", label: "Operation", icon: Swords },
  { href: "/characters", label: "REGISTRY", icon: Users },
  { href: "/core", label: "Helios Core", icon: Radio },
] as const;
