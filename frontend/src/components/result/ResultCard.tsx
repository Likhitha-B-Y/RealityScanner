/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertTriangle, AlertCircle, RefreshCw, Ruler, Tag } from 'lucide-react';
import { VisionPerceptionResult } from '../../types/realityScanner.ts';

interface ResultCardProps {
  perception: VisionPerceptionResult;
  refused?: boolean;
  refusalReason?: string;
  onRetake: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  perception,
  refused,
  refusalReason,
  onRetake,
}) => {
  // If rejected or needs better photo
  if (refused || perception.needs_better_photo || !perception.is_civic_issue) {
    return (
      <div className="w-full card-surface-elevated overflow-hidden fade-in-up">
        <div className="relative px-6 pt-6 pb-5">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-400/40 flex items-center justify-center shrink-0 text-amber-300">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <span className="text-[11px] font-mono uppercase tracking-[0.4em] text-amber-300">
                {!perception.is_civic_issue ? 'Non-Civic Content' : 'Image Retake Required'}
              </span>
              <h3 className="text-lg sm:text-xl font-semibold text-white mt-2">
                {perception.primary_title || 'Visual Assessment Inconclusive'}
              </h3>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                {refusalReason || perception.refusal_reason || 'Image lacked sufficient clarity to evaluate. Please capture a clearer, well-lit photo.'}
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onRetake}
              className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:brightness-110"
            >
              <RefreshCw className="w-4 h-4" />
              Retake Photo
            </button>
          </div>
        </div>
      </div>
    );
  }

  const confidencePct = Math.round(perception.confidence * 100);

  return (
    <div className="w-full card-surface-elevated overflow-hidden fade-in-up">
      <div className="relative px-6 pt-6 pb-5">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
        {/* Header with Type Tag and Confidence */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/60 border border-slate-700/50">
            <Tag className="w-3.5 h-3.5 text-cyan-300" />
            <span className="font-medium text-slate-200 capitalize">
              {perception.issue_type.replace(/_/g, ' ')}
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/60 border border-slate-700/50 font-mono text-[11px]">
            <span className="text-slate-400 uppercase tracking-[0.3em]">Confidence</span>
            <span className="text-emerald-300 font-semibold">{confidencePct}%</span>
          </div>
        </div>

        {/* Main Title & Description */}
        <div className="mt-5">
          <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight leading-snug text-balance">
            {perception.primary_title}
          </h2>
          <p className="text-sm sm:text-base text-slate-300 mt-3 leading-relaxed">
            {perception.detailed_description}
          </p>
        </div>

        {/* Metric Dimensions Inference */}
        {perception.estimated_dimensions && (
          <div className="mt-5 flex items-center gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-700/50 text-sm text-slate-300">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400/20 to-emerald-400/10 border border-cyan-400/40 flex items-center justify-center shrink-0">
              <Ruler className="w-4 h-4 text-cyan-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-mono uppercase tracking-[0.4em] text-slate-500">Estimated Scale</span>
              <span className="font-medium text-slate-100 mt-0.5">{perception.estimated_dimensions}</span>
            </div>
          </div>
        )}

        {/* Visible Hazards Tags */}
        {perception.visible_hazards && perception.visible_hazards.length > 0 && (
          <div className="mt-5">
            <span className="text-[11px] font-mono uppercase tracking-[0.4em] text-slate-500 block mb-2">
              Detected Danger Signals
            </span>
            <div className="flex flex-wrap gap-2">
              {perception.visible_hazards.map((hazard, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-400/40 text-xs text-rose-200"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-300 shrink-0" />
                  {hazard}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
