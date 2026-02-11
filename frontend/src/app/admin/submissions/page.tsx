
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { Role, teams, tracks } from '@/lib/mock-db';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MagicCard } from '@/components/ui/magic-card';
import Image from 'next/image';
import { fetchApi } from '@/lib/api';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

export default function AdminSubmissions() {
  const [session, setSession] = useState<{ id: string; role: Role; username: string } | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
      fetchApi('/admin/submissions')
        .then(data => {
          setSubmissions(data);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [session]);

  const rounds = [1, 2, 3, 4];

  if (!session) return null;

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Navbar role={session.role} username={session.username} />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-headline font-bold text-green-500">Participant Submissions</h1>
              <p className="text-gray-400">Review and verify works submitted by teams across all rounds.</p>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
                <p className="text-gray-500 animate-pulse font-medium">Fetching submissions...</p>
              </div>
            ) : error ? (
              <div className="p-4 border border-rose-500/20 bg-rose-500/5 rounded-lg text-rose-400">
                Failed to load: {error}
              </div>
            ) : (
              <Tabs defaultValue="1" className="space-y-6">
                <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl w-fit">
                  {rounds.map(r => (
                    <TabsTrigger
                      key={r}
                      value={r.toString()}
                      className="px-6 py-2 rounded-lg data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=active]:shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all"
                    >
                      Round {r}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {rounds.map(r => {
                  const filtered = submissions.filter(s => s.round === r);

                  return (
                    <TabsContent key={r} value={r.toString()} className="mt-0">
                      {filtered.length === 0 ? (
                        <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-2xl">
                          <p className="text-gray-500 font-medium">No submissions found for Round {r}</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {filtered.map((sub) => {
                            const teamName = sub.team?.team_name || 'Unknown Team';
                            const trackName = sub.team?.group || 'General';
                            const time = new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

                            return (
                              <MagicCard key={sub.id} className="overflow-hidden group border-white/10 bg-black/40 backdrop-blur-md text-white transition-all hover:border-green-500/30">
                                <div className="relative h-48 w-full bg-white/5 overflow-hidden">
                                  {sub.imageUrl ? (
                                    <Image
                                      src={sub.imageUrl}
                                      alt="Submission"
                                      fill
                                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                                      unoptimized
                                    />
                                  ) : (
                                    <div className="flex items-center justify-center h-full text-green-400/20">No Visualization</div>
                                  )}
                                  <div className="absolute top-3 right-3">
                                    <Badge className="bg-black/60 backdrop-blur-md text-green-400 border-green-500/30 font-bold uppercase tracking-tight text-[10px]">{trackName}</Badge>
                                  </div>
                                </div>
                                <CardContent className="p-5 space-y-4">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="font-bold text-lg text-white group-hover:text-green-400 transition-colors">{teamName}</p>
                                      <p className="text-xs text-gray-500 font-medium">Submitted at {time}</p>
                                    </div>
                                  </div>
                                  {/* Multi-part Answers */}
                                  {sub.answers && Object.keys(sub.answers).length > 0 && (
                                    <div className="mt-4 space-y-2 border-t border-white/5 pt-4">
                                      <p className="text-[10px] uppercase text-gray-500 font-bold tracking-widest">Submission Details</p>
                                      <div className="space-y-3 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                        {Object.entries(sub.answers).map(([key, value]: [string, any]) => (
                                          <div key={key} className="space-y-1">
                                            <p className="text-[10px] text-green-500/70 font-semibold uppercase">{key.replace(/_/g, ' ')}</p>
                                            <p className="text-xs text-gray-300 leading-relaxed font-medium bg-white/5 p-2 rounded border border-white/5">{value}</p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </CardContent>
                              </MagicCard>
                            );
                          })}
                        </div>
                      )}
                    </TabsContent>
                  );
                })}
              </Tabs>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
