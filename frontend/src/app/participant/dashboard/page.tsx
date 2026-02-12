"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { MagicCard } from '@/components/ui/magic-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, Upload, CheckCircle2, AlertCircle, FileImage, Loader2, Lock } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function ParticipantDashboard() {
  const [session, setSession] = useState<{ id: string; role: string; team_id: string; username: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [numericAnswer, setNumericAnswer] = useState('');
  const [mainDatasets, setMainDatasets] = useState<string[]>([]);
  const [finalDatasets, setFinalDatasets] = useState<string[]>([]);
  const [taskDesc, setTaskDesc] = useState('Loading task...');
  const [roundTitle, setRoundTitle] = useState('');
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [endTime, setEndTime] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null); // seconds

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const raw = localStorage.getItem('tt_session');
    const token = localStorage.getItem('token');

    if (!raw || !token) {
      router.push('/login');
      return;
    }
    const parsed = JSON.parse(raw);
    if (parsed.role !== 'Participant') {
      router.push('/login');
      return;
    }
    setSession(parsed);
    setLoading(false);

    // Fetch Dashboard Data
    const init = async () => {
      setIsDataLoading(true);
      try {
        const data = await fetchApi('/dashboard');

        // Handle new array-based datasets
        if (data.mainDatasets && Array.isArray(data.mainDatasets)) {
          setMainDatasets(data.mainDatasets);
        } else if (data.datasetUrl) {
          // Fallback for legacy single URL
          setMainDatasets([data.datasetUrl]);
        }

        if (data.finalDatasets && Array.isArray(data.finalDatasets)) {
          setFinalDatasets(data.finalDatasets);
        } else if (data.finalDatasetUrl) {
          // Fallback for legacy single URL
          setFinalDatasets([data.finalDatasetUrl]);
        }

        setRoundTitle(data.title || `Round ${data.round}`);
        setTaskDesc(data.description || 'Download your dataset below.');
        setQuestions(data.questions || []);
        setEndTime(data.endTime);

        // Initialize answers
        if (data.questions) {
          const initialAnswers: Record<string, string> = {};
          data.questions.forEach((q: any) => initialAnswers[q.id] = '');
          setAnswers(initialAnswers);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsDataLoading(false);
      }
    };
    init();
  }, [router]);

  useEffect(() => {
    if (!endTime) return;

    const calculateTime = () => {
      const remaining = Math.max(0, Math.floor((new Date(endTime).getTime() - Date.now()) / 1000));
      setTimeRemaining(remaining);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isSubmissionEnabled = timeRemaining !== null && timeRemaining <= 1800; // 30 mins

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Send all answers as a JSON string
      formData.append('answers', JSON.stringify(answers));

      await fetchApi('/submit', {
        method: 'POST',
        body: formData
      });

      setSubmitted(true);
      setSelectedFile(null);
      // Don't reset answers immediately so user can see what they submitted or "Submit another"
    } catch (e: any) {
      alert(e.message || 'Submission failed! Check console.');
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !session) return null;

  if (isDataLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-black">
        <Navbar role={session.role} username={session.username} />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
            <p className="text-gray-400 font-medium animate-pulse">Syncing datasets...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar role={session.role} username={session.username} />

      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-headline font-bold text-white">{roundTitle}</h1>
            <div className="text-muted-foreground whitespace-pre-wrap text-sm leading-relaxed">
              {taskDesc.split(/(\[ NOTE: .*? \])/g).map((part, i) => (
                part.startsWith('[ NOTE:') ? (
                  <span key={i} className="text-rose-500 font-bold block mt-4 border border-rose-500/20 bg-rose-500/5 p-4 rounded-xl animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.1)]">
                    {part}
                  </span>
                ) : (
                  <span key={i}>{part}</span>
                )
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <MagicCard className="border-t-4 border-t-emerald-500 bg-black/40 backdrop-blur-md text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Download className="w-5 h-5 text-emerald-400" />
                  Dataset & Resources
                </CardTitle>
                <CardDescription className="text-gray-400">Download your track-specific datasets.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-white/5 border border-white/10 flex flex-col gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-300">Phase 1: Initial Datasets</p>
                    <p className="text-xs text-gray-500">Source: Supabase • .csv/.zip</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {mainDatasets.length > 0 ? (
                      mainDatasets.map((url, idx) => (
                        <Button key={idx} asChild size="sm" className="bg-green-600 hover:bg-green-500 text-white border-none">
                          <a href={url} target="_blank" rel="noopener noreferrer">
                            Download Part {idx + 1}
                          </a>
                        </Button>
                      ))
                    ) : (
                      <p className="text-xs text-yellow-500">No datasets available yet.</p>
                    )}
                  </div>
                </div>

                {/* Phase 2 Dataset - Conditional */}
                {finalDatasets.length > 0 && (
                  <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex flex-col gap-3 animate-in fade-in slide-in-from-top-4 duration-1000">
                    <div>
                      <p className="text-sm font-semibold text-emerald-400">Phase 2: Final Supplementary</p>
                      <p className="text-xs text-emerald-500/70">Released: Last 45 Mins • Complex Patterns</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {finalDatasets.map((url, idx) => (
                        <Button key={idx} asChild size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white border-none shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                          <a href={url} target="_blank" rel="noopener noreferrer">
                            Download Part {idx + 1}
                          </a>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </MagicCard>

            <MagicCard className="border-t-4 border-t-green-500 bg-black/40 backdrop-blur-md text-white relative overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Upload className="w-5 h-5 text-green-400" />
                  Submit Work
                </CardTitle>
                <CardDescription className="text-gray-400">Submit your team results here.</CardDescription>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] uppercase text-gray-500 font-bold">Ends At / Time Remaining</span>
                  <div className="flex flex-col items-end">
                    {endTime && (
                      <span className="text-xs text-gray-400 font-medium">
                        {new Date(endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </span>
                    )}
                    <span className={`text-2xl font-mono font-bold ${timeRemaining !== null && timeRemaining <= 300 ? 'text-rose-500 animate-pulse' : 'text-green-400'}`}>
                      {timeRemaining !== null ? formatTime(timeRemaining) : '--:--:--'}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 relative">
                <div>
                  {submitted ? (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6 text-center space-y-3">
                      <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto animate-bounce" />
                      <h3 className="font-bold text-white">Submission Received!</h3>
                      <p className="text-sm text-green-300">Your work has been successfully uploaded to the database.</p>
                      <Button variant="outline" size="sm" onClick={() => setSubmitted(false)} className="border-green-500/30 text-green-400 hover:bg-green-500/20">Submit another</Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {questions.map((q) => (
                        <div key={q.id} className="space-y-2">
                          <Label htmlFor={q.id} className="text-gray-300">{q.label}</Label>
                          {q.type === 'select' ? (
                            <select
                              id={q.id}
                              value={answers[q.id] || ''}
                              onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                              className="w-full h-10 px-3 rounded-md bg-black/20 border border-white/10 text-gray-200 focus:outline-none focus:border-green-500/50 appearance-none cursor-pointer"
                            >
                              <option value="" disabled className="bg-gray-900">{q.placeholder}</option>
                              {q.options?.map((opt: string) => (
                                <option key={opt} value={opt} className="bg-gray-900">{opt}</option>
                              ))}
                            </select>
                          ) : q.type === 'textarea' ? (
                            <textarea
                              id={q.id}
                              placeholder={q.placeholder}
                              value={answers[q.id] || ''}
                              onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                              className="w-full min-h-[100px] p-3 rounded-md bg-black/20 border border-white/10 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-green-500/50 resize-none"
                            />
                          ) : q.type === 'image' ? (
                            <div
                              onClick={() => fileInputRef.current?.click()}
                              className="border-2 border-dashed border-white/10 rounded-lg p-8 text-center cursor-pointer hover:bg-white/5 hover:border-green-500/30 transition-all group"
                            >
                              {selectedFile ? (
                                <div className="space-y-2">
                                  <FileImage className="w-8 h-8 text-green-400 mx-auto mb-2" />
                                  <p className="text-sm font-medium truncate max-w-xs mx-auto text-gray-300">{selectedFile.name}</p>
                                  <p className="text-xs text-gray-500">Click to change file</p>
                                </div>
                              ) : (
                                <>
                                  <Upload className="w-8 h-8 text-gray-600 group-hover:text-green-400 transition-colors mx-auto mb-2" />
                                  <p className="text-xs text-gray-500 group-hover:text-gray-400">Drop your image here or click to browse</p>
                                </>
                              )}
                              <input
                                type="file"
                                id="file"
                                name="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                                required={!selectedFile}
                              />
                            </div>
                          ) : (
                            <Input
                              id={q.id}
                              type={q.type}
                              step="0.01"
                              placeholder={q.placeholder}
                              value={answers[q.id] || ''}
                              onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                              className="bg-black/20 border-white/10 text-gray-200 placeholder:text-gray-600 focus:border-green-500/50"
                            />
                          )}
                        </div>
                      ))}
                      <Button
                        type="submit"
                        disabled={!isSubmissionEnabled || submitting}
                        className={`w-full font-bold py-3 rounded-lg transition-all ${isSubmissionEnabled
                            ? 'bg-green-600 hover:bg-green-700 text-white shadow-[0_0_20px_rgba(22,163,74,0.3)] hover:scale-[1.02] active:scale-[0.98]'
                            : 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-50'
                          }`}
                      >
                        {!isSubmissionEnabled ? (
                          <div className="flex items-center gap-2">
                            <Lock className="w-4 h-4" />
                            <span>Unlocks in Final 30 Minutes</span>
                          </div>
                        ) : submitting ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Uploading...</span>
                          </div>
                        ) : (
                          'Submit Round Work'
                        )}
                      </Button>
                    </form>
                  )}
                </div>
              </CardContent>
            </MagicCard>
          </div>
        </div>
      </main >
    </div >
  );
}
