
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { MagicCard } from '@/components/ui/magic-card';
import { LogOut, Database, User } from 'lucide-react';
import Link from 'next/link';

export function Navbar({ role, username }: { role: string; username: string }) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('tt_session');
    router.push('/login');
  };

  const homeLink = role === 'Admin' ? '/admin/dashboard' : '/participant/dashboard';

  return (
    <MagicCard className="rounded-none border-b border-white/10 bg-[var(--bg-glass)] backdrop-blur-md shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      <Link href={homeLink} className="flex items-center gap-3 group">
        <img
          src="/assets/logo.png"
          alt="DataSprint 3.0"
          className="h-10 w-auto object-contain group-hover:scale-105 transition-transform"
        />
        <span className="font-headline font-bold text-xl text-[var(--p-400)] tracking-tight">DATASPRINT 3.0</span>
      </Link>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full backdrop-blur-sm">
          <User className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-200">{username}</span>
          <span className="text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-green-600/80 text-white ml-1 shadow-[0_0_10px_rgba(34,197,94,0.5)]">
            {role}
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-400 hover:text-green-400 hover:bg-green-500/10 transition-colors">
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </MagicCard>
  );
}
