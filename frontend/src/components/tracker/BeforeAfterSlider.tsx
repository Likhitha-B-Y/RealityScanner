/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';

interface BeforeAfterSliderProps {
  beforeUrl: string;
  afterUrl: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({ beforeUrl, afterUrl }) => {
  const [sliderPos, setSliderPos] = useState(50);

  return (
    <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden select-none border border-slate-800 shadow-lg">
      {/* After image (Background) */}
      <img
        src={afterUrl}
        alt="Remediated after photo"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-mono text-emerald-300 z-10">
        AFTER (RESOLVED)
      </div>

      {/* Before image (Foreground, clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderPos}%` }}
      >
        <img
          src={beforeUrl}
          alt="Original reported issue before"
          className="absolute inset-0 w-full h-full object-cover max-w-none"
          style={{ width: '100%', height: '100%' }}
        />
        <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-amber-950/80 border border-amber-500/40 text-[10px] font-mono text-amber-300 z-10">
          BEFORE (REPORTED)
        </div>
      </div>

      {/* Drag Divider Line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-xl z-20 pointer-events-none"
        style={{ left: `${sliderPos}%` }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center text-[10px] text-white shadow-md">
          ↔
        </div>
      </div>

      {/* Slider Range Input */}
      <input
        type="range"
        min={0}
        max={100}
        value={sliderPos}
        onChange={(e) => setSliderPos(Number(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
        aria-label="Before after resolution photo comparison slider"
      />
    </div>
  );
};
