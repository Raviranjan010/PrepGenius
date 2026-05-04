import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  Code2,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Zap,
  Layout,
  Mic,
  Cpu,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const capabilities = [
  {
    title: "Cognitive AI Interviews",
    desc: "Experience deep, role-specific technical dialogues powered by advanced LLMs that probe beyond the surface.",
    icon: BrainCircuit,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
  },
  {
    title: "Real-time Code Sandbox",
    desc: "Switch from verbal to technical seamlessly. Solve complex algorithm problems with AI-assisted reviews.",
    icon: Code2,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    title: "Behavioral Intelligence",
    desc: "Our AI analyzes your communication clarity, filler words, and confidence in real-time using STAR methodology.",
    icon: MessageSquareText,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },
  {
    title: "Resume Synthesis",
    desc: "Hyper-personalized sessions that cross-reference your resume against target job descriptions.",
    icon: Layout,
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
  },
];

export const HomePage = () => {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary/30 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-48 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/10 blur-[120px] rounded-full opacity-20 pointer-events-none" />
        <div className="absolute top-[10%] right-[10%] w-[400px] h-[400px] bg-emerald-500/10 blur-[100px] rounded-full opacity-10 pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] animate-fade-in">
              <Sparkles className="w-3 h-3 fill-primary" />
              The Future of Interview Prep
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] animate-slide-up">
              Master the art of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-400 to-primary-foreground animate-gradient">technical interviews.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in delay-200">
              Stop guessing. Start practicing with PrepGenius — the elite AI workspace designed to help you crush high-stakes engineering interviews.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in delay-300 pt-4">
              <Link
                to="/generate"
                className="w-full sm:w-auto inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-primary px-10 text-sm font-black text-primary-foreground shadow-2xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
              >
                Launch Intelligence Hub
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/resources"
                className="w-full sm:w-auto inline-flex h-14 items-center justify-center gap-2 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md px-10 text-sm font-black text-foreground transition-all hover:bg-white/10 hover:border-white/10 active:scale-95"
              >
                Explore Resources
              </Link>
            </div>
          </div>
        </div>

        {/* Dashboard Preview Mockup */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mt-24 animate-slide-up delay-500">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-emerald-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
            <div className="relative glass-card rounded-[2.5rem] border-white/10 overflow-hidden shadow-2xl">
              <div className="h-10 bg-white/5 flex items-center gap-2 px-6 border-b border-white/5">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
              </div>
              <div className="bg-[#050505] aspect-[16/9] flex items-center justify-center">
                 <div className="flex flex-col items-center gap-6">
                    <Zap className="w-16 h-16 text-primary/20 animate-pulse" />
                    <p className="text-xs font-bold uppercase tracking-widest text-primary/40 italic">System Ready: Initializing Mockup...</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="py-32 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-20">
            <div className="max-w-2xl space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Core Intelligence</p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight">Built for elite engineers.</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We've built the world's most sophisticated interview preparation platform by combining deep cognitive models with real-world engineering scenarios.
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {capabilities.map((cap) => (
              <div 
                key={cap.title} 
                className="glass-card group p-8 rounded-3xl border-white/5 hover:border-primary/20 transition-all duration-500 hover:-translate-y-2"
              >
                <div className={cn("p-4 rounded-2xl w-fit mb-6 transition-transform group-hover:scale-110", cap.bg)}>
                  <cap.icon className={cn("w-6 h-6", cap.color)} />
                </div>
                <h3 className="text-xl font-bold mb-3">{cap.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {cap.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Methodology */}
      <section className="py-32 bg-primary/5 border-y border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(16,185,129,0.05),transparent_50%)]" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <div className="p-4 rounded-3xl bg-primary/10 w-fit">
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-none">
                Honest preparation. <br />
                Proven results.
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                PrepGenius doesn't promise shortcuts. We provide the most realistic practice environment possible, so when you walk into the real interview, you've already been there.
              </p>
              
              <ul className="space-y-4 pt-4">
                {[
                  "No dummy metrics or fake success rates.",
                  "Real-time feedback based on actual performance.",
                  "Privacy-first data handling for your sessions.",
                ].map((note) => (
                  <li key={note} className="flex items-center gap-3 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    {note}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
               <MethodCard 
                  icon={Cpu} 
                  title="2.0 Flash Intelligence" 
                  desc="Leverage the latest models for lightning-fast, high-context feedback."
               />
               <MethodCard 
                  icon={BarChart3} 
                  title="Data-Driven Stats" 
                  desc="Track your proficiency climb across 50+ technical categories."
               />
               <MethodCard 
                  icon={Mic} 
                  title="Vocal Analysis" 
                  desc="Master your delivery with real-time filler word and pace tracking."
               />
               <MethodCard 
                  icon={Zap} 
                  title="Instant Feedback" 
                  desc="Receive detailed evaluations within seconds of completing a round."
               />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-48 text-center relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-10">
            Ready to become <br />
            an <span className="text-primary">Elite</span> candidate?
          </h2>
          <Link
            to="/generate"
            className="inline-flex h-16 items-center justify-center gap-3 rounded-2xl bg-primary px-12 text-lg font-black text-primary-foreground shadow-2xl shadow-primary/30 transition-all hover:scale-110 active:scale-95"
          >
            Start Your Journey Now
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="mt-8 text-muted-foreground font-medium uppercase tracking-[0.2em] text-[10px]">
            Join 5,000+ engineers prepping for Big Tech.
          </p>
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="py-12 border-t border-white/5 text-center">
        <div className="flex items-center justify-center gap-2 mb-4 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-sm font-black uppercase tracking-widest">PrepGenius Intelligence</span>
        </div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          © 2026 Engineered with Precision. All Rights Reserved.
        </p>
      </footer>
    </main>
  );
};

function MethodCard({ icon: Icon, title, desc }: any) {
  return (
    <div className="glass-card p-6 rounded-3xl border-white/5 space-y-4">
      <div className="p-2.5 rounded-xl bg-white/5 w-fit">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <h3 className="font-bold">{title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}
