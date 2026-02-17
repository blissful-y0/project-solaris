import { BookOpen, Home, Radio, Swords, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

/** 하단 탭바 / 사이드바 공용 네비게이션 항목 (SERVICE-SPEC v2 IA) */
export const NAV_ITEMS: readonly NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/world", label: "Lore", icon: BookOpen },
  { href: "/session", label: "Session", icon: Swords },
  { href: "/characters", label: "REGISTRY", icon: Users },
  { href: "/core", label: "Helios Core", icon: Radio },
] as const;
