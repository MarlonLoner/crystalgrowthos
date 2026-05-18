import {
  BarChart3,
  Bot,
  CalendarClock,
  FileText,
  LayoutDashboard,
  Mail,
  MessageSquareText,
  ReceiptText,
  Sparkles,
  UsersRound
} from "lucide-react";

const nav = [
  ["Dashboard", "/#dashboard", LayoutDashboard],
  ["Follow-Ups", "/follow-ups", MessageSquareText],
  ["Quotes", "/quotes", ReceiptText],
  ["AI Strategy", "/#strategy", Bot],
  ["Leads", "/leads", UsersRound],
  ["Pipeline", "/#pipeline", BarChart3],
  ["Content", "/#content", Sparkles],
  ["Campaigns", "/#campaigns", Mail],
  ["Automation", "/#automation", CalendarClock],
  ["Reports", "/#reports", FileText]
] as const;

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[18rem_1fr]">
      <aside className="sticky top-0 z-30 border-b border-white/10 bg-obsidian/92 backdrop-blur lg:h-screen lg:border-b-0 lg:border-r">
        <div className="flex h-full flex-col gap-6 p-4 lg:p-6">
          <a href="/#dashboard" className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-lg border border-aurum/30 bg-aurum/10 text-aurum shadow-glow">
              <Sparkles size={22} />
            </div>
            <div>
              <p className="text-lg font-black leading-5 text-white">Crystal</p>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mercury">
                Growth OS
              </p>
            </div>
          </a>

          <nav className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
            {nav.map(([label, href, Icon]) => (
              <a
                key={label}
                href={href}
                className="flex min-w-max items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-mercury transition hover:bg-white/7 hover:text-white"
              >
                <Icon size={18} />
                <span>{label}</span>
              </a>
            ))}
          </nav>

          <div className="mt-auto hidden rounded-lg border border-white/10 bg-white/[0.04] p-4 lg:block">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-aurum">
              Money OS Mode
            </p>
            <p className="mt-2 text-sm leading-6 text-mercury">
              Follow-ups, quotes, and pipeline actions are now organized around daily revenue execution.
            </p>
          </div>
        </div>
      </aside>

      <main className="mx-auto w-full max-w-[1600px] space-y-8 px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}


