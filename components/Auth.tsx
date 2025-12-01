import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabase';
import { Kanban, Loader2, Mail, ArrowRight, Lock, Check, Sparkles } from 'lucide-react';

// --- Visual Component: The AI Constellation Background ---
const ConstellationCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = canvas.parentElement?.clientWidth || 0;
    let height = canvas.height = canvas.parentElement?.clientHeight || 0;

    const particles: { x: number; y: number; vx: number; vy: number; size: number }[] = [];
    const particleCount = 40;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#3b82f6';
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.15)';

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Connect particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            ctx.lineWidth = 1 - dist / 150;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });
      requestAnimationFrame(animate);
    };

    const handleResize = () => {
        width = canvas.width = canvas.parentElement?.clientWidth || 0;
        height = canvas.height = canvas.parentElement?.clientHeight || 0;
    };

    window.addEventListener('resize', handleResize);
    animate();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60 pointer-events-none" />;
};

// --- Reusable AI Card Component ---
const AiCard = ({ className = "" }: { className?: string }) => (
    <div className={`p-6 bg-slate-900/90 border border-blue-500/30 rounded-2xl backdrop-blur-xl shadow-2xl shadow-blue-900/20 ${className}`}>
        <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2 py-1 rounded">AI-POWERED</span>
        <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <div className="w-2 h-2 rounded-full bg-green-500" />
        </div>
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Refactoring Task...</h3>
        <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-xs text-slate-400">
                <Check className="w-3 h-3 text-emerald-500" /> Generating acceptance criteria
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
                <Check className="w-3 h-3 text-emerald-500" /> Estimating story points
            </div>
            <div className="flex items-center gap-2 text-xs text-blue-400 animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin" /> Finalizing structure
            </div>
        </div>
        <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full w-2/3 bg-blue-500 rounded-full animate-loading-bar" />
        </div>
    </div>
);

// --- Main Auth Component ---
export const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);

  const currentUrl = window.location.origin;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: currentUrl }
        });
        if (error) throw error;
        setVerificationSent(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    try {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: currentUrl },
        });
        if (error) throw error;
    } catch (err: any) {
        setError(err.message);
    }
  };

  // --- Success View (Verification Sent) ---
  if (verificationSent) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0f172a] p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0f172a] to-[#0f172a]" />
        
        <div className="w-full max-w-md bg-slate-900/80 border border-white/10 rounded-2xl shadow-2xl p-8 text-center relative backdrop-blur-xl animate-in fade-in zoom-in-95 duration-500">
          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-400">
             <Mail className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Check your inbox</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            We've sent a magic link to <strong className="text-white">{email}</strong>.<br/>
            Click the link to activate your AI workspace.
          </p>
          <button onClick={() => setVerificationSent(false)} className="text-sm text-slate-500 hover:text-white transition-colors">
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  // --- Main View ---
  return (
    <div className="min-h-screen w-full flex lg:bg-[#0f172a] text-slate-100 font-sans selection:bg-blue-500/30 relative overflow-hidden lg:overflow-visible">
      
      {/* --- Mobile Background Layer (Full Screen) --- */}
      <div className="absolute inset-0 lg:hidden z-0">
          <div className="absolute inset-0 bg-[#0f172a]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,_var(--tw-gradient-stops))] from-blue-900/40 via-[#0f172a] to-[#0f172a]" />
          <ConstellationCanvas />
      </div>

      {/* --- Mobile Layout (Flex Column) --- */}
      <div className="lg:hidden relative z-10 w-full h-screen flex flex-col p-4 sm:p-6 overflow-y-auto">
          {/* Mobile Header */}
          <div className="flex items-center gap-2 mb-12 shrink-0">
            <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-500/20">
              <Kanban className="text-white h-4 w-4" />
            </div>
            <span className="font-bold text-lg tracking-tight">GenJira</span>
          </div>


          {/* Mobile Auth Card (Bottom Sheet Style) */}
          <div className="w-full bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 duration-500">
             <div className="mb-6">
                <h1 className="text-2xl font-bold text-white mb-1">
                  {isSignUp ? 'Get Started' : 'Welcome Back'}
                </h1>
                <p className="text-slate-400 text-xs">
                  {isSignUp ? 'Create an account to start building.' : 'Sign in to your workspace.'}
                </p>
             </div>

             <form onSubmit={handleAuth} className="space-y-4">
                <div className="space-y-3">
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="block w-full rounded-xl bg-slate-950/50 border border-slate-700/50 pl-10 pr-3 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-all"
                          placeholder="Email address"
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                        <input
                          type="password"
                          required
                          minLength={6}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="block w-full rounded-xl bg-slate-950/50 border border-slate-700/50 pl-10 pr-3 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-all"
                          placeholder="Password"
                        />
                    </div>
                </div>

                {error && (
                  <div className="text-red-400 text-xs bg-red-500/10 p-2 rounded-lg text-center border border-red-500/10">
                     {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (isSignUp ? 'Create Account' : 'Sign In')}
                </button>
             </form>

             <div className="mt-6 text-center">
                <button 
                  onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                </button>
             </div>
          </div>

                    {/* Mobile Hero (AI Card) */}
          <div className="flex-1 flex items-center justify-center">
               <div className="scale-100 animate-in zoom-in-95 duration-1000 fade-in">
                    <AiCard />
               </div>
          </div>
      </div>

      {/* --- Desktop Sidebar Layout (Hidden on Mobile) --- */}
      <div className="hidden lg:flex w-[480px] xl:w-[550px] flex-col justify-center px-16 relative z-10 bg-[#0f172a] border-r border-white/5 shadow-2xl h-screen">
        
        <div className="w-full max-w-[360px] mx-auto">
          {/* Brand */}
          <div className="flex items-center gap-3 mb-12">
            <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/20">
              <Kanban className="text-white h-5 w-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">GenJira</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-slate-400 text-sm">
              {isSignUp ? 'Join the future of project management.' : 'Enter your details to access your board.'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            <div className="space-y-4">
              <div className="group">
                <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1 group-focus-within:text-blue-400 transition-colors">Email address</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-600 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full rounded-lg bg-slate-900 border border-slate-700/50 pl-10 pr-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                      placeholder="you@example.com"
                    />
                </div>
              </div>

              <div className="group">
                <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1 group-focus-within:text-blue-400 transition-colors">Password</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-600 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full rounded-lg bg-slate-900 border border-slate-700/50 pl-10 pr-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                      placeholder="••••••••"
                    />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs flex items-center gap-2">
                 <div className="w-1 h-1 rounded-full bg-red-400" />
                 {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 active:scale-[0.98]"
            >
              {loading ? <Loader2 className="animate-spin h-4 w-4" /> : (
                <>
                  {isSignUp ? 'Create account' : 'Sign in'}
                  <ArrowRight className="h-4 w-4 opacity-70" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm">
            <span className="text-slate-500">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
            </span>{' '}
            <button 
              onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
              }}
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </div>
        </div>
        
        {/* Footer Links */}
        <div className="absolute bottom-6 left-0 right-0 text-center">
            <p className="text-xs text-slate-600">
                &copy; 2025 GenJira. Built with React & Supabase.
            </p>
        </div>
      </div>

      {/* --- Desktop Right Visuals --- */}
      <div className="hidden lg:flex flex-1 relative bg-slate-900 overflow-hidden items-center justify-center z-0">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-900 to-slate-900" />
        <ConstellationCanvas />

        {/* Floating Cards (Decorative) */}
        <div className="relative z-10 w-[400px] h-[500px] perspective-1000">
           {/* Card 1 */}
           <div className="absolute top-10 left-0 w-64 p-4 bg-slate-800/80 border border-white/10 rounded-xl backdrop-blur-md shadow-2xl animate-float-slow">
              <div className="flex items-center gap-2 mb-3">
                 <div className="w-2 h-2 rounded-full bg-blue-500" />
                 <div className="h-2 w-20 bg-slate-700 rounded-full" />
              </div>
              <div className="h-2 w-full bg-slate-700/50 rounded-full mb-2" />
              <div className="h-2 w-3/4 bg-slate-700/50 rounded-full" />
              <div className="flex justify-end mt-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-blue-400" />
                  </div>
              </div>
           </div>

           {/* Card 2 (Main) */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 animate-float">
               <AiCard />
           </div>

           {/* Card 3 */}
           <div className="absolute bottom-10 right-0 w-64 p-4 bg-slate-800/80 border border-white/10 rounded-xl backdrop-blur-md shadow-2xl animate-float-delayed">
              <div className="flex items-center gap-2 mb-3">
                 <div className="w-6 h-6 rounded bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-xs">SP</div>
                 <div className="h-2 w-16 bg-slate-700 rounded-full" />
              </div>
              <div className="flex gap-2">
                 <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded text-slate-400">Frontend</span>
                 <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded text-slate-400">React</span>
              </div>
           </div>
        </div>

      </div>
      
      {/* Styles for custom animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(-50%, -50%) translateY(0); }
          50% { transform: translate(-50%, -50%) translateY(-20px); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes loading-bar {
            0% { width: 0%; }
            50% { width: 70%; }
            100% { width: 100%; }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 7s ease-in-out infinite 1s; }
        .animate-loading-bar { animation: loading-bar 2s ease-out infinite; }
        .perspective-1000 { perspective: 1000px; }
      `}</style>
    </div>
  );
};
