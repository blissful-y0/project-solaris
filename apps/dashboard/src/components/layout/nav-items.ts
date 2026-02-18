import { BookOpen, Home, Radio, Swords, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** 캐릭터 승인 필요 여부 — true이면 미승인 시 잠금 UI 표시 */
  requireApproval?: boolean;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/world", label: "Lore", icon: BookOpen },
  { href: "/operation", label: "Operation", icon: Swords, requireApproval: true },
  { href: "/characters", label: "Registry", icon: Users },
  { href: "/core", label: "Helios Core", icon: Radio },
] as const;
