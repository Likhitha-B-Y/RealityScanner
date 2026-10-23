/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IssueType, RoutingRule } from './types.ts';

export const CONFIG = {
  PORT: process.env.PORT || 3000,
  DUPLICATE_RADIUS_METERS: {
    pothole: 25,
    garbage_overflow: 50,
    broken_streetlight: 30,
    damaged_footpath: 35,
    open_manhole: 20,
    waterlogging: 60,
    fallen_tree: 40,
    damaged_public_facility: 30,
    graffiti: 25,
    other: 30,
  } as Record<IssueType, number>,

  // Bayesian similarity fusion thresholds
  THRESHOLDS: {
    AUTO_MERGE: 0.85,
    SUGGEST_MERGE: 0.60,
  },

  DEFAULT_WARD: 'Ward 112 (Indiranagar, Bengaluru)',
  DEFAULT_COORDINATES: {
    latitude: 12.9784,
    longitude: 77.6408,
  },
};

export const ROUTING_RULES: Record<IssueType, RoutingRule> = {
  pothole: {
    id: 'ROUTE-ROAD-01',
    issue_type: 'pothole',
    department_name: 'BBMP Road Infrastructure & Maintenance',
    contact_email: 'roads.east@bbmp.gov.in',
    portal_endpoint: 'https://bbmp.gov.in/api/v1/grievance/roads',
    sla_hours: { P1: 12, P2: 24, P3: 72, P4: 168 },
  },
  garbage_overflow: {
    id: 'ROUTE-SWM-02',
    issue_type: 'garbage_overflow',
    department_name: 'Solid Waste Management (SWM) Cell',
    contact_email: 'swm.indiranagar@bbmp.gov.in',
    portal_endpoint: 'https://bbmp.gov.in/api/v1/grievance/solid-waste',
    sla_hours: { P1: 8, P2: 16, P3: 48, P4: 96 },
  },
  broken_streetlight: {
    id: 'ROUTE-BESCOM-03',
    issue_type: 'broken_streetlight',
    department_name: 'BESCOM Street Lighting Division',
    contact_email: 'helpline@bescom.karnataka.gov.in',
    portal_endpoint: 'https://bescom.karnataka.gov.in/api/v1/lighting',
    sla_hours: { P1: 12, P2: 24, P3: 48, P4: 120 },
  },
  damaged_footpath: {
    id: 'ROUTE-PED-04',
    issue_type: 'damaged_footpath',
    department_name: 'BBMP Pedestrian & Footpath Division',
    contact_email: 'footpaths@bbmp.gov.in',
    portal_endpoint: 'https://bbmp.gov.in/api/v1/grievance/pedestrian',
    sla_hours: { P1: 16, P2: 36, P3: 72, P4: 168 },
  },
  open_manhole: {
    id: 'ROUTE-BWSSB-05',
    issue_type: 'open_manhole',
    department_name: 'BWSSB Water & Sewerage Board',
    contact_email: 'emergency@bwssb.gov.in',
    portal_endpoint: 'https://bwssb.gov.in/api/v1/sewerage-alerts',
    sla_hours: { P1: 4, P2: 12, P3: 24, P4: 48 }, // Critical emergency
  },
  waterlogging: {
    id: 'ROUTE-DRAIN-06',
    issue_type: 'waterlogging',
    department_name: 'Stormwater Drains (SWD) Department',
    contact_email: 'swd.controlroom@bbmp.gov.in',
    portal_endpoint: 'https://bbmp.gov.in/api/v1/drainage',
    sla_hours: { P1: 8, P2: 18, P3: 48, P4: 96 },
  },
  fallen_tree: {
    id: 'ROUTE-FOREST-07',
    issue_type: 'fallen_tree',
    department_name: 'BBMP Forest & Horticulture Cell',
    contact_email: 'trees@bbmp.gov.in',
    portal_endpoint: 'https://bbmp.gov.in/api/v1/forest-emergency',
    sla_hours: { P1: 6, P2: 14, P3: 36, P4: 72 },
  },
  damaged_public_facility: {
    id: 'ROUTE-FACILITY-08',
    issue_type: 'damaged_public_facility',
    department_name: 'Municipal Public Facilities & Works',
    contact_email: 'publicworks@bbmp.gov.in',
    portal_endpoint: 'https://bbmp.gov.in/api/v1/public-works',
    sla_hours: { P1: 16, P2: 36, P3: 72, P4: 168 },
  },
  graffiti: {
    id: 'ROUTE-BEAUTY-09',
    issue_type: 'graffiti',
    department_name: 'Urban Aesthetics & Public Space Cell',
    contact_email: 'cleanward@bbmp.gov.in',
    portal_endpoint: 'https://bbmp.gov.in/api/v1/aesthetics',
    sla_hours: { P1: 48, P2: 72, P3: 120, P4: 240 },
  },
  other: {
    id: 'ROUTE-GENERAL-10',
    issue_type: 'other',
    department_name: 'BBMP Central Citizen Grievance Cell',
    contact_email: 'grievance@bbmp.gov.in',
    portal_endpoint: 'https://bbmp.gov.in/api/v1/general',
    sla_hours: { P1: 24, P2: 48, P3: 96, P4: 168 },
  },
};
