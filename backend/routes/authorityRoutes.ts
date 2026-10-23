/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { db } from '../db/database.ts';
import { verifyResolutionBeforeAfter } from '../ai/resolutionStageG.ts';

export const authorityRouter = Router();

authorityRouter.get('/dashboard', (_req, res) => {
  const stats = db.getDashboardStats();
  const allReports = db.getAllReports();

  // Active priority queue sorted by SLA deadline urgency
  const activeQueue = allReports
    .filter((r) => !r.parent_report_id && (r.status === 'submitted' || r.status === 'triaged' || r.status === 'in_progress'))
    .sort((a, b) => new Date(a.sla_deadline).getTime() - new Date(b.sla_deadline).getTime());

  // Recently resolved
  const resolvedList = allReports
    .filter((r) => r.status === 'resolved')
    .slice(0, 10);

  res.json({
    stats,
    activeQueue,
    resolvedList,
  });
});

authorityRouter.post('/resolve', async (req, res) => {
  try {
    const { reportId, resolutionPhotoBase64, resolutionNotes } = req.body;
    const report = db.getReportById(reportId);

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Run Stage G Before/After AI inspection
    const aiAudit = await verifyResolutionBeforeAfter(
      report.photo_url,
      resolutionPhotoBase64 || report.photo_url,
      report.issue_type
    );

    const updated = db.updateReport(reportId, {
      status: 'resolved',
      resolution_photo_url: resolutionPhotoBase64,
      resolution_notes: resolutionNotes || aiAudit.observations,
      resolution_verified_by_ai: aiAudit.is_defect_remediated,
      resolution_ai_score: aiAudit.confidence_score,
      resolved_at: new Date().toISOString(),
    });

    res.json({
      success: true,
      report: updated,
      aiAudit,
    });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
});

authorityRouter.get('/export-csv', (_req, res) => {
  const reports = db.getAllReports();
  const headers = [
    'Ticket ID',
    'Issue Type',
    'Title',
    'Status',
    'Severity Level',
    'Severity Score',
    'SLA Hours',
    'SLA Deadline',
    'Department',
    'Latitude',
    'Longitude',
    'Address',
    'Upvotes',
    'Duplicates',
    'Created At',
  ];

  const rows = reports.map((r) => [
    r.id,
    r.issue_type,
    `"${r.title.replace(/"/g, '""')}"`,
    r.status,
    r.severity_level,
    r.severity_score,
    r.sla_hours,
    r.sla_deadline,
    `"${r.department_name.replace(/"/g, '""')}"`,
    r.latitude,
    r.longitude,
    `"${r.address.replace(/"/g, '""')}"`,
    r.upvote_count,
    r.duplicate_count,
    r.created_at,
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="reality_scanner_ward_112_reports.csv"');
  res.send(csvContent);
});
