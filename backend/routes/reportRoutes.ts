/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { db } from '../db/database.ts';
import { CivicReport, IssueType, PriorityLevel, ReportStatus } from '../types.ts';

export const reportRouter = Router();

// GET all reports with query filters
reportRouter.get('/', (req, res) => {
  const { status, issue_type, severity_level, ward_id } = req.query;

  const reports = db.filterReports({
    status: status as ReportStatus,
    issue_type: issue_type as IssueType,
    severity_level: severity_level as PriorityLevel,
    ward_id: ward_id as string,
  });

  res.json({ reports });
});

// GET single report
reportRouter.get('/:id', (req, res) => {
  const report = db.getReportById(req.params.id);
  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }
  res.json({ report });
});

// POST submit new report
reportRouter.post('/', (req, res) => {
  try {
    const data = req.body as CivicReport;

    if (!data.title || !data.issue_type || !data.latitude || !data.longitude) {
      return res.status(400).json({ error: 'Missing required report fields' });
    }

    const newReport: CivicReport = {
      ...data,
      id: data.id || `REP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'submitted',
      upvote_count: 1,
      duplicate_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const saved = db.createReport(newReport);
    res.status(201).json({ success: true, report: saved });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
});

// POST upvote an existing report (with optional citizen photo evidence)
reportRouter.post('/:id/upvote', (req, res) => {
  const { photo_url, photo_hash, note } = req.body;
  const updated = db.upvoteReport(
    req.params.id,
    photo_url && photo_hash ? { photo_url, photo_hash, note } : undefined
  );

  if (!updated) {
    return res.status(404).json({ error: 'Report not found' });
  }

  res.json({ success: true, report: updated });
});

// POST merge duplicate report into parent ticket
reportRouter.post('/:id/merge', (req, res) => {
  const { duplicateReport } = req.body;
  if (!duplicateReport) {
    return res.status(400).json({ error: 'Missing duplicateReport payload' });
  }

  const updatedParent = db.mergeDuplicate(req.params.id, duplicateReport);
  if (!updatedParent) {
    return res.status(404).json({ error: 'Parent report not found' });
  }

  res.json({ success: true, parentReport: updatedParent });
});

// POST reset DB to 150+ seeds
reportRouter.post('/admin/reset', (_req, res) => {
  const reports = db.resetToSeeds();
  res.json({ success: true, message: 'Database reset to 150+ realistic seeds', count: reports.length });
});
