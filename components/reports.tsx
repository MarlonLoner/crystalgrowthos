"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { contentCategories, leads, monthlyPerformance } from "@/lib/mock-data";
import { Panel, SectionHeading } from "@/components/ui";

export function Reports() {
  const won = leads.filter((lead) => lead.status === "Won").length;
  const lost = leads.filter((lead) => lead.status === "Lost").length;

  const stats = [
    ["Leads generated", "42"],
    ["Quotes sent", "21"],
    ["Won deals", won.toString()],
    ["Lost deals", lost.toString()],
    ["Follow-ups completed", "16"],
    ["Best category", "Corporate gifting"]
  ];

  return (
    <Panel id="reports">
      <SectionHeading
        eyebrow="Reports"
        title="Monthly growth report"
        description="A simple executive view of lead generation, quoting, wins, losses, content categories, follow-up progress, and recommended next action."
      />
      <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="h-80 rounded-lg border border-white/10 bg-obsidian/60 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyPerformance}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="month" stroke="#b8bfcc" tickLine={false} axisLine={false} />
              <YAxis stroke="#b8bfcc" tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: "#11131a",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 8,
                  color: "#fff"
                }}
              />
              <Bar dataKey="leads" fill="#ff8a1f" radius={[6, 6, 0, 0]} />
              <Bar dataKey="quotes" fill="#f6c453" radius={[6, 6, 0, 0]} />
              <Bar dataKey="won" fill="#f7e7c4" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {stats.map(([label, value]) => (
              <div key={label} className="rounded-lg border border-white/10 bg-obsidian/60 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-mercury">{label}</p>
                <p className="mt-3 text-2xl font-black text-white">{value}</p>
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-aurum/20 bg-aurum/10 p-4">
            <p className="font-black text-white">Next recommendations</p>
            <p className="mt-2 text-sm leading-6 text-slate-200">
              Increase launch-merch content, close today&apos;s quote follow-ups, and create a
              referral request for recent won customers.
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-obsidian/60 p-4">
            <p className="mb-3 text-sm font-black text-white">Best-performing content categories</p>
            <div className="space-y-3">
              {contentCategories.map((category) => (
                <div key={category.name}>
                  <div className="mb-1 flex justify-between text-xs text-mercury">
                    <span>{category.name}</span>
                    <span>{category.value}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10">
                    <div
                      className="h-2 rounded-full bg-aurum"
                      style={{ width: `${category.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}
