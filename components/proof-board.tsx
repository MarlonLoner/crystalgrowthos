import Link from "next/link";
import { CheckCircle2, FilePlus2, MessageCircle, PenLine, Send, Share2 } from "lucide-react";
import { ActionButton } from "@/components/action-button";
import { Panel, SectionHeading } from "@/components/ui";
import type { ContentPostView, ProofAssetView, ProductionJobView } from "@/lib/db-data";
import type { Lead, Quote } from "@/lib/mock-data";
import { generateProofContentDrafts } from "@/lib/proof-content";
import { getProofSummary, proofStatusLabel, proofTypeLabel } from "@/lib/proof-intelligence";

export type ProofBoardItem = {
  proof: ProofAssetView;
  lead: Lead;
  quote: Quote | null;
  productionJob: ProductionJobView | null;
  contentPosts?: ContentPostView[];
};

type ProofBoardProps = {
  items: ProofBoardItem[];
  source?: "database" | "fallback";
};

const columns = [
  ["TODO", "To Request"],
  ["REQUESTED", "Requested"],
  ["RECEIVED", "Received"],
  ["DRAFTED", "Drafted"],
  ["PUBLISHED", "Published"],
  ["ARCHIVED", "Archived"]
] as const;

function ProofCard({ item }: { item: ProofBoardItem }) {
  const { proof, lead, quote, productionJob, contentPosts = [] } = item;
  const summary = getProofSummary({ lead, quote, job: productionJob, proofAssets: [proof] });
  const drafts = generateProofContentDrafts({ lead, quote, job: productionJob });

  return (
    <div className="rounded-lg border border-white/10 bg-obsidian/70 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-black text-white">{proof.title}</p>
          <p className="mt-1 text-xs text-mercury">{lead.businessName} - {lead.name}</p>
        </div>
        <span className="rounded-lg bg-aurum/10 px-2 py-1 text-[11px] font-black text-aurum">{proofTypeLabel(proof.type)}</span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-300">
        <span>Status: <b className="text-white">{proofStatusLabel(proof.status)}</b></span>
        <span>Score: <b className="text-white">{summary.contentOpportunityScore}</b></span>
        <span className="col-span-2">Job: <b className="text-white">{productionJob?.title ?? "No job linked"}</b></span>
        <span className="col-span-2">Quote: <b className="text-white">{quote?.quoteNumber ?? "No quote linked"}</b></span>
        <span className="col-span-2">Content posts: <b className="text-white">{contentPosts.length ? `${contentPosts.length} (${contentPosts[0].status})` : "None yet"}</b></span>
      </div>

      <p className="mt-3 rounded-lg border border-white/10 bg-white/[0.04] p-3 text-sm leading-6 text-slate-200">{summary.suggestedNextAction}</p>

      {proof.status === "DRAFTED" || proof.type === "SOCIAL_POST" || proof.type === "BEFORE_AFTER" ? (
        <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.04] p-3 text-xs leading-5 text-slate-300">
          <p className="font-black text-white">Suggested caption</p>
          <p className="mt-2">{drafts.facebookCaption}</p>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={`/leads/${lead.id}`} className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white">View Lead</Link>
        {productionJob ? <Link href="/production" className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white">View Job</Link> : null}
        <ActionButton action="request-review" proofAssetId={proof.id} className="rounded-lg bg-aurum px-3 py-2 text-xs font-black text-obsidian"><MessageCircle size={14} className="inline" /> Request Review</ActionButton>
        <ActionButton action="review-received" proofAssetId={proof.id} className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white"><CheckCircle2 size={14} className="inline" /> Mark Review Received</ActionButton>
        <ActionButton action="draft-social-post" proofAssetId={proof.id} className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white"><PenLine size={14} className="inline" /> Draft Social Post</ActionButton>
        <ActionButton action="create-content-draft" proofAssetId={proof.id} className="rounded-lg bg-aurum px-3 py-2 text-xs font-black text-obsidian"><FilePlus2 size={14} className="inline" /> Create Content Draft</ActionButton>
        {contentPosts.length ? <Link href="/content-calendar" className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white">Open Content</Link> : null}
        <ActionButton action="proof-published" proofAssetId={proof.id} className="rounded-lg bg-emerald-400 px-3 py-2 text-xs font-black text-obsidian"><Send size={14} className="inline" /> Mark Published</ActionButton>
        <ActionButton action="ask-referral" proofAssetId={proof.id} className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white"><Share2 size={14} className="inline" /> Ask for Referral</ActionButton>
      </div>
    </div>
  );
}

export function ProofBoard({ items, source = "database" }: ProofBoardProps) {
  return (
    <div className="space-y-6">
      <Panel>
        <SectionHeading
          eyebrow="Proof Engine"
          title="Reviews, testimonials, referrals, and content"
          description="Turn completed production jobs into trust assets: reviews, before/after posts, case studies, referrals, and social proof."
        />
        <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-300">
          <span className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2">Source: {source === "database" ? "Database" : "Fallback"}</span>
          <span className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2">Proof assets: {items.length}</span>
        </div>
      </Panel>

      <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
        {columns.map(([status, label]) => {
          const columnItems = items.filter((item) => item.proof.status === status);
          return (
            <section key={status} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-sm font-black uppercase tracking-[0.14em] text-white">{label}</h2>
                <span className="rounded-lg bg-white/10 px-2 py-1 text-xs font-black text-mercury">{columnItems.length}</span>
              </div>
              <div className="space-y-3">
                {columnItems.map((item) => <ProofCard key={item.proof.id} item={item} />)}
                {columnItems.length === 0 ? <p className="rounded-lg border border-dashed border-white/10 p-4 text-sm text-mercury">No proof assets in this stage.</p> : null}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}


