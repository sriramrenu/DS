"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { Role } from '@/lib/mock-db';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { MagicCard } from '@/components/ui/magic-card';
import { fetchApi } from '@/lib/api';

interface RoundScore {
  team_id: string;
  team_name: string;
  round1_score: number;
  round2_score: number;
  round3_score: number;
  round4_score: number;
  total_score: number;
}

export default function AdminScoreCard() {
  const [session, setSession] = useState<{ id: string; role: Role; username: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [scores, setScores] = useState<RoundScore[]>([]);
  const [saving, setSaving] = useState(false);
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
    setLoading(false);
  }, [router]);

  const fetchScoreboard = async () => {
    try {
      const data = await fetchApi('/admin/scores');
      // Transform data: Backend returns Teams with scores
      const mapped: RoundScore[] = data.map((t: any) => ({
        team_id: t.id,
        team_name: t.team_name,
        round1_score: t.scores?.round1_score || 0,
        round2_score: t.scores?.round2_score || 0,
        round3_score: t.scores?.round3_score || 0,
        round4_score: t.scores?.round4_score || 0,
        total_score: t.scores?.total_score || 0
      }));
      setScores(mapped);
    } catch (err) {
      console.error('Failed to fetch scores:', err);
    }
  };

  useEffect(() => {
    if (session) {
      const init = async () => {
        setIsDataLoading(true);
        await fetchScoreboard();
        setIsDataLoading(false);
      };
      init();
    }
  }, [session]);

  const updateScore = (teamId: string, field: keyof RoundScore, value: string) => {
    const num = parseFloat(value) || 0;
    setScores(prev => prev.map(s => {
      if (s.team_id === teamId) {
        const updated = { ...s, [field]: num };
        // Recalculate total
        updated.total_score =
          (updated.round1_score || 0) +
          (updated.round2_score || 0) +
          (updated.round3_score || 0) +
          (updated.round4_score || 0);
        return updated;
      }
      return s;
    }));
  };

  const saveScores = async () => {
    setSaving(true);
    try {
      const updates = scores.map(s => ({
        teamId: s.team_id,
        round1: s.round1_score,
        round2: s.round2_score,
        round3: s.round3_score,
        round4: s.round4_score
      }));

      await fetchApi('/admin/scores/bulk', {
        method: 'POST',
        body: JSON.stringify({ updates })
      });

      toast({
        title: "Scores Saved",
        description: "All team scores have been updated successfully.",
      });
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: err.message || "Failed to save scores",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !session) return null;

  if (isDataLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-black">
        <Navbar role={session.role} username={session.username} />
        <div className="flex flex-1">
          <AdminSidebar />
          <main className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 text-[var(--p-500)] animate-spin" />
              <p className="text-[var(--p-400)] font-medium animate-pulse">Synchronizing scores...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar role={session.role} username={session.username} />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-headline font-bold text-green-500">Round-Based Scoring</h1>
                <p className="text-green-400/60">Manage scores for Round 1, Round 2, Round 3, and Round 4.</p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={saveScores}
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>

            <MagicCard className="bg-black/40 backdrop-blur-md rounded-lg shadow-sm border-white/10 overflow-hidden text-white">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-green-500/5 hover:bg-transparent border-white/10">
                      <TableHead className="font-bold w-[220px] text-green-400 sticky left-0 bg-black/40 backdrop-blur-md z-10">Team</TableHead>
                      <TableHead className="font-bold text-center text-green-400 min-w-[120px]">Round 1</TableHead>
                      <TableHead className="font-bold text-center text-green-400 min-w-[120px]">Round 2</TableHead>
                      <TableHead className="font-bold text-center text-green-400 min-w-[120px]">Round 3</TableHead>
                      <TableHead className="font-bold text-center text-green-400 min-w-[120px]">Round 4</TableHead>
                      <TableHead className="font-bold text-right text-green-400 min-w-[100px]">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scores.map((score) => (
                      <TableRow key={score.team_id} className="border-white/5">
                        <TableCell className="font-medium text-green-400/90 sticky left-0 bg-black/40 backdrop-blur-md z-10">{score.team_name}</TableCell>
                        <TableCell className="text-center">
                          <Input
                            type="number"
                            className="w-20 mx-auto text-center text-green-400 bg-green-500/5 border-green-500/20 focus:border-green-500/50"
                            value={score.round1_score}
                            onChange={(e) => updateScore(score.team_id, 'round1_score', e.target.value)}
                            min="0"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Input
                            type="number"
                            className="w-20 mx-auto text-center text-green-400 bg-green-500/5 border-green-500/20 focus:border-green-500/50"
                            value={score.round2_score}
                            onChange={(e) => updateScore(score.team_id, 'round2_score', e.target.value)}
                            min="0"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Input
                            type="number"
                            className="w-20 mx-auto text-center text-green-400 bg-green-500/5 border-green-500/20 focus:border-green-500/50"
                            value={score.round3_score}
                            onChange={(e) => updateScore(score.team_id, 'round3_score', e.target.value)}
                            min="0"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Input
                            type="number"
                            className="w-20 mx-auto text-center text-green-400 bg-green-500/5 border-green-500/20 focus:border-green-500/50"
                            value={score.round4_score}
                            onChange={(e) => updateScore(score.team_id, 'round4_score', e.target.value)}
                            min="0"
                          />
                        </TableCell>
                        <TableCell className="text-right font-bold text-green-500 text-lg pr-8">
                          {score.total_score}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </MagicCard>

            <div className="text-center text-green-400/60 text-sm">
              Total Teams: {scores.length}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
