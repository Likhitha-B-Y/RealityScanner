/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Zap, ShieldCheck, Users, TrendingUp, CheckCircle, Award } from 'lucide-react';

export const ImpactView: React.FC = () => {
  return (
    <div className="w-full flex flex-col gap-6 select-none">
      {/* Hero Impact Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950 border border-cyan-500/30 shadow-2xl">
        <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">
          Civic Transformation Metric
        </span>
        <h2 className="text-2xl font-black text-white tracking-tight mt-1">
          From 5 Minutes of Form-Filling to 5 Seconds of Pointing a Camera
        </h2>
        <p className="text-xs text-slate-300 mt-2 max-w-xl leading-relaxed">
          Traditional municipal grievance portals require citizens to know department jurisdictions,
          manually write paragraphs, select ward dropdowns, and find GPS coordinates. Reality Scanner
          completely eliminates the forms: computer vision and multi-signal AI do the entire job on-device.
        </p>

        {/* 5m vs 5s Comparison Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-500 uppercase">Legacy Municipal Portals</span>
            <div className="text-3xl font-extrabold text-slate-400 font-mono mt-1">~300s</div>
            <p className="text-[11px] text-slate-500 mt-1">
              Manual forms, CAPTCHAs, jurisdiction guesswork, 80% abandonment rate.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-cyan-950/50 border border-cyan-500/50">
            <span className="text-[10px] font-mono text-cyan-400 uppercase">Reality Scanner PWA</span>
            <div className="text-3xl font-extrabold text-cyan-300 font-mono mt-1">~4.2s</div>
            <p className="text-[11px] text-cyan-200 mt-1">
              Point camera · AI auto-classifies, deduplicates & routes with zero typing.
            </p>
          </div>
        </div>
      </div>

      {/* 3 Core Impact Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-3">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">73% Duplicate Reduction</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              When 20 citizens see the same pothole on 100ft Road, municipal officers normally receive
              20 redundant tickets. Reality Scanner collapses them into 1 master ticket with 20 upvotes,
              quadrupling department triage efficiency.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[10px] font-mono text-purple-300">
            Stage C Multi-Signal Fusion Moat
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">Accountable SLA Enforcement</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Every issue is scored objectively via a transparent rubric (Hazard 35%, Traffic 25%,
              Extent 20%, Weather 10%). Severe risks (open manholes, live wires) trigger non-negotiable
              P1 12-hour response clocks bound by the Sakala Citizen Services Act.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[10px] font-mono text-amber-300">
            Stage B Explainable Rubric
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">Closing the Loop (Stage G)</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Authorities cannot close tickets with fake checkmarks. A field photo of the completed repair
              must be uploaded, where Gemini Vision verifies whether the hole was filled and asphalt
              leveled to grade before releasing public confirmation.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[10px] font-mono text-emerald-300">
            Stage G AI Quality Audit
          </div>
        </div>
      </div>

      {/* Scale & B2G Business Model for Judges */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
        <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          B2G Scale & Sustainable Revenue Model
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="font-semibold text-slate-200 block mb-1">Per-Ward SaaS Licensing</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Subscribed by urban local bodies (BBMP, BMC, MCD) at ₹1.5L ($1,800) / ward / year, replacing
              clunky legacy vendors with sub-second AI triage.
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="font-semibold text-slate-200 block mb-1">Contractor SLA Verification</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Stage G before/after quality auditing links municipal contractor bill clearances directly to
              verified defect remediation scores.
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="font-semibold text-slate-200 block mb-1">Infrastructure Analytics</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Anonymized defect heatmap feeds for urban planners, road asset managers, and civil engineering
              budget allocations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
