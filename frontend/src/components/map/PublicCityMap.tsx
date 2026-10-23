/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Filter, Layers, Navigation, ThumbsUp, AlertTriangle } from 'lucide-react';
import { CivicReport, IssueType } from '../../types/realityScanner.ts';

interface PublicCityMapProps {
  reports: CivicReport[];
  onSelectReport: (report: CivicReport) => void;
}

export const PublicCityMap: React.FC<PublicCityMapProps> = ({ reports, onSelectReport }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeReportPreview, setActiveReportPreview] = useState<CivicReport | null>(null);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Center on Indiranagar, Bangalore
    const map = L.map(mapContainerRef.current, {
      center: [12.9784, 77.6408],
      zoom: 14,
      zoomControl: false,
    });

    // Dark sleek CartoDB tile layer
    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 19,
      }
    ).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update map markers when reports or filters change
  useEffect(() => {
    if (!markersLayerRef.current || !mapInstanceRef.current) return;

    markersLayerRef.current.clearLayers();

    const filtered = reports.filter((r) => {
      if (selectedType !== 'all' && r.issue_type !== selectedType) return false;
      if (selectedStatus === 'active' && r.status === 'resolved') return false;
      if (selectedStatus === 'resolved' && r.status !== 'resolved') return false;
      return true;
    });

    filtered.forEach((report) => {
      const color =
        report.severity_level === 'P1'
          ? '#ef4444'
          : report.severity_level === 'P2'
          ? '#f59e0b'
          : report.severity_level === 'P3'
          ? '#06b6d4'
          : '#64748b';

      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="
            width: 24px;
            height: 24px;
            background-color: ${color};
            border: 2px solid #0f172a;
            border-radius: 50%;
            box-shadow: 0 0 12px ${color}80;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-size: 10px;
            font-weight: bold;
            font-family: monospace;
          ">
            ${report.severity_level}
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([report.latitude, report.longitude], {
        icon: customIcon,
      });

      marker.on('click', () => {
        setActiveReportPreview(report);
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [reports, selectedType, selectedStatus]);

  const categories: Array<{ id: string; label: string }> = [
    { id: 'all', label: 'All Issues' },
    { id: 'pothole', label: 'Potholes' },
    { id: 'open_manhole', label: 'Open Manholes' },
    { id: 'garbage_overflow', label: 'Sanitation' },
    { id: 'broken_streetlight', label: 'Lighting' },
    { id: 'waterlogging', label: 'Waterlogging' },
  ];

  return (
    <div className="relative w-full h-[calc(100vh-140px)] min-h-[500px] max-h-[820px] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
      {/* Floating Filter Bar */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex flex-col gap-2 pointer-events-auto">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 shadow-lg overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedType(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedType === cat.id
                  ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Status Toggle */}
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] ${
                selectedStatus === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400'
              }`}
            >
              All ({reports.length})
            </button>
            <button
              onClick={() => setSelectedStatus('active')}
              className={`px-2.5 py-1 rounded-lg text-[11px] ${
                selectedStatus === 'active' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setSelectedStatus('resolved')}
              className={`px-2.5 py-1 rounded-lg text-[11px] ${
                selectedStatus === 'resolved' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
              }`}
            >
              Resolved
            </button>
          </div>

          <div className="px-3 py-1 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-800 text-slate-300 text-[11px]">
            Ward 112 · 150+ Seeded Issues
          </div>
        </div>
      </div>

      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0 bg-slate-950" />

      {/* Selected Report Bottom Card */}
      {activeReportPreview && (
        <div className="absolute bottom-4 left-4 right-4 z-[400] max-w-md mx-auto bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-3xl p-4 shadow-2xl animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">
                  #{activeReportPreview.id}
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-[10px] font-mono uppercase text-amber-400 font-semibold">
                  {activeReportPreview.severity_level} (SLA: {activeReportPreview.sla_hours}h)
                </span>
              </div>
              <h4 className="text-sm font-bold text-white mt-1 leading-snug">
                {activeReportPreview.title}
              </h4>
              <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                {activeReportPreview.address}
              </p>
            </div>

            <button
              onClick={() => setActiveReportPreview(null)}
              className="text-slate-400 hover:text-white text-xs p-1"
            >
              ✕
            </button>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
              <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
              {activeReportPreview.upvote_count} citizen reports
            </span>

            <button
              onClick={() => onSelectReport(activeReportPreview)}
              className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors"
            >
              View Full Ticket
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
