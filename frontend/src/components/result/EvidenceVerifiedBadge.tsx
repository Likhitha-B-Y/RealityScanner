/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, Hash, Check } from 'lucide-react';
import { EvidenceAudit } from '../../types/realityScanner.ts';

interface EvidenceVerifiedBadgeProps {
  audit?: EvidenceAudit;
}

export const EvidenceVerifiedBadge: React.FC<EvidenceVerifiedBadgeProps> = ({ audit }) => {
  if (!audit) return null;

  return (
    <div className="w-full card-surface-elevated overflow-hidden fade-in-up">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-100">Evidence Integrity Verified</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400 font-mono">
            <span className="flex items-center gap-0.5">
              <Hash className="w-3 h-3 text-emerald-400" />
              SHA-256: {audit.photo_hash.slice(0, 10)}...
            </span>
            <span>·</span>
            <span className="flex items-center gap-0.5 text-emerald-300">
              <Check className="w-3 h-3" /> GPS Stamped
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
