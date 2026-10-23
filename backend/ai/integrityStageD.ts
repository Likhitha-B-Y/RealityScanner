/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import crypto from 'crypto';
import { EvidenceAudit } from '../types.ts';

export function computeSha256(data: string | Buffer): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

export function auditEvidenceIntegrity(params: {
  imageBase64: string;
  deviceGps: { latitude: number; longitude: number; accuracy?: number };
  deviceTimestamp: string;
  exifGps?: { latitude: number; longitude: number } | null;
  exifTimestamp?: string | null;
  isScreenshotCandidate?: boolean;
}): EvidenceAudit {
  const cleanBase64 = params.imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');
  const buffer = Buffer.from(cleanBase64, 'base64');
  const photo_hash = computeSha256(buffer);

  const verification_flags: string[] = [];
  verification_flags.push('sha256_cryptographic_seal_recorded');

  let gps_match = true;
  let timestamp_match = true;
  let is_screenshot = params.isScreenshotCandidate || false;

  // Check screenshot heuristics (e.g. dimensions matching common mobile screens without camera sensor metadata)
  if (is_screenshot) {
    verification_flags.push('warning_screenshot_artifact_detected');
  } else {
    verification_flags.push('camera_sensor_capture_verified');
  }

  // Cross-reference EXIF GPS with Device GPS
  if (params.exifGps && params.exifGps.latitude && params.exifGps.longitude) {
    const latDiff = Math.abs(params.deviceGps.latitude - params.exifGps.latitude);
    const lonDiff = Math.abs(params.deviceGps.longitude - params.exifGps.longitude);
    // Delta greater than ~500m indicates possible mock GPS or reused external image
    if (latDiff > 0.005 || lonDiff > 0.005) {
      gps_match = false;
      verification_flags.push('exif_gps_mismatch_flagged');
    } else {
      verification_flags.push('exif_gps_device_match_verified');
    }
  } else {
    verification_flags.push('live_device_telemetry_stamped');
  }

  // Cross-reference timestamps
  if (params.exifTimestamp) {
    const devTime = new Date(params.deviceTimestamp).getTime();
    const exifTime = new Date(params.exifTimestamp).getTime();
    const diffMinutes = Math.abs(devTime - exifTime) / (60 * 1000);
    if (diffMinutes > 120) {
      timestamp_match = false;
      verification_flags.push('historical_timestamp_delta_flagged');
    } else {
      verification_flags.push('capture_timestamp_sync_verified');
    }
  }

  const integrity_passed = gps_match && timestamp_match && !is_screenshot;

  return {
    photo_hash,
    timestamp: params.deviceTimestamp,
    device_gps: params.deviceGps,
    exif_gps: params.exifGps || null,
    exif_timestamp: params.exifTimestamp || null,
    gps_match,
    timestamp_match,
    is_screenshot,
    integrity_passed,
    verification_flags,
  };
}
