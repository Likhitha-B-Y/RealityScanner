/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { ROUTING_RULES } from '../config.ts';
import { runPerceptionStageA } from '../ai/perceptionStageA.ts';
import { calculateSeverityScore } from '../ai/severityStageB.ts';
import { findDuplicates } from '../ai/deduplicationStageC.ts';
import { auditEvidenceIntegrity } from '../ai/integrityStageD.ts';
import { generateComplaintBundle } from '../ai/complaintsStageE.ts';
import { DEMO_SCENARIOS } from './demoRoutes.ts';

export const scanRouter = Router();

scanRouter.post('/scan', async (req, res) => {
  try {
    const {
      imageBase64,
      deviceGps = { latitude: 12.9784, longitude: 77.6408, accuracy: 5 },
      deviceTimestamp = new Date().toISOString(),
      heading = 90,
      exifGps = null,
      exifTimestamp = null,
      isScreenshotCandidate = false,
      demoScenarioId,
    } = req.body;

    if (!imageBase64 && !demoScenarioId) {
      return res.status(400).json({ error: 'Missing imageBase64 or demoScenarioId' });
    }

    // 1. Stage D: Evidence Integrity Audit
    const integrityAudit = auditEvidenceIntegrity({
      imageBase64: imageBase64 || 'data:image/jpeg;base64,demo',
      deviceGps,
      deviceTimestamp,
      exifGps,
      exifTimestamp,
      isScreenshotCandidate: Boolean(isScreenshotCandidate),
    });

    // 2. Stage A: Perception Engine
    let perceptionResult;

    if (demoScenarioId) {
      const demoItem = DEMO_SCENARIOS.find((d) => d.id === demoScenarioId);
      if (demoItem) {
        const demoIssueType = demoItem.issue_type as import('../types.ts').IssueType;
        perceptionResult = {
          is_civic_issue: demoItem.is_civic_issue,
          needs_better_photo: demoItem.needs_better_photo,
          refusal_reason: demoItem.refusal_reason || '',
          issue_type: demoIssueType,
          primary_title: demoItem.primary_title,
          detailed_description: demoItem.detailed_description,
          estimated_dimensions: demoItem.estimated_dimensions,
          confidence: demoItem.is_civic_issue ? 0.95 : 0.2,
          visible_hazards: demoItem.visible_hazards,
          severity_factors: demoItem.severity_factors,
          suggested_department: ROUTING_RULES[demoIssueType]?.department_name || 'BBMP Central',
        };
      }
    }

    if (!perceptionResult) {
      perceptionResult = await runPerceptionStageA(imageBase64);
    }

    // Check refusal rules (Stage A early exit if non-civic or needs retake)
    if (!perceptionResult.is_civic_issue || perceptionResult.needs_better_photo) {
      return res.json({
        success: true,
        refused: true,
        is_civic_issue: perceptionResult.is_civic_issue,
        needs_better_photo: perceptionResult.needs_better_photo,
        refusal_reason: perceptionResult.refusal_reason,
        primary_title: perceptionResult.primary_title,
        detailed_description: perceptionResult.detailed_description,
        integrity_audit: integrityAudit,
      });
    }

    // 3. Stage B: Explainable Severity Scoring
    const severity = calculateSeverityScore(perceptionResult.severity_factors, 0);

    // 4. Stage C: Multi-Signal Duplicate Detection Moat
    const issueType = perceptionResult.issue_type as import('../types.ts').IssueType;
    const duplicates = findDuplicates(
      deviceGps.latitude,
      deviceGps.longitude,
      issueType,
      perceptionResult.primary_title,
      perceptionResult.detailed_description,
      perceptionResult.visible_hazards,
      integrityAudit.photo_hash
    );

    // Dynamic ticket ID draft
    const draftId = `REP-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    // Address & routing
    const routing = ROUTING_RULES[issueType] || ROUTING_RULES.other;
    const address = req.body.address || '100 Feet Road, Ward 112, Indiranagar, Bengaluru';
    const landmark = req.body.landmark || 'Ward 112 Commercial Corridor';

    const deadline = new Date(Date.now() + severity.sla_hours * 3600 * 1000).toISOString();

    // 5. Stage E: Multilingual Complaint Bundle
    const complaints = generateComplaintBundle({
      reportId: draftId,
      issueType,
      title: perceptionResult.primary_title,
      description: perceptionResult.detailed_description,
      address,
      landmark,
      latitude: deviceGps.latitude,
      longitude: deviceGps.longitude,
      severityLevel: severity.level,
      severityScore: severity.score,
      severityBreakdown: severity.breakdown,
      slaHours: severity.sla_hours,
      slaDeadline: deadline,
      departmentName: routing.department_name,
      contactEmail: routing.contact_email,
      photoHash: integrityAudit.photo_hash,
      photoUrl: imageBase64,
      timestamp: deviceTimestamp,
      hazards: perceptionResult.visible_hazards,
      dimensions: perceptionResult.estimated_dimensions,
    });

    return res.json({
      success: true,
      refused: false,
      draftId,
      perception: perceptionResult,
      severity,
      duplicates,
      integrity_audit: integrityAudit,
      complaints,
      routing,
      metadata: {
        address,
        landmark,
        latitude: deviceGps.latitude,
        longitude: deviceGps.longitude,
        heading,
        ward_id: 'Ward 112 (Indiranagar)',
        sla_deadline: deadline,
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Scan API route error:', err);
    return res.status(500).json({ error: err.message || 'Scan analysis failure' });
  }
});
