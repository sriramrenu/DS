"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { Role, teams, Score, initialScores } from '@/lib/mock-db';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { MagicCard } from '@/components/ui/magic-card';
import { fetchApi } from '@/lib/api';

export default function AdminScoreCard() {
  const [session, setSession] = useState<{ id: string; role: Role; username: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [scores, setScores] = useState<Score[]>(initialScores);
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
      const mapped: Score[] = data.map((t: any) => ({
        team_id: t.id,
        team_name: t.team_name,
        visualization_score: t.scores?.visualization_score || 0,
        prediction_score: t.scores?.prediction_score || 0,
        feature_score: t.scores?.feature_score || 0,
        code_score: t.scores?.code_score || 0,
        judges_score: t.scores?.judges_score || 0,
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

  const updateScore = (teamId: string, field: keyof Score, value: string) => {
    const num = parseFloat(value) || 0;
    setScores(prev => prev.map(s => {
      if (s.team_id === teamId) {
        const updated = { ...s, [field]: num };
        updated.total_score =
          (updated.visualization_score || 0) +
          (updated.prediction_score || 0) +
          (updated.feature_score || 0) +
          (updated.code_score || 0) +
          (updated.judges_score || 0);
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
        viz: s.visualization_score,
        pred: s.prediction_score,
        feat: s.feature_score,
        code: s.code_score,
        judge: s.judges_score
      }));

      await fetchApi('/admin/scores/bulk', {
        method: 'POST',
        body: JSON.stringify({ updates })
      });

      toast({
        title: "Scores Saved",
        description: "All team rankings have been updated successfully.",
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
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-headline font-bold text-green-500">Evaluation Scoring</h1>
                <p className="text-green-400/60">Manage scores for each evaluation criteria.</p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={saveScores}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>

            <MagicCard className="bg-black/40 backdrop-blur-md rounded-lg shadow-sm border-white/10 overflow-hidden text-white">
              <Table>
                <TableHeader>
                  <TableRow className="bg-green-500/5 hover:bg-transparent border-white/10">
                    <TableHead className="font-bold w-[200px] text-green-400">Team</TableHead>
                    <TableHead className="font-bold text-center text-green-400">Visualization (6)</TableHead>
                    <TableHead className="font-bold text-center text-green-400">Predictions (7)</TableHead>
                    <TableHead className="font-bold text-center text-green-400">Feature Eng (6)</TableHead>
                    <TableHead className="font-bold text-center text-green-400">ML Code (6)</TableHead>
                    <TableHead className="font-bold text-center text-green-400">Judges (25)</TableHead>
                    <TableHead className="font-bold text-right text-green-400">Total (50)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scores.map((score) => (
                    <TableRow key={score.team_id} className="border-white/5">
                      <TableCell className="font-medium text-green-400/90">{score.team_name}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          className="w-16 mx-auto text-center text-green-400 bg-green-500/5 border-green-500/20 focus:border-green-500/50"
                          value={score.visualization_score}
                          onChange={(e) => updateScore(score.team_id, 'visualization_score', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          className="w-16 mx-auto text-center text-green-400 bg-green-500/5 border-green-500/20 focus:border-green-500/50"
                          value={score.prediction_score}
                          onChange={(e) => updateScore(score.team_id, 'prediction_score', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          className="w-16 mx-auto text-center text-green-400 bg-green-500/5 border-green-500/20 focus:border-green-500/50"
                          value={score.feature_score}
                          onChange={(e) => updateScore(score.team_id, 'feature_score', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          className="w-16 mx-auto text-center text-green-400 bg-green-500/5 border-green-500/20 focus:border-green-500/50"
                          value={score.code_score}
                          onChange={(e) => updateScore(score.team_id, 'code_score', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          className="w-16 mx-auto text-center text-green-400 bg-green-500/5 border-green-500/20 focus:border-green-500/50"
                          value={score.judges_score}
                          onChange={(e) => updateScore(score.team_id, 'judges_score', e.target.value)}
                        />
                      </TableCell>
                      <TableCell className="text-right font-bold text-green-500 text-lg pr-8">
                        {score.total_score}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </MagicCard>
          </div>
        </main>
      </div>
    </div>
  );
}
