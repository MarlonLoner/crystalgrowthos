import Link from "next/link";
import { Archive, CalendarClock, CheckCircle2, ExternalLink, Send } from "lucide-react";
import { ActionButton } from "@/components/action-button";
import { Panel, SectionHeading } from "@/components/ui";
import { scheduleContentPostAction } from "@/lib/actions";
import { contentPlatformLabel, contentStatusLabel, getContentSummary } from "@/lib/content-intelligence";
import type { ContentPostView, ProofAssetView, ProductionJobView } from "@/lib/db-data";
import type { Lead, Quote } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

export type ContentCalendarItem = {
  post: ContentPostView;
  proof: ProofAssetView | null;
  lead: Lead | null;
  quote: Quote | null;
  productionJob: ProductionJobView | null;
};

type ContentCalendarBoardProps = {
  items: ContentCalendarItem[];
  source?: "database" | "fallback";
};

const columns = [
  ["IDEA", "Ideas"],
  ["DRAFTED", "Drafted"],
  ["READY", "Ready"],
  ["SCHEDULED", "Scheduled"],
  ["PUBLISHED", "Published"],
  ["ARCHIVED", "Archived"]
] as const;

function ContentCard({ item }: { item: ContentCalendarItem }) {
  const { post, proof, lead, productionJob } = item;
  const summary = getContentSummary(post);

  return (
    <div className="rounded-lg border border-white/10 bg-obsidian/70 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-black text-white">{post.title}</p>
          <p className="mt-1 text-xs text-mercury">{lead?.businessName ?? "No lead linked"}</p>
        </div>
        <span className="rounded-lg bg-aurum/10 px-2 py-1 text-[11px] font-black text-aurum">{contentPlatformLabel(post.platform)}</span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-300">
        <span>Format: <b className="text-white">{contentStatusLabel(post.format)}</b></span>
        <span>Status: <b className="text-white">{summary.statusLabel}</b></span>
        <span>Scheduled: <b className="text-white">{formatDate(post.scheduledAt)}</b></span>
        <span>Published: <b className="text-white">{formatDate(post.publishedAt)}</b></span>
        <span className="col-span-2">Proof: <b className="text-white">{proof?.title ?? "No proof asset linked"}</b></span>
        <span className="col-span-2">Job: <b className="text-white">{productionJob?.title ?? "No production job linked"}</b></span>
      </div>

      <p className="mt-3 line-clamp-4 rounded-lg border border-white/10 bg-white/[0.04] p-3 text-sm leading-6 text-slate-200">{post.caption}</p>
      <p className="mt-3 text-xs font-bold text-aurum">{summary.suggestedNextAction}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {lead ? <Link href={`/leads/${lead.id}`} className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white">View Lead</Link> : null}
        {proof ? <Link href="/proof" className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white"><ExternalLink size={14} className="inline" /> View Proof</Link> : null}
        {post.status !== "READY" && post.status !== "PUBLISHED" && post.status !== "ARCHIVED" ? <ActionButton action="content-ready" contentPostId={post.id} className="rounded-lg bg-aurum px-3 py-2 text-xs font-black text-obsidian"><CheckCircle2 size={14} className="inline" /> Mark Ready</ActionButton> : null}
        {post.status !== "PUBLISHED" && post.status !== "ARCHIVED" ? <ActionButton action="content-published" contentPostId={post.id} className="rounded-lg bg-emerald-400 px-3 py-2 text-xs font-black text-obsidian"><Send size={14} className="inline" /> Mark Published</ActionButton> : null}
        {post.status !== "ARCHIVED" ? <ActionButton action="content-archived" contentPostId={post.id} className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white"><Archive size={14} className="inline" /> Archive</ActionButton> : null}
      </div>

      {post.status !== "PUBLISHED" && post.status !== "ARCHIVED" ? (
        <form action={scheduleContentPostAction} className="mt-4 grid gap-2 rounded-lg border border-white/10 bg-white/[0.04] p-3 sm:grid-cols-[1fr_auto]">
          <input type="hidden" name="postId" value={post.id} />
          <label className="text-xs font-bold uppercase tracking-[0.14em] text-mercury sm:col-span-2">Schedule</label>
          <input name="scheduledAt" type="datetime-local" className="rounded-lg border border-white/10 bg-white px-3 py-2 text-sm font-bold text-slate-950 placeholder:text-slate-400" />
          <button type="submit" className="rounded-lg bg-white/10 px-3 py-2 text-xs font-black text-white"><CalendarClock size={14} className="inline" /> Schedule</button>
          <input name="notes" placeholder="Schedule notes" className="rounded-lg border border-white/10 bg-white px-3 py-2 text-sm font-bold text-slate-950 placeholder:text-slate-400 sm:col-span-2" />
        </form>
      ) : null}
    </div>
  );
}

export function ContentCalendarBoard({ items, source = "database" }: ContentCalendarBoardProps) {
  return (
    <div className="space-y-6">
      <Panel>
        <SectionHeading
          eyebrow="Content Calendar"
          title="Proof-driven publishing queue"
          description="Turn reviews, testimonials, referrals, and completed projects into drafted, scheduled, and published marketing assets."
        />
        <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-300">
          <span className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2">Source: {source === "database" ? "Database" : "Fallback"}</span>
          <span className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2">Content posts: {items.length}</span>
        </div>
      </Panel>

      <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
        {columns.map(([status, label]) => {
          const columnItems = items.filter((item) => item.post.status === status);
          return (
            <section key={status} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-sm font-black uppercase tracking-[0.14em] text-white">{label}</h2>
                <span className="rounded-lg bg-white/10 px-2 py-1 text-xs font-black text-mercury">{columnItems.length}</span>
              </div>
              <div className="space-y-3">
                {columnItems.map((item) => <ContentCard key={item.post.id} item={item} />)}
                {columnItems.length === 0 ? <p className="rounded-lg border border-dashed border-white/10 p-4 text-sm text-mercury">No content posts in this stage. Create drafts from Proof Engine, then mark them ready, scheduled, or published.</p> : null}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

