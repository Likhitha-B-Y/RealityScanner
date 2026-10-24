/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  Camera,
  Map as MapIcon,
  Clock,
  Building,
  BarChart3,
  WifiOff,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { CameraView } from './components/scanner/CameraView.tsx';
import { ScanProgressOverlay } from './components/scanner/ScanProgressOverlay.tsx';
import { DemoSelectorSheet } from './components/scanner/DemoSelectorSheet.tsx';
import { ResultCard } from './components/result/ResultCard.tsx';
import { SeverityBreakdown } from './components/result/SeverityBreakdown.tsx';
import { DuplicateMergeModal } from './components/result/DuplicateMergeModal.tsx';
import { EvidenceVerifiedBadge } from './components/result/EvidenceVerifiedBadge.tsx';
import { ComplaintPreview } from './components/complaint/ComplaintPreview.tsx';
import { TicketTracker } from './components/tracker/TicketTracker.tsx';
import { PublicCityMap } from './components/map/PublicCityMap.tsx';
import { AuthorityDashboard } from './components/authority/AuthorityDashboard.tsx';
import { ImpactView } from './components/impact/ImpactView.tsx';
import { api } from './services/api.ts';
import { offlineStore } from './services/offlineStore.ts';
import { CivicReport, DuplicateCandidate, ScanApiResponse } from './types/realityScanner.ts';

type NavigationTab = 'scan' | 'map' | 'tracker' | 'authority' | 'impact';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('scan');
  const [isDemoSheetOpen, setIsDemoSheetOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Scan state flow
  const [scanResult, setScanResult] = useState<ScanApiResponse | null>(null);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string>('');
  const [activeTrackedReport, setActiveTrackedReport] = useState<CivicReport | null>(null);

  // Ward reports for map & tracker
  const [allReports, setAllReports] = useState<CivicReport[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Track online/offline status
  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      // Auto-sync pending reports from IndexedDB
      const pending = await offlineStore.getPendingReports();
      for (const p of pending) {
        try {
          await api.submitReport(p);
          await offlineStore.removePendingReport(p.id);
        } catch (e) {
          console.warn('Sync failed for report', p.id);
        }
      }
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial load of reports
    api.getAllReports().then((data) => {
      if (data?.reports) {
        setAllReports(data.reports);
      }
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle camera capture or demo selection
  const handleCapture = async (payload: {
    imageBase64: string;
    deviceGps: { latitude: number; longitude: number; accuracy: number };
    heading: number;
    deviceTimestamp: string;
    exifGps?: { latitude: number; longitude: number } | null;
    exifTimestamp?: string | null;
    isScreenshot?: boolean;
    demoScenarioId?: string;
  }) => {
    setIsScanning(true);
    setCapturedPhotoUrl(payload.imageBase64);

    try {
      const response = await api.scanImage(payload);
      setScanResult(response);
    } catch (err) {
      console.error('Scan error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  // One-tap trigger of a curated demo scenario
  const handleSelectDemoScenario = (scenarioId: string) => {
    handleCapture({
      imageBase64: '',
      deviceGps: { latitude: 12.9784, longitude: 77.6408, accuracy: 3 },
      heading: 90,
      deviceTimestamp: new Date().toISOString(),
      demoScenarioId: scenarioId,
    });
  };

  // Reset to scanner view
  const handleRetake = () => {
    setScanResult(null);
    setCapturedPhotoUrl('');
  };

  // Handle final submission of ticket to municipal portal
  const handleSubmitTicket = async () => {
    if (!scanResult || !scanResult.perception || !scanResult.severity) return;
    setIsSubmitting(true);

    const newTicket: CivicReport = {
      id: scanResult.draftId || `REP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      issue_type: scanResult.perception.issue_type,
      title: scanResult.perception.primary_title,
      description: scanResult.perception.detailed_description,
      status: 'submitted',
      latitude: scanResult.metadata?.latitude || 12.9784,
      longitude: scanResult.metadata?.longitude || 77.6408,
      heading: scanResult.metadata?.heading || 90,
      address: scanResult.metadata?.address || '100 Feet Road, Indiranagar',
      landmark: scanResult.metadata?.landmark || 'Ward 112 Commercial Corridor',
      ward_id: 'Ward 112 (Indiranagar)',
      severity_level: scanResult.severity.level,
      severity_score: scanResult.severity.score,
      severity_breakdown: scanResult.severity.breakdown,
      sla_hours: scanResult.severity.sla_hours,
      sla_deadline: scanResult.metadata?.sla_deadline || new Date().toISOString(),
      department_id: scanResult.routing?.department_name || 'BBMP_ROADS',
      department_name: scanResult.routing?.department_name || 'BBMP Infrastructure',
      routed_endpoint: scanResult.routing?.portal_endpoint || 'https://bbmp.gov.in',
      photo_url: capturedPhotoUrl || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="%230f172a"/><text x="200" y="150" fill="%23f8fafc" text-anchor="middle">VERIFIED EVIDENCE</text></svg>',
      photo_hash: scanResult.integrity_audit?.photo_hash || 'hash_default',
      evidence_verified: scanResult.integrity_audit?.integrity_passed ?? true,
      evidence_verification_flags: scanResult.integrity_audit?.verification_flags || ['verified'],
      upvote_count: 1,
      duplicate_count: 0,
      complaints: scanResult.complaints,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (!isOnline) {
      // Save to offline queue
      await offlineStore.savePendingReport(newTicket);
      setActiveTrackedReport(newTicket);
      setScanResult(null);
      setActiveTab('tracker');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await api.submitReport(newTicket);
      setActiveTrackedReport(res.report);
      setScanResult(null);
      setActiveTab('tracker');

      // Refresh list
      api.getAllReports().then((data) => {
        if (data?.reports) setAllReports(data.reports);
      });
    } catch (e) {
      console.error('Failed to submit report', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle merging duplicate report into existing parent ticket
  const handleUpvoteAndMerge = async (candidate: DuplicateCandidate) => {
    try {
      const res = await api.upvoteReport(candidate.matched_report.id, {
        photo_url: capturedPhotoUrl,
        photo_hash: scanResult?.integrity_audit?.photo_hash || 'hash_merge',
        note: 'Citizen additional visual evidence added via Reality Scanner',
      });
      setActiveTrackedReport(res.report);
      setScanResult(null);
      setActiveTab('tracker');

      api.getAllReports().then((data) => {
        if (data?.reports) setAllReports(data.reports);
      });
    } catch (e) {
      console.error('Failed to merge duplicate', e);
    }
  };

  const handleProceedAsNew = () => {
    // Keep current scan result as a distinct ticket flow
    // User can still submit via ComplaintPreview
  };

  // Upvote an existing report from tracker
  const handleUpvoteReport = async (id: string) => {
    const res = await api.upvoteReport(id);
    if (res?.report) {
      setActiveTrackedReport(res.report);
    }
  };

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans selection:bg-cyan-400/80 selection:text-slate-950">
      {/* Offline Alert Banner */}
      {!isOnline && (
        <div className="w-full bg-amber-500/15 border-b border-amber-400/40 px-4 py-2 text-center text-xs text-amber-200 font-mono flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4" />
          <span>Offline mode · Reports will queue and sync automatically when connection returns</span>
        </div>
      )}

      {/* Premium Top Bar */}
      <header className="sticky top-0 z-40 w-full glass-panel border-x-0 border-t-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-6">
          <button
            onClick={() => {
              setActiveTab('scan');
              setScanResult(null);
            }}
            className="flex items-center gap-2.5 group"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-300"></span>
            </span>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-tight text-white">Reality Scanner</span>
              <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-slate-500">Civic Intelligence</span>
            </div>
          </button>

          <nav className="hidden lg:flex items-center gap-1 rounded-full bg-slate-950/60 border border-slate-800/80 p-1">
            {[
              { id: 'scan' as NavigationTab, label: 'Report Issue' },
              { id: 'map' as NavigationTab, label: 'Ward Map' },
              { id: 'tracker' as NavigationTab, label: 'Ticket Tracker' },
              { id: 'authority' as NavigationTab, label: 'Authority' },
              { id: 'impact' as NavigationTab, label: 'Impact' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (item.id === 'scan') setScanResult(null);
                  if (item.id === 'tracker' && !activeTrackedReport && allReports.length > 0) {
                    setActiveTrackedReport(allReports[0]);
                  }
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-cyan-400/90 to-emerald-400/90 text-slate-950 shadow-[0_30px_60px_-40px_rgba(34,211,238,0.9)]'
                    : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDemoSheetOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-950/70 text-cyan-200 border border-cyan-400/40 text-xs font-medium transition-all hover:border-cyan-300/70 hover:text-white pill-glow"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Judge Demo Fixtures</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('scan');
                setScanResult(null);
              }}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 text-xs font-semibold transition-all hover:brightness-110"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Report an Issue</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-28 lg:pb-12 flex flex-col items-center">
        {/* Progressive Scan Loading Overlay */}
        {isScanning && <ScanProgressOverlay />}

        {/* 1. CAMERA / SCAN TAB */}
        {activeTab === 'scan' && (
          <div className="w-full max-w-3xl flex flex-col items-center gap-6">
            {!scanResult ? (
              /* Live Camera Capture */
              <div className="w-full flex flex-col items-center gap-6">
                <div className="w-full text-center space-y-3">
                  <p className="text-[11px] font-mono uppercase tracking-[0.5em] text-cyan-300">Instant civic reporting</p>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white text-balance">
                    Point, capture, and report in seconds
                  </h1>
                  <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto text-balance">
                    AI classifies the issue, scores severity, checks for duplicates, and drafts a multilingual complaint with zero forms.
                  </p>
                </div>
                <CameraView
                  onCapture={handleCapture}
                  onOpenDemoSelector={() => setIsDemoSheetOpen(true)}
                  isScanning={isScanning}
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
                  {[
                    { title: 'Explainable AI', desc: 'Transparent severity rubric with SLA mapping' },
                    { title: 'Duplicate moat', desc: 'Geospatial + visual + semantic fusion' },
                    { title: 'Closing the loop', desc: 'Before/after verification for real fixes' },
                  ].map((item) => (
                    <div key={item.title} className="card-surface p-4 flex flex-col gap-1">
                      <p className="text-sm font-medium text-white">{item.title}</p>
                      <p className="text-xs text-slate-400">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Scan Result + Severity + Duplicate + Complaint Workflow */
              <div className="w-full flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center justify-between">
                  <button
                    onClick={handleRetake}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Camera</span>
                  </button>

                  <span className="text-[11px] font-mono text-cyan-400">
                    Draft Ticket #{scanResult.draftId || 'NEW'}
                  </span>
                </div>

                {/* Stage A Result */}
                {scanResult.perception && (
                  <ResultCard
                    perception={scanResult.perception}
                    refused={scanResult.refused}
                    refusalReason={scanResult.refusal_reason}
                    onRetake={handleRetake}
                  />
                )}

                {/* Evidence Integrity Audit Badge */}
                {scanResult.integrity_audit && (
                  <EvidenceVerifiedBadge audit={scanResult.integrity_audit} />
                )}

                {/* If Not Refused: Proceed to Severity + Duplicates + Complaint */}
                {!scanResult.refused && scanResult.severity && (
                  <>
                    {/* Stage B Explainable Severity Breakdown */}
                    <SeverityBreakdown severity={scanResult.severity} />

                    {/* Stage C Multi-Signal Duplicate Match Warning (if found) */}
                    {scanResult.duplicates && scanResult.duplicates.length > 0 && (
                      <DuplicateMergeModal
                        candidates={scanResult.duplicates}
                        onUpvoteAndMerge={handleUpvoteAndMerge}
                        onProceedNew={handleProceedAsNew}
                      />
                    )}

                    {/* Stage E Multilingual Complaint Preview */}
                    {scanResult.complaints && (
                      <ComplaintPreview
                        complaints={scanResult.complaints}
                        onSubmit={handleSubmitTicket}
                        isSubmitting={isSubmitting}
                      />
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* 2. WARD MAP TAB */}
        {activeTab === 'map' && (
          <div className="w-full">
            <PublicCityMap
              reports={allReports}
              onSelectReport={(r) => {
                setActiveTrackedReport(r);
                setActiveTab('tracker');
              }}
            />
          </div>
        )}

        {/* 3. TICKET TRACKER TAB */}
        {activeTab === 'tracker' && (
          <div className="w-full max-w-xl">
            {activeTrackedReport ? (
              <TicketTracker
                report={activeTrackedReport}
                onUpvote={handleUpvoteReport}
              />
            ) : (
              <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-3xl">
                <Clock className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                <h3 className="text-base font-semibold text-white">No Active Ticket Selected</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Scan a civic defect to file a new report or pick any active issue from the ward map.
                </p>
                <button
                  onClick={() => setActiveTab('scan')}
                  className="mt-4 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                >
                  Open Scanner
                </button>
              </div>
            )}
          </div>
        )}

        {/* 4. CIVIC AUTHORITY COMMAND CENTER */}
        {activeTab === 'authority' && <AuthorityDashboard />}

        {/* 5. IMPACT & BUSINESS MODEL TAB */}
        {activeTab === 'impact' && <ImpactView />}
      </main>

      {/* Premium Mobile Tab Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass-panel border-x-0 border-b-0 px-2 py-1.5 flex items-center justify-around h-[72px]">
        {[
          { id: 'scan' as NavigationTab, label: 'Report', icon: Camera },
          { id: 'map' as NavigationTab, label: 'Map', icon: MapIcon },
          { id: 'tracker' as NavigationTab, label: 'Tracker', icon: Clock },
          { id: 'authority' as NavigationTab, label: 'Authority', icon: Building },
          { id: 'impact' as NavigationTab, label: 'Impact', icon: BarChart3 },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (item.id === 'scan') setScanResult(null);
                if (item.id === 'tracker' && !activeTrackedReport && allReports.length > 0) {
                  setActiveTrackedReport(allReports[0]);
                }
              }}
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] rounded-2xl px-2 transition-all ${
                activeTab === item.id
                  ? 'text-cyan-300'
                  : 'text-slate-500 hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium tracking-tight mt-1">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Demo Fixtures Bottom Sheet */}
      <DemoSelectorSheet
        isOpen={isDemoSheetOpen}
        onClose={() => setIsDemoSheetOpen(false)}
        onSelectScenario={handleSelectDemoScenario}
      />
    </div>
  );
}
