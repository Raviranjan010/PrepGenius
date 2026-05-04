import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Bot,
  FileText,
  Mic,
  MessageSquareText,
  PenTool,
  Sparkles,
  Star,
  Target,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

const featureCards = [
  {
    title: "AI Mock Interviews",
    desc: "Realistic sessions that adapt to your role, resume, and target company.",
    icon: Bot,
    color: "bg-[#dcebe1] text-[#1f5f42]",
  },
  {
    title: "Personalized Feedback",
    desc: "Detailed notes on clarity, confidence, communication, and relevance.",
    icon: MessageSquareText,
    color: "bg-[#ffdcbf] text-[#9a4318]",
  },
  {
    title: "Expert Resources",
    desc: "Curated guides, question sets, and interview playbooks for practice.",
    icon: BookOpen,
    color: "bg-[#e4d5fb] text-[#4f2f83]",
  },
  {
    title: "Track Progress",
    desc: "Monitor improvement and build interview confidence every session.",
    icon: BarChart3,
    color: "bg-[#ffe9aa] text-[#7b5510]",
  },
];

export const HomePage = () => {
  return (
    <main className="overflow-x-hidden text-foreground">
      <section className="px-3 pb-12 pt-8 lg:px-4">
        <div className="cream-panel relative mx-auto max-w-7xl overflow-hidden rounded-[1.75rem] px-6 py-14 sm:px-10 lg:px-16 lg:py-20">
          <div className="absolute left-[45%] top-10 h-64 w-64 rounded-full bg-[#d9c9b8]/35" />
          <div className="absolute bottom-8 right-0 h-40 w-40 rounded-[45%] bg-primary/80 blur-[1px]" />
          <div className="absolute bottom-16 left-[40%] h-72 w-72 rounded-full bg-[#d8c9ba]/25" />

          <div className="relative z-10 grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
            <div className="max-w-xl">
              <div className="mb-10 inline-flex items-center gap-2 rounded-full bg-[#f1dfcc] px-4 py-2 text-xs font-medium text-[#5c331d] shadow-sm">
                <Sparkles className="h-3.5 w-3.5" />
                Interview Preparation, Redefined
              </div>

              <h1 className="text-5xl font-black leading-[1.03] tracking-tight sm:text-6xl lg:text-7xl">
                Ace Interviews.
                <br />
                Build <span className="text-primary">Confidence.</span>
              </h1>
              <p className="mt-8 max-w-lg text-lg leading-8 text-muted-foreground">
                PrepGenius helps you prepare smarter with AI-driven mock interviews, expert tips, and personalized feedback.
              </p>

              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <Link
                  to="/generate"
                  className="ink-button inline-flex h-14 items-center justify-center gap-3 rounded-2xl px-7 text-sm font-bold transition-all active:scale-95"
                >
                  Start Free Practice
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
                <Link
                  to="/resources"
                  className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl border border-white/75 bg-white/45 px-7 text-sm font-bold shadow-sm backdrop-blur-xl transition-all hover:bg-white active:scale-95"
                >
                  <FileText className="h-4 w-4" />
                  Build Your Resume
                </Link>
              </div>

              <div className="mt-10 flex items-center gap-5">
                <div className="flex -space-x-3">
                  {["RS", "AK", "MJ", "TP"].map((name) => (
                    <div key={name} className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#ece1d5] text-xs font-bold">
                      {name}
                    </div>
                  ))}
                </div>
                <p className="max-w-[230px] text-sm leading-6 text-muted-foreground">
                  Join <span className="font-bold text-primary">25,000+</span> users who landed their dream job
                </p>
              </div>
            </div>

            <HeroMockup />
          </div>

          <div className="relative z-10 mt-16 rounded-2xl border border-white/75 bg-white/30 px-8 py-7 backdrop-blur-xl">
            <div className="grid items-center gap-7 text-center text-muted-foreground md:grid-cols-[1fr_repeat(5,auto)] md:text-left">
              <p className="text-xs">Trusted by job seekers from</p>
              {["Google", "Microsoft", "amazon", "Deloitte.", "Adobe"].map((brand) => (
                <p key={brand} className="text-2xl font-bold tracking-tight text-foreground/65">
                  {brand}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14 sm:px-10">
        <div className="mb-10 text-center">
          <span className="rounded-full border border-border/70 bg-white/35 px-4 py-1.5 text-xs font-medium">Features</span>
          <h2 className="mt-5 text-4xl font-black tracking-tight">
            Everything you need to <span className="accent-script">crack</span> the interview
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {featureCards.map((feature) => (
            <article key={feature.title} className="glass-card group rounded-2xl p-7">
              <div className={`mb-8 flex h-14 w-14 items-center justify-center rounded-xl ${feature.color}`}>
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold">{feature.title}</h3>
              <p className="mt-4 min-h-[72px] text-sm leading-6 text-muted-foreground">{feature.desc}</p>
              <div className="mt-6 flex justify-end">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-white/45 transition group-hover:bg-white">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-10 sm:px-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <ResumeMockup />
        <div className="max-w-lg">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#f1dfcc] px-4 py-2 text-xs font-medium text-[#5c331d]">
            <FileText className="h-3.5 w-3.5" />
            Resume Builder Included
          </div>
          <h2 className="text-4xl font-black leading-tight tracking-tight">
            Build a resume that gets you noticed
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Use our smart resume builder to create a professional resume that highlights your strengths and passes ATS systems.
          </p>
          <Link
            to="/generate"
            className="mt-8 inline-flex h-14 items-center justify-center gap-3 rounded-2xl border border-white/75 bg-white/50 px-7 text-sm font-bold shadow-sm backdrop-blur-xl transition hover:bg-white"
          >
            <FileText className="h-4 w-4" />
            Create Resume Now
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16 pt-6 sm:px-10">
        <div className="cream-panel grid gap-7 rounded-2xl px-8 py-8 sm:grid-cols-2 lg:grid-cols-4">
          <Stat icon={Users} value="25,000+" label="Users" />
          <Stat icon={MessageSquareText} value="98,000+" label="Mock Interviews Taken" />
          <Stat icon={Target} value="85%" label="Users Improved" />
          <Stat icon={Star} value="4.9/5" label="User Rating" />
        </div>
      </section>
    </main>
  );
};

function HeroMockup() {
  return (
    <div className="glass-card relative mx-auto w-full max-w-[620px] rounded-[2rem] p-5 lg:p-6">
      <div className="rounded-[1.5rem] border border-white/65 bg-white/30 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm font-bold">
            <span className="h-2.5 w-2.5 rounded-full bg-[#33a063]" />
            Mock Interview
          </div>
          <span className="rounded-full bg-[#dff0df] px-3 py-1 text-xs text-[#28633e]">Live Session</span>
        </div>
        <div className="relative my-10 flex min-h-32 items-center justify-center">
          <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />
          <div className="absolute inset-x-4 top-1/2 flex -translate-y-1/2 justify-between opacity-35">
            {Array.from({ length: 28 }).map((_, index) => (
              <span key={index} className="w-1 rounded-full bg-foreground/50" style={{ height: `${10 + (index % 5) * 9}px` }} />
            ))}
          </div>
          <div className="relative flex h-32 w-32 items-center justify-center rounded-full border border-white/80 bg-white/45 shadow-[inset_0_2px_20px_rgba(255,255,255,0.9),0_20px_55px_rgba(39,31,24,0.18)]">
            <Mic className="h-12 w-12" />
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-[1.25rem] border border-white/65 bg-white/35 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm font-bold">
            <Sparkles className="h-4 w-4" />
            AI Feedback
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-xs text-muted-foreground">Overall Score</span>
            <span className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-[#3aa66a] bg-white/40 font-bold text-[#26724a]">8.6</span>
            <span className="text-muted-foreground">/10</span>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Clarity", "8.5", "bg-[#dfeee2]"],
            ["Confidence", "8.0", "bg-[#ffdec8]"],
            ["Communication", "9.0", "bg-[#e3d3f5]"],
            ["Relevance", "8.5", "bg-[#f8e4b2]"],
          ].map(([label, score, color]) => (
            <div key={label} className={`${color} rounded-xl p-4 text-center`}>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-3 font-bold">{score}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ResumeMockup() {
  return (
    <div className="glass-card rounded-[1.75rem] p-6">
      <div className="grid gap-5 rounded-[1.25rem] border border-white/70 bg-white/35 p-5 sm:grid-cols-[72px_1fr_160px]">
        <div className="space-y-6 text-center text-xs text-muted-foreground">
          {[FileText, PenTool, Sparkles].map((Icon, index) => (
            <div key={index} className="flex flex-col items-center gap-2">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/60 bg-white/55">
                <Icon className="h-4 w-4 text-foreground" />
              </span>
            </div>
          ))}
        </div>
        <div className="rounded-xl bg-white/70 p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f4c7a7] font-bold">RS</div>
            <div>
              <p className="font-bold">Riya Sharma</p>
              <p className="text-xs text-muted-foreground">Product Manager</p>
            </div>
          </div>
          {["SUMMARY", "EXPERIENCE", "SKILLS"].map((section) => (
            <div key={section} className="mb-5">
              <p className="mb-2 text-[10px] font-black tracking-widest">{section}</p>
              <div className="space-y-2">
                <div className="h-2 rounded bg-foreground/12" />
                <div className="h-2 w-4/5 rounded bg-foreground/10" />
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-border/60 bg-white/45 p-5">
          <p className="text-xs font-medium">Score</p>
          <div className="mx-auto my-6 flex h-24 w-24 items-center justify-center rounded-full border-[7px] border-[#43a56e] bg-white/45 text-center">
            <div>
              <p className="text-2xl font-black">92</p>
              <p className="text-[10px]">Excellent</p>
            </div>
          </div>
          {["Content", "Formatting", "Impact", "Keyword"].map((item, index) => (
            <div key={item} className="mb-3 flex justify-between text-xs">
              <span>{item}</span>
              <span className={index === 3 ? "text-[#238052]" : ""}>{index === 3 ? "10/10" : "9/10"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, value, label }: { icon: typeof Users; value: string; label: string }) {
  return (
    <div className="flex items-center gap-5">
      <span className="flex h-12 w-12 items-center justify-center rounded-full border border-border/60 bg-white/40">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-3xl font-black tracking-tight">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
