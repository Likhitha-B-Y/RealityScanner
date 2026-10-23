/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PriorityLevel, SeverityCalculation, SeverityFactors } from '../types.ts';

/**
 * Stage B - Severity Engine (Explainable, not a black box)
 *
 * Formula:
 * severity_score = weighted sum of
 *   - hazard_to_life (0-5) x 0.35 (open manhole, live wires, deep pothole)
 *   - affected_footfall_or_traffic (0-5) x 0.25 (road type, near school/hospital)
 *   - size_or_extent (0-5) x 0.20
 *   - weather/escalation_risk (0-5) x 0.10 (waterlogging, monsoon)
 *   - duration/recurrence (0-5) x 0.10 (from duplicate history)
 */
export function calculateSeverityScore(
  rawFactors: {
    hazard_to_life: number;
    affected_footfall_or_traffic: number;
    size_or_extent: number;
    weather_escalation_risk: number;
  },
  duplicateCount = 0
): SeverityCalculation {
  // Clamp all factors between 0 and 5
  const hazard = Math.min(5, Math.max(0, rawFactors.hazard_to_life));
  const footfall = Math.min(5, Math.max(0, rawFactors.affected_footfall_or_traffic));
  const size = Math.min(5, Math.max(0, rawFactors.size_or_extent));
  const weather = Math.min(5, Math.max(0, rawFactors.weather_escalation_risk));

  // Recurrence factor derived from duplicate/prior report count (each duplicate adds 0.8 points up to 5)
  const duration_recurrence = Math.min(5, 1.0 + duplicateCount * 0.8);

  const weightedSum =
    hazard * 0.35 +
    footfall * 0.25 +
    size * 0.20 +
    weather * 0.10 +
    duration_recurrence * 0.10;

  const score = Number(Math.min(5.0, Math.max(0.5, weightedSum)).toFixed(2));

  let level: PriorityLevel = 'P3';
  let sla_hours = 72;
  let explanation = '';

  if (score >= 4.0) {
    level = 'P1';
    sla_hours = 12;
    explanation = 'Critical emergency: high risk to human life or major arterial traffic paralyzation. Dispatched with 12h SLA.';
  } else if (score >= 3.0) {
    level = 'P2';
    sla_hours = 24;
    explanation = 'High priority: significant pedestrian/vehicular disruption or rapidly escalating safety risk. 24h SLA.';
  } else if (score >= 2.0) {
    level = 'P3';
    sla_hours = 72;
    explanation = 'Moderate priority: localized infrastructure defect requiring scheduled municipal repair. 72h SLA.';
  } else {
    level = 'P4';
    sla_hours = 168;
    explanation = 'Low priority / aesthetic: minor surface defect or beautification requirement. 168h (7-day) SLA.';
  }

  const breakdown: SeverityFactors = {
    hazard_to_life: Number(hazard.toFixed(1)),
    affected_footfall_or_traffic: Number(footfall.toFixed(1)),
    size_or_extent: Number(size.toFixed(1)),
    weather_escalation_risk: Number(weather.toFixed(1)),
    duration_recurrence: Number(duration_recurrence.toFixed(1)),
  };

  return {
    score,
    level,
    sla_hours,
    breakdown,
    explanation,
  };
}
