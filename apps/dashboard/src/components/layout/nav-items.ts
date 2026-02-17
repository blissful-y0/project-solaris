import { BookOpen, Home, MessageCircle, Swords, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { href: "/", label: "홈", icon: Home },
  { href: "/battle", label: "전투", icon: Swords },
  { href: "/room", label: "RP", icon: MessageCircle },
  { href: "/characters", label: "도감", icon: BookOpen },
  { href: "/my", label: "MY", icon: User },
] as const;
