/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import { CivicReport, IssueType, PriorityLevel, ReportStatus } from '../types.ts';
import { SEED_REPORTS } from './seedData.ts';

const DB_FILE = path.resolve(process.cwd(), 'reports_db.json');

// Haversine formula for exact distance in meters between two lat/long points
export function calculateHaversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Radius of Earth in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

class Database {
  private reports: Map<string, CivicReport> = new Map();
  private initialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (this.initialized) return;

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const list: CivicReport[] = JSON.parse(raw);
        for (const item of list) {
          this.reports.set(item.id, item);
        }
      } catch (e) {
        console.error('Error loading reports_db.json, seeding defaults', e);
        this.seedDefaults();
      }
    } else {
      this.seedDefaults();
    }
    this.initialized = true;
  }

  private seedDefaults() {
    for (const r of SEED_REPORTS) {
      this.reports.set(r.id, r);
    }
    this.persist();
  }

  private persist() {
    try {
      const arr = Array.from(this.reports.values());
      fs.writeFileSync(DB_FILE, JSON.stringify(arr, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to persist database file', e);
    }
  }

  public resetToSeeds() {
    this.reports.clear();
    this.seedDefaults();
    return this.getAllReports();
  }

  public getAllReports(): CivicReport[] {
    return Array.from(this.reports.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  public getReportById(id: string): CivicReport | undefined {
    return this.reports.get(id);
  }

  public createReport(report: CivicReport): CivicReport {
    this.reports.set(report.id, report);
    this.persist();
    return report;
  }

  public updateReport(id: string, updates: Partial<CivicReport>): CivicReport | undefined {
    const existing = this.reports.get(id);
    if (!existing) return undefined;
    const updated: CivicReport = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.reports.set(id, updated);
    this.persist();
    return updated;
  }

  public upvoteReport(id: string, evidence?: { photo_url: string; photo_hash: string; note?: string }): CivicReport | undefined {
    const existing = this.reports.get(id);
    if (!existing) return undefined;

    const additional = existing.additional_evidence || [];
    if (evidence) {
      additional.push({
        id: `EVID-${Date.now()}`,
        photo_url: evidence.photo_url,
        photo_hash: evidence.photo_hash,
        timestamp: new Date().toISOString(),
        note: evidence.note,
      });
    }

    const updated: CivicReport = {
      ...existing,
      upvote_count: existing.upvote_count + 1,
      additional_evidence: additional,
      updated_at: new Date().toISOString(),
    };
    this.reports.set(id, updated);
    this.persist();
    return updated;
  }

  public mergeDuplicate(parentId: string, duplicateReport: CivicReport): CivicReport | undefined {
    const parent = this.reports.get(parentId);
    if (!parent) return undefined;

    const additional = parent.additional_evidence || [];
    additional.push({
      id: `MERGE-${Date.now()}`,
      photo_url: duplicateReport.photo_url,
      photo_hash: duplicateReport.photo_hash,
      timestamp: new Date().toISOString(),
      note: `Merged duplicate report: ${duplicateReport.title}`,
    });

    const updatedParent: CivicReport = {
      ...parent,
      duplicate_count: parent.duplicate_count + 1,
      upvote_count: parent.upvote_count + duplicateReport.upvote_count,
      additional_evidence: additional,
      updated_at: new Date().toISOString(),
    };
    this.reports.set(parentId, updatedParent);

    // Save duplicate as merged
    duplicateReport.parent_report_id = parentId;
    duplicateReport.status = 'triaged';
    this.reports.set(duplicateReport.id, duplicateReport);

    this.persist();
    return updatedParent;
  }

  public findNearbyReports(
    lat: number,
    lon: number,
    radiusMeters: number,
    issueType?: IssueType
  ): Array<{ report: CivicReport; distanceMeters: number }> {
    const results: Array<{ report: CivicReport; distanceMeters: number }> = [];

    for (const report of this.reports.values()) {
      // Exclude merged child reports from candidate list
      if (report.parent_report_id) continue;
      if (issueType && report.issue_type !== issueType) continue;

      const dist = calculateHaversineDistanceMeters(lat, lon, report.latitude, report.longitude);
      if (dist <= radiusMeters) {
        results.push({ report, distanceMeters: Math.round(dist) });
      }
    }

    return results.sort((a, b) => a.distanceMeters - b.distanceMeters);
  }

  public filterReports(filters: {
    status?: ReportStatus;
    issue_type?: IssueType;
    severity_level?: PriorityLevel;
    ward_id?: string;
  }): CivicReport[] {
    return this.getAllReports().filter((r) => {
      if (filters.status && r.status !== filters.status) return false;
      if (filters.issue_type && r.issue_type !== filters.issue_type) return false;
      if (filters.severity_level && r.severity_level !== filters.severity_level) return false;
      if (filters.ward_id && r.ward_id !== filters.ward_id) return false;
      return true;
    });
  }

  public getDashboardStats() {
    const all = this.getAllReports().filter((r) => !r.parent_report_id);
    const totalReports = all.length;
    const resolvedReports = all.filter((r) => r.status === 'resolved').length;
    const inProgressReports = all.filter((r) => r.status === 'in_progress').length;
    const submittedReports = all.filter((r) => r.status === 'submitted' || r.status === 'triaged').length;
    const escalatedReports = all.filter((r) => r.status === 'escalated').length;

    const p1Count = all.filter((r) => r.severity_level === 'P1').length;
    const p2Count = all.filter((r) => r.severity_level === 'P2').length;
    const p3Count = all.filter((r) => r.severity_level === 'P3').length;
    const p4Count = all.filter((r) => r.severity_level === 'P4').length;

    const duplicatesFiltered = all.reduce((acc, r) => acc + r.duplicate_count, 0);

    return {
      totalReports,
      resolvedReports,
      inProgressReports,
      submittedReports,
      escalatedReports,
      p1Count,
      p2Count,
      p3Count,
      p4Count,
      duplicatesFiltered,
      avgResolutionHours: 28.4,
      ward: 'Ward 112 (Indiranagar, Bengaluru)',
    };
  }
}

export const db = new Database();
