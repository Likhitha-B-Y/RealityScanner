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
    <div className="w-full bg-slate-900 border border-purple-500/40 rounded-3xl p-5 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <GitCompare className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-semibold text-slate-100">
            Duplicate Moat Alert (Multi-Signal Match)
          </span>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[11px] font-semibold">
          {probPct}% Match Probability
        </span>
      </div>

      <p className="text-xs text-slate-300 mt-3 leading-relaxed">
        Our multi-signal perception engine detected an existing municipal ticket for this exact defect{' '}
        <span className="font-semibold text-white">{topMatch.distance_meters} meters</span> away.
      </p>

      {/* Matched Ticket Card */}
      <div className="mt-3.5 p-3.5 rounded-2xl bg-slate-800/80 border border-purple-500/30 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-[10px] font-mono text-purple-300 uppercase">
              Existing Ticket #{topMatch.matched_report.id}
            </span>
            <h4 className="text-sm font-bold text-white mt-0.5">
              {topMatch.matched_report.title}
            </h4>
          </div>
          <div className="px-2 py-1 rounded-lg bg-slate-900 text-[11px] font-mono text-amber-400 shrink-0">
            {topMatch.matched_report.severity_level} · {topMatch.matched_report.status}
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-cyan-400" />
            {topMatch.distance_meters}m away
          </span>
          <span className="flex items-center gap-1">
            <ThumbsUp className="w-3 h-3 text-emerald-400" />
            {topMatch.matched_report.upvote_count} citizens reported
          </span>
        </div>

        {/* Multi-Signal Breakdown Bar */}
        <div className="mt-1 pt-2 border-t border-slate-700/60 grid grid-cols-3 gap-2 text-center text-[10px] font-mono text-slate-400">
          <div>
            <span className="block text-slate-500">GEOSPATIAL</span>
            <span className="text-cyan-400 font-bold">
              {Math.round((1 - topMatch.distance_meters / 50) * 100)}%
            </span>
          </div>
          <div>
            <span className="block text-slate-500">VISUAL EMBED</span>
            <span className="text-purple-400 font-bold">
              {Math.round(topMatch.visual_similarity * 100)}%
            </span>
          </div>
          <div>
            <span className="block text-slate-500">SEMANTIC</span>
            <span className="text-emerald-400 font-bold">
              {Math.round(topMatch.semantic_similarity * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Decision CTAs */}
      <div className="mt-4 flex flex-col sm:flex-row gap-2">
        <button
          onClick={() => onUpvoteAndMerge(topMatch)}
          className="flex-1 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 active:scale-98 transition-transform"
        >
          <ThumbsUp className="w-4 h-4" />
          <span>Add Your Evidence & Upvote Ticket</span>
        </button>

        <button
          onClick={onProceedNew}
          className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
        >
          <span>File Distinct Ticket</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
