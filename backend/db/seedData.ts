/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CivicReport, IssueType, PriorityLevel, ReportStatus } from '../types.ts';

// Streets and landmarks in Indiranagar Ward 112, Bengaluru
const STREETS = [
  '100 Feet Road, near 12th Main Junction',
  '12th Main Road, near Defence Colony Gate',
  'CMH Road, opposite Metro Station Pillar 142',
  'Double Road, near Indiranagar Club',
  'Old Airport Road, near Domlur Flyover descent',
  'Appareddypalya Main Road, near Community Hall',
  'HAL 2nd Stage, 80 Feet Road Junction',
  'Binnamangala 1st Stage, Cross 4',
  'Michaelpalya Road, near Government Primary School',
  'Thippasandra Main Road, near Post Office',
  'Defence Colony 5th Cross, near Park',
  'Geetanjali Layout 2nd Main Road',
  'Doopanahalli 3rd Cross, near Cauvery Water Line',
  'Kodihalli Main Road, near Bus Stop',
  'Indiranagar 1st Stage, 100ft Road Corner',
];

const ISSUE_TEMPLATES: Record<
  IssueType,
  {
    titles: string[];
    descriptions: string[];
    deptId: string;
    deptName: string;
    endpoint: string;
    baseSeverity: PriorityLevel;
    hazardScores: [number, number]; // [min, max]
    footfallScores: [number, number];
  }
> = {
  pothole: {
    titles: [
      'Deep Carriageway Pothole with Exposed Aggregate',
      'Expanding Asphalt Crater near Busy Intersection',
      'Hazardous Road Depression Affecting Two-Wheelers',
      'Severe Edge Trench along Bituminous Road',
      'Cluster of Multiple Surface Potholes',
    ],
    descriptions: [
      'Vehicle wheels slamming violently into severe road depression; loose gravel creates skid risk for two-wheelers.',
      'Expanding crater approximately 75cm wide and 12cm deep located directly on the central lane.',
      'Surface degradation following recent pipe laying work leaving sharp edges hazardous at night.',
      'Substantial depression pooling stagnant mud; vehicles swerving dangerously into oncoming traffic.',
    ],
    deptId: 'BBMP_ROADS',
    deptName: 'BBMP Road Infrastructure & Maintenance',
    endpoint: 'https://bbmp.gov.in/api/v1/roads',
    baseSeverity: 'P2',
    hazardScores: [3, 5],
    footfallScores: [3, 5],
  },
  garbage_overflow: {
    titles: [
      'Overflowing Municipal Dumpster Spilling into Street',
      'Illegal Construction Debris Dumping on Sidewalk',
      'Severe Commercial Waste Accumulation near Market',
      'Uncleared Blackspot with Stray Animal Scatter',
    ],
    descriptions: [
      'Secondary collection bin overflowing for 48+ hours; decomposing wet waste blocking half of pedestrian lane.',
      'Large mound of plastic bags and food waste attracting stray cattle and causing stench across neighborhood.',
      'Illegal midnight dumping of dry commercial packaging and debris restricting drainage flow.',
    ],
    deptId: 'SWM_CELL',
    deptName: 'Solid Waste Management (SWM) Cell',
    endpoint: 'https://bbmp.gov.in/api/v1/solid-waste',
    baseSeverity: 'P3',
    hazardScores: [2, 4],
    footfallScores: [3, 5],
  },
  broken_streetlight: {
    titles: [
      'Unlit Streetlight Fixture Plunging Crossroad into Darkness',
      'Flickering High-Mast Sodium Lamp on Main Corridor',
      'Damaged Pole with Exposed Junction Box Wires',
      'Dead Streetlight Adjacent to Pedestrian Crossing',
    ],
    descriptions: [
      'Lamp defective for over 4 nights; critical corner completely unilluminated creating acute safety hazard.',
      'Electrical junction cover missing near base with live wiring accessible to pedestrians in rain.',
      'Damaged bracket causing lamp head to dangle precariously over pedestrian pathway.',
    ],
    deptId: 'BESCOM_ELEC',
    deptName: 'BESCOM Street Lighting Division',
    endpoint: 'https://bescom.karnataka.gov.in/api/v1/lighting',
    baseSeverity: 'P2',
    hazardScores: [3, 5],
    footfallScores: [2, 4],
  },
  damaged_footpath: {
    titles: [
      'Dislodged Concrete Paver Blocks with Trip Hazard',
      'Collapsed Pedestrian Slab over Open Storm Drain',
      'Missing Curb Stones along Senior Citizen Walkway',
      'Heaved Footpath Broken by Tree Roots',
    ],
    descriptions: [
      'Multiple heavy slabs missing or shattered; pedestrians forced onto roadway during peak morning rush.',
      'Footpath cave-in exposing 2-meter drop into roadside culvert; hazardous for visually impaired and elderly.',
      'Broken pavers and protruding steel rebar causing frequent trip injuries near hospital perimeter.',
    ],
    deptId: 'BBMP_PED',
    deptName: 'BBMP Pedestrian & Footpath Division',
    endpoint: 'https://bbmp.gov.in/api/v1/pedestrian',
    baseSeverity: 'P2',
    hazardScores: [3, 4],
    footfallScores: [3, 5],
  },
  open_manhole: {
    titles: [
      'UNCOVERED SEWAGE MANHOLE ON LIVE CARRIAGEWAY',
      'Cracked Cast Iron Chamber Lid Missing Warning Cone',
      'Displaced Inspection Chamber during Rainstorm',
      'Open Storm Drain Sump with High Fall Hazard',
    ],
    descriptions: [
      'CRITICAL: Chamber lid completely missing; deep sewer void directly in path of oncoming two-wheelers and pedestrians.',
      'Fractured inspection cover collapsed inward, creating invisible 3-meter pit concealed by puddle during showers.',
      'Sewer backflow with missing circular lid adjacent to bus terminal platform.',
    ],
    deptId: 'BWSSB_EMERGENCY',
    deptName: 'BWSSB Water & Sewerage Board',
    endpoint: 'https://bwssb.gov.in/api/v1/sewerage',
    baseSeverity: 'P1',
    hazardScores: [5, 5],
    footfallScores: [4, 5],
  },
  waterlogging: {
    titles: [
      'Severe Street Waterlogging Submerging Median',
      'Choked Roadside Drain Causing 40cm Inundation',
      'Stagnant Rainwater Pool Paralyzing Traffic Lane',
      'Backflow from Sump Flooding Pedestrian Crosswalk',
    ],
    descriptions: [
      'Extensive water ponding across entire carriageway; motorists unable to gauge road surface or submerged potholes.',
      'Drainage inlet clogged with silt and refuse; stagnant water entering adjacent commercial doorways.',
    ],
    deptId: 'SWD_DRAIN',
    deptName: 'Stormwater Drains (SWD) Department',
    endpoint: 'https://bbmp.gov.in/api/v1/drainage',
    baseSeverity: 'P2',
    hazardScores: [3, 5],
    footfallScores: [4, 5],
  },
  fallen_tree: {
    titles: [
      'Fallen Gulmohar Tree Branch Blocking Entire Left Lane',
      'Uprooted Trunk Severing Overhead Optical Cables',
      'Precariously Dangling Heavy Bough over School Gate',
      'Storm-Damaged Tree Obstructing Fire Hydrant Access',
    ],
    descriptions: [
      'Large bough snapped during thunderstorm; resting across roadway blocking traffic movement and buses.',
      'Dead trunk leaning dangerously onto overhead electrical cables with visible sparking risk.',
    ],
    deptId: 'BBMP_FOREST',
    deptName: 'BBMP Forest & Horticulture Cell',
    endpoint: 'https://bbmp.gov.in/api/v1/forest',
    baseSeverity: 'P1',
    hazardScores: [4, 5],
    footfallScores: [3, 5],
  },
  damaged_public_facility: {
    titles: [
      'Vandalized Bus Shelter with Broken Glass Panel',
      'Damaged Public Drinking Water Dispenser Fountain',
      'Broken Safety Railing along Elevated Walkway',
      'Compromised Traffic Bollards at Pedestrian Zone',
    ],
    descriptions: [
      'Shattered tempered glass scattered across bus seating area; sharp edges exposed to commuters.',
      'Protective pedestrian guardrail sheared off after collision, removing safety barrier from busy traffic.',
    ],
    deptId: 'BBMP_WORKS',
    deptName: 'Municipal Public Facilities & Works',
    endpoint: 'https://bbmp.gov.in/api/v1/public-works',
    baseSeverity: 'P3',
    hazardScores: [2, 4],
    footfallScores: [3, 5],
  },
  graffiti: {
    titles: [
      'Defaced Public Heritage Boundary Wall',
      'Unauthorized Spray Paint on Flyover Pillar',
      'Commercial Posters Defacing Traffic Signage',
    ],
    descriptions: [
      'Obscured directional traffic signboard due to thick aerosol paint and illegal advertising flyers.',
      'Extensive tagging across newly painted civic retaining wall.',
    ],
    deptId: 'BBMP_BEAUTY',
    deptName: 'Urban Aesthetics & Public Space Cell',
    endpoint: 'https://bbmp.gov.in/api/v1/aesthetics',
    baseSeverity: 'P4',
    hazardScores: [1, 2],
    footfallScores: [2, 4],
  },
  other: {
    titles: [
      'Illegal Road Cutting without Restorative Re-Asphalting',
      'Loose Metal Construction Barrier Encroaching Road',
      'Abandoned Unclaimed Two-Wheeler Obstructing Hydrant',
    ],
    descriptions: [
      'Utility trench excavated across street left backfilled only with loose dirt and jagged aggregate.',
      'Unanchored tin barricade flapping violently into lane during gusty winds.',
    ],
    deptId: 'BBMP_GENERAL',
    deptName: 'BBMP Central Citizen Grievance Cell',
    endpoint: 'https://bbmp.gov.in/api/v1/general',
    baseSeverity: 'P3',
    hazardScores: [2, 4],
    footfallScores: [3, 4],
  },
};

// Realistic mock images for seed data (using SVG data URLs so they are guaranteed to never fail or break)
function generateMockImageSvg(issueType: string, title: string, color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <rect width="600" height="400" fill="#0f172a"/>
    <rect x="20" y="20" width="560" height="360" rx="16" fill="#1e293b" stroke="${color}" stroke-width="2"/>
    <circle cx="300" cy="160" r="64" fill="${color}" fill-opacity="0.15"/>
    <path d="M300 120 L335 180 L265 180 Z" fill="${color}"/>
    <circle cx="300" cy="165" r="4" fill="#ffffff"/>
    <text x="300" y="260" font-family="sans-serif" font-size="20" font-weight="bold" fill="#f8fafc" text-anchor="middle">${issueType.toUpperCase()}</text>
    <text x="300" y="295" font-family="sans-serif" font-size="13" fill="#94a3b8" text-anchor="middle">${title.slice(0, 48)}</text>
    <text x="300" y="325" font-family="monospace" font-size="11" fill="${color}" text-anchor="middle">REALITY SCANNER VERIFIED EVIDENCE</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const TYPE_COLORS: Record<IssueType, string> = {
  pothole: '#f59e0b',
  garbage_overflow: '#84cc16',
  broken_streetlight: '#38bdf8',
  damaged_footpath: '#a855f7',
  open_manhole: '#ef4444',
  waterlogging: '#06b6d4',
  fallen_tree: '#10b981',
  damaged_public_facility: '#ec4899',
  graffiti: '#94a3b8',
  other: '#64748b',
};

export function generateSeedReports(): CivicReport[] {
  const reports: CivicReport[] = [];

  // Key anchor coordinate: Indiranagar Ward 112 (12.9784° N, 77.6408° E)
  const baseLat = 12.9784;
  const baseLon = 77.6408;

  const issueTypes = Object.keys(ISSUE_TEMPLATES) as IssueType[];
  const statuses: ReportStatus[] = ['submitted', 'triaged', 'in_progress', 'resolved', 'escalated'];

  // 1. Primary Seed 001 & Intentional Near-Duplicate Seed 002 (Exact showcase duplicate on 100ft road, 18m apart)
  const rep001: CivicReport = {
    id: 'REP-BLR-001',
    issue_type: 'pothole',
    title: 'Deep Carriageway Pothole with Exposed Aggregate',
    description: 'Severe 70cm crater directly in the middle lane of 100 Feet Road. Loose asphalt aggregate skidding under two-wheeler tires.',
    status: 'in_progress',
    latitude: 12.97825,
    longitude: 77.64052,
    heading: 94,
    address: '100 Feet Road, near 12th Main Junction, Indiranagar',
    landmark: 'Opposite Toit Brewpub & Metro Pillar 84',
    ward_id: 'Ward 112 (Indiranagar)',
    severity_level: 'P1',
    severity_score: 4.35,
    severity_breakdown: {
      hazard_to_life: 4.8,
      affected_footfall_or_traffic: 4.7,
      size_or_extent: 3.8,
      weather_escalation_risk: 3.5,
      duration_recurrence: 4.0,
    },
    sla_hours: 12,
    sla_deadline: new Date(Date.now() + 10 * 3600 * 1000).toISOString(),
    department_id: 'BBMP_ROADS',
    department_name: 'BBMP Road Infrastructure & Maintenance',
    routed_endpoint: 'https://bbmp.gov.in/api/v1/roads',
    photo_url: generateMockImageSvg('pothole', 'Deep Carriageway Pothole', '#f59e0b'),
    photo_hash: '3fa85f647f3945a5f6e80b2d6a5c13b28f742c38d928498835848ab798e4f169',
    evidence_verified: true,
    evidence_verification_flags: ['exif_gps_matched', 'timestamp_consistent', 'no_screenshot_detected', 'sha256_recorded'],
    upvote_count: 14,
    duplicate_count: 3,
    parent_report_id: null,
    created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
  };
  reports.push(rep001);

  // Near duplicate #2 (18 meters away, same defect viewed from opposite angle)
  const rep002: CivicReport = {
    id: 'REP-BLR-002',
    issue_type: 'pothole',
    title: 'Severe Road Depression on 100ft Road',
    description: 'Large asphalt hole causing vehicles to brake abruptly. Danger for bikes at night.',
    status: 'triaged',
    latitude: 12.97838, // ~16 meters north
    longitude: 77.64058,
    heading: 275,
    address: '100 Feet Road, 12th Main Intersection, Indiranagar',
    landmark: 'Near Metro Pillar 84',
    ward_id: 'Ward 112 (Indiranagar)',
    severity_level: 'P1',
    severity_score: 4.25,
    severity_breakdown: {
      hazard_to_life: 4.7,
      affected_footfall_or_traffic: 4.6,
      size_or_extent: 3.6,
      weather_escalation_risk: 3.4,
      duration_recurrence: 4.0,
    },
    sla_hours: 12,
    sla_deadline: new Date(Date.now() + 11 * 3600 * 1000).toISOString(),
    department_id: 'BBMP_ROADS',
    department_name: 'BBMP Road Infrastructure & Maintenance',
    routed_endpoint: 'https://bbmp.gov.in/api/v1/roads',
    photo_url: generateMockImageSvg('pothole', 'Severe Road Depression', '#f59e0b'),
    photo_hash: '7b83d893e3d23a354f0a9c8b7f6e5d4c3b2a10987654321fedcba09876543210',
    evidence_verified: true,
    evidence_verification_flags: ['exif_gps_matched', 'timestamp_consistent', 'no_screenshot_detected'],
    upvote_count: 8,
    duplicate_count: 0,
    parent_report_id: 'REP-BLR-001', // Pre-merged into REP-BLR-001 for demonstration
    created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  };
  reports.push(rep002);

  // Critical Open Manhole (P1 Urgent Emergency)
  const rep003: CivicReport = {
    id: 'REP-BLR-003',
    issue_type: 'open_manhole',
    title: 'UNCOVERED SEWAGE MANHOLE ON LIVE CARRIAGEWAY',
    description: 'Chamber lid missing on CMH Road right in front of primary school gate. 3-meter sheer drop.',
    status: 'submitted',
    latitude: 12.9791,
    longitude: 77.6432,
    heading: 180,
    address: 'CMH Road, opposite Metro Pillar 142',
    landmark: 'Near Indiranagar Metro Station Exit B',
    ward_id: 'Ward 112 (Indiranagar)',
    severity_level: 'P1',
    severity_score: 4.95,
    severity_breakdown: {
      hazard_to_life: 5.0,
      affected_footfall_or_traffic: 5.0,
      size_or_extent: 4.8,
      weather_escalation_risk: 4.9,
      duration_recurrence: 4.5,
    },
    sla_hours: 4,
    sla_deadline: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
    department_id: 'BWSSB_EMERGENCY',
    department_name: 'BWSSB Water & Sewerage Board',
    routed_endpoint: 'https://bwssb.gov.in/api/v1/sewerage',
    photo_url: generateMockImageSvg('open_manhole', 'Uncovered Sewage Manhole', '#ef4444'),
    photo_hash: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
    evidence_verified: true,
    evidence_verification_flags: ['exif_gps_matched', 'high_urgency_certified', 'no_tampering_detected'],
    upvote_count: 32,
    duplicate_count: 5,
    parent_report_id: null,
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
  };
  reports.push(rep003);

  // Resolved ticket with Before/After verification for closing-the-loop demonstration
  const rep004: CivicReport = {
    id: 'REP-BLR-004',
    issue_type: 'garbage_overflow',
    title: 'Severe Commercial Waste Accumulation near Market',
    description: 'Blackspot cleared and sanitized by municipal compactors following citizen alerts.',
    status: 'resolved',
    latitude: 12.9765,
    longitude: 77.6385,
    address: 'Thippasandra Main Road, near Post Office',
    landmark: 'Old Market Square',
    ward_id: 'Ward 112 (Indiranagar)',
    severity_level: 'P2',
    severity_score: 3.4,
    severity_breakdown: {
      hazard_to_life: 2.5,
      affected_footfall_or_traffic: 4.2,
      size_or_extent: 3.8,
      weather_escalation_risk: 3.0,
      duration_recurrence: 3.0,
    },
    sla_hours: 16,
    sla_deadline: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    department_id: 'SWM_CELL',
    department_name: 'Solid Waste Management (SWM) Cell',
    routed_endpoint: 'https://bbmp.gov.in/api/v1/solid-waste',
    photo_url: generateMockImageSvg('garbage_overflow', 'Overflowing Waste (BEFORE)', '#84cc16'),
    photo_hash: '11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff',
    evidence_verified: true,
    evidence_verification_flags: ['exif_gps_matched', 'verified'],
    upvote_count: 19,
    duplicate_count: 2,
    parent_report_id: null,
    resolution_photo_url: generateMockImageSvg('garbage_overflow', 'Sanitized & Cleared (AFTER)', '#10b981'),
    resolution_photo_hash: 'aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899',
    resolution_notes: 'BBMP SWM team deployed mechanical compactor and washed ground with disinfectant powder.',
    resolution_verified_by_ai: true,
    resolution_ai_score: 0.94,
    resolved_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    created_at: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
  };
  reports.push(rep004);

  // Generate 150+ realistic distributed reports across Indiranagar
  let counter = 5;
  for (let i = 0; i < 155; i++) {
    const type = issueTypes[i % issueTypes.length];
    const template = ISSUE_TEMPLATES[type];
    const street = STREETS[i % STREETS.length];
    const status = statuses[i % statuses.length];

    // Clustered slightly around main transit corridors
    const latOffset = (Math.sin(i * 1.7) * 0.012) + (Math.cos(i * 0.9) * 0.008);
    const lonOffset = (Math.cos(i * 1.3) * 0.014) + (Math.sin(i * 0.5) * 0.009);

    const lat = Number((baseLat + latOffset).toFixed(6));
    const lon = Number((baseLon + lonOffset).toFixed(6));

    const hazardScore = template.hazardScores[0] + Math.random() * (template.hazardScores[1] - template.hazardScores[0]);
    const footfallScore = template.footfallScores[0] + Math.random() * (template.footfallScores[1] - template.footfallScores[0]);
    const sizeScore = 1.5 + Math.random() * 3.2;
    const weatherScore = 1.0 + Math.random() * 3.5;
    const durationScore = 1.0 + Math.random() * 3.0;

    const weightedScore = Number(
      (
        hazardScore * 0.35 +
        footfallScore * 0.25 +
        sizeScore * 0.2 +
        weatherScore * 0.1 +
        durationScore * 0.1
      ).toFixed(2)
    );

    let level: PriorityLevel = 'P3';
    let slaHours = 72;
    if (weightedScore >= 4.0) {
      level = 'P1';
      slaHours = 12;
    } else if (weightedScore >= 3.0) {
      level = 'P2';
      slaHours = 24;
    } else if (weightedScore < 2.0) {
      level = 'P4';
      slaHours = 168;
    }

    const ageHours = (i % 72) + 1;
    const createdAt = new Date(Date.now() - ageHours * 3600 * 1000).toISOString();
    const deadline = new Date(new Date(createdAt).getTime() + slaHours * 3600 * 1000).toISOString();

    const title = template.titles[i % template.titles.length];
    const desc = template.descriptions[i % template.descriptions.length];

    const report: CivicReport = {
      id: `REP-BLR-${String(counter).padStart(3, '0')}`,
      issue_type: type,
      title,
      description: desc,
      status,
      latitude: lat,
      longitude: lon,
      heading: Math.floor(Math.random() * 360),
      address: `${street}`,
      landmark: `Near Ward 112 Sector ${(i % 8) + 1}`,
      ward_id: 'Ward 112 (Indiranagar)',
      severity_level: level,
      severity_score: weightedScore,
      severity_breakdown: {
        hazard_to_life: Number(hazardScore.toFixed(1)),
        affected_footfall_or_traffic: Number(footfallScore.toFixed(1)),
        size_or_extent: Number(sizeScore.toFixed(1)),
        weather_escalation_risk: Number(weatherScore.toFixed(1)),
        duration_recurrence: Number(durationScore.toFixed(1)),
      },
      sla_hours: slaHours,
      sla_deadline: deadline,
      department_id: template.deptId,
      department_name: template.deptName,
      routed_endpoint: template.endpoint,
      photo_url: generateMockImageSvg(type, title, TYPE_COLORS[type]),
      photo_hash: `hash_${i}_${Date.now()}_blr`,
      evidence_verified: i % 10 !== 0, // 90% verified, 10% flagged for verification demo
      evidence_verification_flags:
        i % 10 === 0
          ? ['potential_exif_timestamp_delta']
          : ['exif_gps_matched', 'timestamp_consistent', 'no_screenshot_detected'],
      upvote_count: Math.floor(Math.random() * 25) + 1,
      duplicate_count: i % 4 === 0 ? Math.floor(Math.random() * 4) + 1 : 0,
      parent_report_id: null,
      created_at: createdAt,
      updated_at: createdAt,
    };

    if (status === 'resolved') {
      report.resolution_photo_url = generateMockImageSvg(type, `${title} (RESOLVED)`, '#10b981');
      report.resolution_photo_hash = `res_hash_${i}_verified`;
      report.resolution_notes = `Municipal team completed remediation work on schedule.`;
      report.resolution_verified_by_ai = true;
      report.resolution_ai_score = 0.91;
      report.resolved_at = new Date(Date.now() - (ageHours / 2) * 3600 * 1000).toISOString();
    }

    reports.push(report);
    counter++;
  }

  return reports;
}

export const SEED_REPORTS = generateSeedReports();
