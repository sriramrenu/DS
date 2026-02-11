
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { Role, Score, initialScores } from '@/lib/mock-db';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Trophy, Medal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MagicCard } from '@/components/ui/magic-card';
import { fetchApi } from '@/lib/api';
import { Loader2 } from 'lucide-react';

export default function AdminLeaderboard() {
  const [session, setSession] = useState<{ id: string; role: Role; username: string } | null>(null);
  const [scores, setScores] = useState<Score[]>(initialScores);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const raw = localStorage.getItem('tt_session');
    if (!raw) {
      router.push('/login');
      return;
    }
    const parsed = JSON.parse(raw);
    if (parsed.role !== 'Admin') {
      router.push('/login');
      return;
    }
    setSession(parsed);
  }, [router]);

  useEffect(() => {
    if (session) {
      setLoading(true);
      fetchApi('/admin/scores')
        .then(data => {
          const mapped: Score[] = data.map((t: any) => ({
            team_id: t.id,
            team_name: t.team_name,
            group: t.group,
            phase1_score: t.scores?.phase1_score || 0, // Keeping old props if Score type wasn't updated? NO, I updated Score type.
            // I must use new props.
            visualization_score: t.scores?.visualization_score || 0,
            prediction_score: t.scores?.prediction_score || 0,
            feature_score: t.scores?.feature_score || 0,
            code_score: t.scores?.code_score || 0,
            judges_score: t.scores?.judges_score || 0,
            total_score: t.scores?.total_score || 0
          }));
          setScores(mapped);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to load scores:', err);
          setLoading(false);
        });
    }
  }, [session]);

  if (!session) return null;

  // Sort by total score descending
  const sortedScores = [...scores].sort((a, b) => b.total_score - a.total_score);

  return (
    <div className="min-h-screen flex flex-col text-foreground">
      <Navbar role={session.role} username={session.username} />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-green-500/10 text-green-400 border border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                <Trophy className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-headline font-bold text-green-500">Leaderboard</h1>
                <p className="text-green-400/60 font-medium">Global rankings based on cumulative phase scores across all tracks.</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {sortedScores.slice(0, 3).map((score, i) => {
                const colors = [
                  'border-green-400/50 bg-green-900/20 shadow-[0_0_30px_-10px_rgba(34,197,94,0.5)]',
                  'border-green-600/30 bg-green-900/10',
                  'border-green-800/20 bg-green-900/5'
                ];
                const medalColors = [
                  'text-green-400',
                  'text-green-500',
                  'text-green-600'
                ];
                return (
                  <div key={score.team_id} className={cn("p-6 rounded-2xl border-2 flex flex-col items-center gap-3 text-center transition-all hover:scale-105", colors[i])}>
                    <Medal className={cn("w-12 h-12", medalColors[i])} />
                    <div>
                      <p className="text-xs uppercase font-black tracking-widest text-green-400/40">Rank {i + 1}</p>
                      <p className="font-bold text-lg leading-tight text-green-100">{score.team_name}</p>
                    </div>
                    <p className="text-2xl font-black text-green-400">{score.total_score}</p>
                  </div>
                );
              })}
            </div>

            <MagicCard className="bg-black/40 backdrop-blur-md rounded-2xl shadow-xl border-white/10 overflow-hidden text-white">
              <Table>
                <TableHeader>
                  <TableRow className="bg-green-500 hover:bg-green-500 border-none">
                    <TableHead className="font-bold pl-8 text-white uppercase tracking-wider text-xs">Rank</TableHead>
                    <TableHead className="font-bold text-white uppercase tracking-wider text-xs">Team Name</TableHead>
                    <TableHead className="font-bold text-white uppercase tracking-wider text-xs">Troops</TableHead>
                    <TableHead className="font-bold text-right pr-8 text-white uppercase tracking-wider text-xs">Total Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedScores.map((score, index) => {
                    const medalColors = [
                      'text-green-400',
                      'text-green-500',
                      'text-green-600'
                    ];
                    return (
                      <TableRow key={score.team_id} className={cn(index < 3 ? "bg-green-500/10 border-green-500/20" : "border-white/5", "hover:bg-green-500/5 transition-colors")}>
                        <TableCell className="font-medium pl-8 text-green-400/60">{index + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-green-400">{score.team_name}</span>
                            {index < 3 && <Medal className={`w-4 h-4 ${medalColors[index]}`} />}
                          </div>
                        </TableCell>
                        <TableCell className="text-green-400/80 font-medium">
                          <span className="px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-[10px] font-bold uppercase tracking-wider">
                            {score.group || 'GEN'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-bold text-lg pr-8 text-green-500">
                          {score.total_score}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </MagicCard>
          </div>
        </main>
      </div>
    </div>
  );
}
