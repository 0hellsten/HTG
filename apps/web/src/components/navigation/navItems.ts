import { LucideIcon, Calendar, Search, Award, Star, Menu, Calculator } from 'lucide-react';
import { JanneBoyIcon } from '../janne-boy/JanneBoyIcon';

export type Tab = 'idag' | 'janneboy' | 'bong' | 'hastar' | 'tips' | 'stall' | 'mer';

export interface NavItemConfig {
  id: Tab;
  label: string;
  mobileLabel: string;
  icon: LucideIcon | React.FC<{ className?: string }>;
}

export const NAV_ITEMS: NavItemConfig[] = [
  { id: 'idag', label: 'Idag', mobileLabel: 'Idag', icon: Calendar },
  { id: 'bong', label: 'Bong-maskinen', mobileLabel: 'Bongen', icon: Calculator },
  { id: 'janneboy', label: 'Janne Boy', mobileLabel: 'Janne', icon: JanneBoyIcon },
  { id: 'hastar', label: 'Hästar', mobileLabel: 'Hästar', icon: Search },
  { id: 'tips', label: 'Tips', mobileLabel: 'Tips', icon: Award },
  { id: 'stall', label: 'Mitt stall', mobileLabel: 'Mitt stall', icon: Star },
  { id: 'mer', label: 'Mer', mobileLabel: 'Mer', icon: Menu },
];

export const MOBILE_NAV_ITEMS: NavItemConfig[] = [
  { id: 'idag', label: 'Idag', mobileLabel: 'Idag', icon: Calendar },
  { id: 'bong', label: 'Bong-maskinen', mobileLabel: 'Bongen', icon: Calculator },
  { id: 'janneboy', label: 'Janne Boy', mobileLabel: 'Janne', icon: JanneBoyIcon },
  { id: 'hastar', label: 'Hästar', mobileLabel: 'Hästar', icon: Search },
  { id: 'tips', label: 'Tips', mobileLabel: 'Tips', icon: Award },
  { id: 'mer', label: 'Mer', mobileLabel: 'Mer', icon: Menu },
];
