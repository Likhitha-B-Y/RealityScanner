/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GitCompare, ThumbsUp, ArrowRight, CheckCircle2, MapPin } from 'lucide-react';
import { DuplicateCandidate } from '../../types/realityScanner.ts';

interface DuplicateMergeModalProps {
  candidates: DuplicateCandidate[];
  onUpvoteAndMerge: (candidate: DuplicateCandidate) => void;
  onProceedNew: () => void;
}

export const DuplicateMergeModal: React.FC<DuplicateMergeModalProps> = ({
  candidates,
  onUpvoteAndMerge,
  onProceedNew,
}) => {
  if (!candidates || candidates.length === 0) return null;

  const topMatch = candidates[0];
  const probPct = Math.round(topMatch.duplicate_probability * 100);

  return (
    <div className="w-full card-surface-elevated overflow-hidden fade-in-up">
      <div className="relative px-6 pt-6 pb-4">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent" />
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-400/40 flex items-center justify-center shadow-[0_40px_80px_-60px_rgba(168,85,247,0.9)]">
              <GitCompare className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <p className="text-[11px] font-mono uppercase tracking-[0.4em] text-purple-300">Stage C · Duplicate Moat</p>
              <h3 className="text-lg sm:text-xl font-semibold text-white tracking-tight mt-1">Nearby ticket match found</h3>
            </div>
          </div>
          <span className="px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-400/40 text-purple-200 font-mono text-[11px] font-semibold">
            {probPct}% match probability
          </span>
        </div>
      </div>

      <div className="px-6">
        <p className="text-sm text-slate-300 leading-relaxed">
          Multi-signal fusion detected an existing municipal ticket for this exact defect{' '}
          <span className="font-semibold text-white">{topMatch.distance_meters} meters</span> away.
        </p>

        {/* Matched Ticket Card */}
        <div className="mt-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-[0.28em] text-slate-500">
                Existing ticket #{topMatch.matched_report.id}
              </span>
              <h4 className="text-lg font-semibold text-white mt-1 leading-snug">
                {topMatch.matched_report.title}
              </h4>
            </div>
            <div className="px-2.5 py-1 rounded-full bg-slate-900 text-[11px] font-mono uppercase tracking-[0.24em] text-amber-200 border border-amber-400/40">
              {topMatch.matched_report.severity_level} · {topMatch.matched_report.status}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-300" />
              {topMatch.distance_meters}m away
            </span>
            <span className="flex items-center gap-1.5">
              <ThumbsUp className="w-3.5 h-3.5 text-emerald-300" />
              {topMatch.matched_report.upvote_count} citizen reports
            </span>
          </div>

          {/* Multi-Signal Breakdown Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="rounded-xl bg-slate-900/80 border border-slate-800/80 px-3 py-2 text-center">
              <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-slate-500">Geospatial</p>
              <p className="mt-1 text-sm font-semibold text-cyan-300">
                {Math.round((1 - topMatch.distance_meters / 50) * 100)}%
              </p>
            </div>
            <div className="rounded-xl bg-slate-900/80 border border-slate-800/80 px-3 py-2 text-center">
              <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-slate-500">Visual embed</p>
              <p className="mt-1 text-sm font-semibold text-purple-300">
                {Math.round(topMatch.visual_similarity * 100)}%
              </p>
            </div>
            <div className="rounded-xl bg-slate-900/80 border border-slate-800/80 px-3 py-2 text-center">
              <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-slate-500">Semantic</p>
              <p className="mt-1 text-sm font-semibold text-emerald-300">
                {Math.round(topMatch.semantic_similarity * 100)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Decision CTAs */}
      <div className="p-6 pt-4 flex flex-col sm:flex-row gap-2">
        <button
          onClick={() => onUpvoteAndMerge(topMatch)}
          className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-[0_60px_120px_-80px_rgba(168,85,247,0.9)] transition-all hover:brightness-110 active:scale-[0.99]"
        >
          <ThumbsUp className="w-4 h-4" />
          <span>Add your evidence & upvote ticket</span>
        </button>

        <button
          onClick={onProceedNew}
          className="py-3 px-5 rounded-2xl bg-slate-950/70 text-slate-200 text-sm font-medium flex items-center justify-center gap-2 transition-all hover:text-white border border-slate-800/80 hover:border-cyan-400/40"
        >
          <span>File distinct ticket</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default DuplicateMergeModal;