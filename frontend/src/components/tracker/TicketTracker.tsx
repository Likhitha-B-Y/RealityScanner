/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Clock, ThumbsUp, CheckCircle2, Share2, MapPin, Building, ShieldCheck, Check } from 'lucide-react';
import { CivicReport } from '../../types/realityScanner.ts';
import { BeforeAfterSlider } from './BeforeAfterSlider.tsx';

interface TicketTrackerProps {
  report: CivicReport;
  onUpvote: (id: string) => void;
}

export const TicketTracker: React.FC<TicketTrackerProps> = ({ report, onUpvote }) => {
  const [upvoted, setUpvoted] = useState(false);
  const [shared, setShared] = useState(false);

  const handleUpvote = () => {
    if (!upvoted) {
      onUpvote(report.id);
      setUpvoted(true);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Reality Scanner Ticket #${report.id}`,
        text: `Citizen grievance tracked: ${report.title} (${report.address})`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  // Calculate SLA countdown
  const now = new Date().getTime();
  const deadline = new Date(report.sla_deadline).getTime();
  const diffMs = deadline - now;
  const isOverdue = diffMs < 0 && report.status !== 'resolved';
  const hoursRemaining = Math.max(0, Math.floor(Math.abs(diffMs) / (1000 * 60 * 60)));
  const minutesRemaining = Math.max(0, Math.floor((Math.abs(diffMs) % (1000 * 60 * 60)) / (1000 * 60)));

  const STEPS: Array<{ id: string; label: string }> = [
    { id: 'submitted', label: '1. Scanned & Logged' },
    { id: 'triaged', label: '2. Triaged & Verified' },
    { id: 'in_progress', label: '3. Team Dispatched' },
    { id: 'resolved', label: '4. Fixed & Verified' },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'submitted':
        return 0;
      case 'triaged':
        return 1;
      case 'in_progress':
        return 2;
      case 'resolved':
        return 3;
      case 'escalated':
        return 2;
      default:
        return 0;
    }
  };

  const currentStep = getStepIndex(report.status);

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-5">
      {/* Ticket Header & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase">
              Official Grievance Ticket
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-xs text-slate-400 font-mono">#{report.id}</span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1 tracking-tight">{report.title}</h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>{report.address}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Share Ticket"
          >
            {shared ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>
          <button
            onClick={handleUpvote}
            disabled={upvoted}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              upvoted
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md active:scale-95'
            }`}
          >
            <ThumbsUp className="w-4 h-4" />
            <span>{report.upvote_count} Citizens</span>
          </button>
        </div>
      </div>

      {/* SLA Countdown Timer */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              report.status === 'resolved'
                ? 'bg-emerald-500/10 text-emerald-400'
                : isOverdue
                ? 'bg-red-500/10 text-red-400'
                : 'bg-cyan-500/10 text-cyan-400'
            }`}
          >
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-400 block">
              {report.status === 'resolved'
                ? 'Resolved in Record Time'
                : isOverdue
                ? 'SLA Escalation Alert'
                : 'Enforced SLA Clock'}
            </span>
            <span className="text-sm font-bold text-white font-mono">
              {report.status === 'resolved'
                ? 'Remediated & Verified'
                : isOverdue
                ? `${hoursRemaining}h ${minutesRemaining}m Past SLA (Auto-Escalated)`
                : `${hoursRemaining}h ${minutesRemaining}m Remaining`}
            </span>
          </div>
        </div>

        <div className="text-right font-mono text-xs">
          <span className="text-slate-500 block text-[10px]">TIER</span>
          <span className="text-amber-400 font-bold">{report.severity_level} (Score {report.severity_score})</span>
        </div>
      </div>

      {/* 4-Step Visual Progress Bar */}
      <div>
        <div className="grid grid-cols-4 gap-2">
          {STEPS.map((s, idx) => {
            const isDone = currentStep >= idx;
            const isCurrent = currentStep === idx;
            return (
              <div key={s.id} className="text-center">
                <div
                  className={`h-1.5 rounded-full mb-2 transition-all ${
                    isDone ? 'bg-cyan-400' : 'bg-slate-800'
                  }`}
                />
                <span
                  className={`text-[10px] block font-medium ${
                    isCurrent
                      ? 'text-cyan-400 font-bold'
                      : isDone
                      ? 'text-slate-300'
                      : 'text-slate-600'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Before / After Resolution Photo Slider (Stage G) */}
      {report.status === 'resolved' && report.resolution_photo_url ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="font-semibold flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              Stage G: AI Verified Remediation
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Drag slider to inspect fix quality
            </span>
          </div>
          <BeforeAfterSlider
            beforeUrl={report.photo_url}
            afterUrl={report.resolution_photo_url}
          />
          {report.resolution_notes && (
            <p className="text-xs text-slate-400 italic bg-slate-950 p-3 rounded-xl border border-slate-800/80">
              "{report.resolution_notes}"
            </p>
          )}
        </div>
      ) : (
        /* Original Photo Preview */
        <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-slate-800">
          <img
            src={report.photo_url}
            alt={report.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[10px] font-mono text-slate-300 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cryptographic SHA-256 Verified On-Site</span>
          </div>
        </div>
      )}

      {/* Assigned Authority */}
      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <Building className="w-4 h-4 text-cyan-400" />
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Dispatched Authority</span>
            <span className="text-slate-200 font-medium">{report.department_name}</span>
          </div>
        </div>
        <span className="text-[11px] font-mono text-slate-400">{report.ward_id}</span>
      </div>
    </div>
  );
};
