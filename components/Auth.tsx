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

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60" />;
};

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

  // --- Main View (Split Screen) ---
  return (
    <div className="min-h-screen w-full flex bg-[#0f172a] text-slate-100 font-sans selection:bg-blue-500/30">
      
      {/* Left Side: Form */}
      <div className="w-full lg:w-[480px] xl:w-[550px] flex flex-col justify-center px-8 sm:px-12 lg:px-16 relative z-10 bg-[#0f172a] border-r border-white/5 shadow-2xl">
        
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

          {/* Social Auth
          <div className="grid grid-cols-1 gap-3 mb-8">
            <button 
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-3 px-4 py-2.5 bg-white text-slate-900 rounded-lg hover:bg-slate-100 transition-all font-medium text-sm shadow-sm"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </div>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#0f172a] px-2 text-slate-500">Or using email</span>
            </div>
          </div>
           */}



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

      {/* Right Side: Visuals */}
      <div className="hidden lg:flex flex-1 relative bg-slate-900 overflow-hidden items-center justify-center">
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
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 p-6 bg-slate-900/90 border border-blue-500/30 rounded-2xl backdrop-blur-xl shadow-2xl shadow-blue-900/20 animate-float">
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