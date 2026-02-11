
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { MagicCard } from '@/components/ui/magic-card';
import { LayoutDashboard, Users, FileText, Trophy, ClipboardCheck } from 'lucide-react';

const links = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/members', label: 'Members', icon: Users },
  { href: '/admin/submissions', label: 'Submissions', icon: FileText },
  { href: '/admin/scorecard', label: 'Score Card', icon: ClipboardCheck },
  { href: '/admin/leaderboard', label: 'Leaderboard', icon: Trophy },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <MagicCard className="w-64 border-r border-white/10 bg-black/50 backdrop-blur-md min-h-[calc(100vh-65px)] p-4 flex flex-col gap-2 rounded-none">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
              isActive
                ? "bg-[var(--p-600)]/20 text-[var(--p-400)] border border-[var(--p-500)]/30 shadow-[0_0_15px_rgba(34,197,94,0.3)] font-semibold"
                : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
            )}
          >
            <Icon className="w-5 h-5" />
            {link.label}
          </Link>
        );
      })}
    </MagicCard>
  );
}
