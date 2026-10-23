/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CivicReport, ScanApiResponse } from '../types/realityScanner.ts';

export const api = {
  async scanImage(payload: {
    imageBase64?: string;
    deviceGps?: { latitude: number; longitude: number; accuracy?: number };
    deviceTimestamp?: string;
    heading?: number;
    exifGps?: { latitude: number; longitude: number } | null;
    exifTimestamp?: string | null;
    isScreenshotCandidate?: boolean;
    demoScenarioId?: string;
    address?: string;
    landmark?: string;
  }): Promise<ScanApiResponse> {
    const res = await fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async getAllReports(filters?: {
    status?: string;
    issue_type?: string;
    severity_level?: string;
  }): Promise<{ reports: CivicReport[] }> {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.issue_type) params.set('issue_type', filters.issue_type);
    if (filters?.severity_level) params.set('severity_level', filters.severity_level);

    const res = await fetch(`/api/reports?${params.toString()}`);
    return res.json();
  },

  async getReportById(id: string): Promise<{ report: CivicReport }> {
    const res = await fetch(`/api/reports/${id}`);
    return res.json();
  },

  async submitReport(report: CivicReport): Promise<{ success: boolean; report: CivicReport }> {
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report),
    });
    return res.json();
  },

  async upvoteReport(
    id: string,
    evidence?: { photo_url: string; photo_hash: string; note?: string }
  ): Promise<{ success: boolean; report: CivicReport }> {
    const res = await fetch(`/api/reports/${id}/upvote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(evidence || {}),
    });
    return res.json();
  },

  async mergeReport(
    parentId: string,
    duplicateReport: CivicReport
  ): Promise<{ success: boolean; parentReport: CivicReport }> {
    const res = await fetch(`/api/reports/${parentId}/merge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ duplicateReport }),
    });
    return res.json();
  },

  async getAuthorityDashboard(): Promise<{
    stats: any;
    activeQueue: CivicReport[];
    resolvedList: CivicReport[];
  }> {
    const res = await fetch('/api/authority/dashboard');
    return res.json();
  },

  async resolveReport(payload: {
    reportId: string;
    resolutionPhotoBase64?: string;
    resolutionNotes?: string;
  }): Promise<{ success: boolean; report: CivicReport; aiAudit: any }> {
    const res = await fetch('/api/authority/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async resetSeedData(): Promise<{ success: boolean; count: number }> {
    const res = await fetch('/api/reports/admin/reset', { method: 'POST' });
    return res.json();
  },

  async getDemoScenarios(): Promise<{ scenarios: any[] }> {
    const res = await fetch('/api/demo/scenarios');
    return res.json();
  },
};
