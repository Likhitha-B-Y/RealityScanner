/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CONFIG } from '../config.ts';
import { db } from '../db/database.ts';
import { CivicReport, DuplicateCandidate, IssueType } from '../types.ts';

// Tokenize text into set of lowercase word stems for semantic cosine overlap
function tokenize(text: string): Set<string> {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);
  return new Set(words);
}

function calculateSemanticSimilarity(
  textA: string,
  hazardsA: string[],
  textB: string,
  hazardsB: string[]
): number {
  const setA = tokenize(textA + ' ' + hazardsA.join(' '));
  const setB = tokenize(textB + ' ' + hazardsB.join(' '));

  if (setA.size === 0 || setB.size === 0) return 0.5;

  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) intersection++;
  }

  const union = new Set([...setA, ...setB]).size;
  return Number((intersection / union).toFixed(3));
}

// Visual perceptual similarity
function calculateVisualSimilarity(
  photoHashA: string,
  photoHashB: string,
  isSameType: boolean
): number {
  if (photoHashA === photoHashB) return 1.0;

  // Compute normalized character similarity across hashes
  let matches = 0;
  const len = Math.min(photoHashA.length, photoHashB.length);
  for (let i = 0; i < len; i++) {
    if (photoHashA[i] === photoHashB[i]) matches++;
  }
  const hashSim = len > 0 ? matches / len : 0;

  // Base perceptual baseline for matching domain defects
  const base = isSameType ? 0.72 : 0.2;
  return Number(Math.min(0.98, base + hashSim * 0.26).toFixed(3));
}

export function findDuplicates(
  latitude: number,
  longitude: number,
  issueType: IssueType,
  title: string,
  description: string,
  visibleHazards: string[],
  photoHash: string
): DuplicateCandidate[] {
  const maxRadius = CONFIG.DUPLICATE_RADIUS_METERS[issueType] || 35;
  const nearby = db.findNearbyReports(latitude, longitude, maxRadius, issueType);

  const candidates: DuplicateCandidate[] = [];

  for (const { report, distanceMeters } of nearby) {
    // 1. Geospatial score: 1.0 at 0m, decaying linearly to 0.0 at maxRadius
    const geoScore = Math.max(0, 1 - distanceMeters / maxRadius);

    // 2. Visual similarity
    const visualSim = calculateVisualSimilarity(
      photoHash,
      report.photo_hash,
      report.issue_type === issueType
    );

    // 3. Semantic similarity
    const semanticSim = calculateSemanticSimilarity(
      `${title} ${description}`,
      visibleHazards,
      `${report.title} ${report.description}`,
      report.evidence_verification_flags
    );

    // 4. Bayesian multi-signal fusion
    // Weights: Geospatial 40%, Visual 35%, Semantic 25%
    const fusedProbability = Number(
      (geoScore * 0.40 + visualSim * 0.35 + semanticSim * 0.25).toFixed(3)
    );

    let matchTier: 'auto_merge' | 'suggest_merge' | 'distinct' = 'distinct';
    if (fusedProbability >= CONFIG.THRESHOLDS.AUTO_MERGE) {
      matchTier = 'auto_merge';
    } else if (fusedProbability >= CONFIG.THRESHOLDS.SUGGEST_MERGE) {
      matchTier = 'suggest_merge';
    }

    candidates.push({
      report_id: report.id,
      distance_meters: distanceMeters,
      visual_similarity: visualSim,
      semantic_similarity: semanticSim,
      duplicate_probability: fusedProbability,
      match_tier: matchTier,
      matched_report: report,
    });
  }

  // Sort by highest probability first
  return candidates.sort((a, b) => b.duplicate_probability - a.duplicate_probability);
}
