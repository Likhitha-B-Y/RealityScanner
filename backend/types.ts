/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type IssueType =
  | 'pothole'
  | 'garbage_overflow'
  | 'broken_streetlight'
  | 'damaged_footpath'
  | 'open_manhole'
  | 'waterlogging'
  | 'fallen_tree'
  | 'damaged_public_facility'
  | 'graffiti'
  | 'other';

export type PriorityLevel = 'P1' | 'P2' | 'P3' | 'P4';

export type ReportStatus =
  | 'submitted'
  | 'triaged'
  | 'in_progress'
  | 'resolved'
  | 'escalated';

export interface SeverityFactors {
  hazard_to_life: number;          // 0 to 5 (weight 0.35)
  affected_footfall_or_traffic: number; // 0 to 5 (weight 0.25)
  size_or_extent: number;          // 0 to 5 (weight 0.20)
  weather_escalation_risk: number; // 0 to 5 (weight 0.10)
  duration_recurrence?: number;    // 0 to 5 (weight 0.10)
}

export interface SeverityCalculation {
  score: number;                   // 0.0 to 5.0
  level: PriorityLevel;            // P1, P2, P3, P4
  sla_hours: number;               // 12, 24, 72, 168
  breakdown: SeverityFactors;
  explanation: string;
}

export interface VisionPerceptionResult {
  is_civic_issue: boolean;
  needs_better_photo: boolean;
  refusal_reason: string;
  issue_type: IssueType;
  primary_title: string;
  detailed_description: string;
  estimated_dimensions: string;
  confidence: number;
  visible_hazards: string[];
  severity_factors: {
    hazard_to_life: number;
    affected_footfall_or_traffic: number;
    size_or_extent: number;
    weather_escalation_risk: number;
  };
  suggested_department: string;
}

export interface EvidenceAudit {
  photo_hash: string;              // SHA-256
  timestamp: string;
  device_gps: { latitude: number; longitude: number; accuracy?: number };
  exif_gps?: { latitude: number; longitude: number } | null;
  exif_timestamp?: string | null;
  gps_match: boolean;
  timestamp_match: boolean;
  is_screenshot: boolean;
  integrity_passed: boolean;
  verification_flags: string[];
}

export interface DuplicateCandidate {
  report_id: string;
  distance_meters: number;
  visual_similarity: number;       // 0 to 1
  semantic_similarity: number;     // 0 to 1
  duplicate_probability: number;   // 0 to 1
  match_tier: 'auto_merge' | 'suggest_merge' | 'distinct';
  matched_report: CivicReport;
}

export interface ComplaintBundle {
  language: 'en' | 'hi' | 'kn';
  formal_letter: string;
  portal_fields: Record<string, string>;
  social_post: string;
}

export interface CivicReport {
  id: string;                      // e.g. "REP-2026-0841"
  issue_type: IssueType;
  title: string;
  description: string;
  status: ReportStatus;
  
  // Geospatial
  latitude: number;
  longitude: number;
  heading?: number;
  address: string;
  landmark?: string;
  ward_id: string;
  
  // Severity & SLA
  severity_level: PriorityLevel;
  severity_score: number;
  severity_breakdown: SeverityFactors;
  sla_hours: number;
  sla_deadline: string;
  
  // Routing
  department_id: string;
  department_name: string;
  routed_endpoint: string;
  
  // Evidence
  photo_url: string;
  photo_hash: string;
  evidence_verified: boolean;
  evidence_verification_flags: string[];
  
  // Metrics & Merging
  upvote_count: number;
  duplicate_count: number;
  parent_report_id?: string | null;
  
  // Resolution Loop (Stage G)
  resolution_photo_url?: string;
  resolution_photo_hash?: string;
  resolution_notes?: string;
  resolution_verified_by_ai?: boolean;
  resolution_ai_score?: number;
  resolved_at?: string;
  
  created_at: string;
  updated_at: string;
  complaints?: Record<'en' | 'hi' | 'kn', ComplaintBundle>;
  additional_evidence?: Array<{
    id: string;
    photo_url: string;
    photo_hash: string;
    timestamp: string;
    note?: string;
  }>;
}

export interface RoutingRule {
  id: string;
  issue_type: IssueType;
  department_name: string;
  contact_email: string;
  portal_endpoint: string;
  sla_hours: Record<PriorityLevel, number>;
}
