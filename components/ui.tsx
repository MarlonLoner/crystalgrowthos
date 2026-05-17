import { cn } from "@/lib/utils";

export function Panel({
  children,
  className,
  id
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "rounded-lg border border-white/10 bg-graphite/82 p-5 shadow-glow backdrop-blur",
        className
      )}
    >
      {children}
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-aurum">{eyebrow}</p>
        <h2 className="mt-1 text-2xl font-black text-white">{title}</h2>
      </div>
      <p className="max-w-2xl text-sm leading-6 text-mercury">{description}</p>
    </div>
  );
}

export const inputClass =
  "w-full rounded-lg border border-white/10 bg-obsidian/80 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-aurum/70 focus:ring-2 focus:ring-aurum/15";

export const buttonClass =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-ember px-4 py-2.5 text-sm font-black text-obsidian transition hover:bg-aurum";
