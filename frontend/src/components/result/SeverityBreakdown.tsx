/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Clock, ShieldAlert } from 'lucide-react';
import { PriorityLevel, SeverityCalculation } from '../../types/realityScanner.ts';

interface SeverityBreakdownProps {
  severity: SeverityCalculation;
}

export const SeverityBreakdown: React.FC<SeverityBreakdownProps> = ({ severity }) => {
  const getBadgeStyle = (level: PriorityLevel) => {
    switch (level) {
      case 'P1':
        return {
          bg: 'bg-red-500/15 border-red-500/40 text-red-400',
          title: 'Emergency Response',
          accent: 'bg-red-500',
        };
      case 'P2':
        return {
          bg: 'bg-amber-500/15 border-amber-500/40 text-amber-400',
          title: 'High Priority',
          accent: 'bg-amber-500',
        };
      case 'P3':
        return {
          bg: 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400',
          title: 'Standard Repair',
          accent: 'bg-cyan-500',
        };
      default:
        return {
          bg: 'bg-slate-500/15 border-slate-500/40 text-slate-400',
          title: 'Scheduled Work',
          accent: 'bg-slate-500',
        };
    }
  };

  const badge = getBadgeStyle(severity.level);
  const bd = severity.breakdown;

  const factors = [
    { label: 'Hazard to Life', weight: '35%', score: bd.hazard_to_life, max: 5 },
    { label: 'Commuter / Footfall', weight: '25%', score: bd.affected_footfall_or_traffic, max: 5 },
    { label: 'Defect Size & Extent', weight: '20%', score: bd.size_or_extent, max: 5 },
    { label: 'Weather Escalation', weight: '10%', score: bd.weather_escalation_risk, max: 5 },
    { label: 'Recurrence / Duplicates', weight: '10%', score: bd.duration_recurrence || 1.0, max: 5 },
  ];

  return (
    <div className="w-full card-surface-elevated overflow-hidden fade-in-up">
      {/* SLA Badge & Score Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-200">Severity Engine (Explainable Rubric)</span>
        </div>
        <div className={`px-2.5 py-1 rounded-full border text-xs font-mono font-bold ${badge.bg}`}>
          {severity.level} · {badge.title}
        </div>
      </div>

      {/* Main Score Hero */}
      <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-slate-700/50">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-white tracking-tight font-mono">
              {severity.score.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400 font-mono">/ 5.00</span>
          </div>
          <p className="text-[11px] text-slate-300 mt-1 max-w-xs">{severity.explanation}</p>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Enforced SLA</span>
          <div className="flex items-center gap-1.5 text-base font-bold text-cyan-400 font-mono mt-0.5">
            <Clock className="w-4 h-4" />
            <span>{severity.sla_hours}h</span>
          </div>
        </div>
      </div>

      {/* Transparent Breakdown Bars */}
      <div className="mt-6 space-y-3">
        <div className="flex justify-between text-[11px] font-mono uppercase tracking-[0.4em] text-slate-500">
          <span>Factor weighting</span>
          <span>Score (0-5)</span>
        </div>

        {factors.map((f, i) => {
          const pct = Math.min(100, (f.score / f.max) * 100);
          return (
            <div key={i} className="text-sm">
              <div className="flex items-center justify-between text-sm text-slate-300 mb-1.5">
                <span className="flex items-center gap-2">
                  {f.label}
                  <span className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.3em]">({f.weight})</span>
                </span>
                <span className="font-mono tabular-nums text-slate-100">
                  {f.score.toFixed(1)} / 5.0
                </span>
              </div>
              <div className="w-full h-2 bg-slate-800/70 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-emerald-300 rounded-full transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
