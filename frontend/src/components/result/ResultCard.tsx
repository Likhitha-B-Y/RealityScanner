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
      <div className="w-full bg-slate-900 border border-amber-500/30 rounded-3xl p-5 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider">
              {!perception.is_civic_issue ? 'Non-Civic Content' : 'Image Retake Required'}
            </span>
            <h3 className="text-base font-semibold text-white mt-0.5">
              {perception.primary_title || 'Visual Assessment Inconclusive'}
            </h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              {refusalReason || perception.refusal_reason || 'Image lacked sufficient clarity to evaluate.'}
            </p>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onRetake}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium flex items-center justify-center gap-2 transition-colors border border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retake Photo
          </button>
        </div>
      </div>
    );
  }

  const confidencePct = Math.round(perception.confidence * 100);

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
      {/* Header with Type Tag and Confidence */}
      <div className="flex items-center justify-between text-xs text-slate-400 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Tag className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-medium text-slate-200 capitalize">
            {perception.issue_type.replace('_', ' ')}
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <span className="text-slate-400">Confidence</span>
          <span className="text-cyan-400 font-semibold">{confidencePct}%</span>
        </div>
      </div>

      {/* Main Title & Description */}
      <div className="mt-3">
        <h2 className="text-lg font-bold text-white tracking-tight leading-snug">
          {perception.primary_title}
        </h2>
        <p className="text-xs text-slate-300 mt-2 leading-relaxed">
          {perception.detailed_description}
        </p>
      </div>

      {/* Metric Dimensions Inference */}
      {perception.estimated_dimensions && (
        <div className="mt-3.5 flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/60 text-xs text-slate-300">
          <Ruler className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-slate-400 font-mono text-[11px]">Estimated Scale:</span>
          <span className="font-medium text-slate-200">{perception.estimated_dimensions}</span>
        </div>
      )}

      {/* Visible Hazards Tags */}
      {perception.visible_hazards && perception.visible_hazards.length > 0 && (
        <div className="mt-3.5">
          <span className="text-[11px] font-mono text-slate-400 block mb-1.5">
            Detected Danger Signals:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {perception.visible_hazards.map((hazard, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-[11px] text-red-300"
              >
                <AlertTriangle className="w-3 h-3 text-red-400 shrink-0" />
                {hazard}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
