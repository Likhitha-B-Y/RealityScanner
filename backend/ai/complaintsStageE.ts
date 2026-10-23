/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ComplaintBundle, IssueType, PriorityLevel, SeverityFactors } from '../types.ts';

interface ComplaintInput {
  reportId: string;
  issueType: IssueType;
  title: string;
  description: string;
  address: string;
  landmark?: string;
  latitude: number;
  longitude: number;
  severityLevel: PriorityLevel;
  severityScore: number;
  severityBreakdown: SeverityFactors;
  slaHours: number;
  slaDeadline: string;
  departmentName: string;
  contactEmail: string;
  photoHash: string;
  photoUrl: string;
  timestamp: string;
  hazards: string[];
  dimensions?: string;
}

export function generateComplaintBundle(input: ComplaintInput): Record<'en' | 'hi' | 'kn', ComplaintBundle> {
  const formattedDate = new Date(input.timestamp).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // 1. ENGLISH
  const enLetter = `To,
The Executive Engineer / Competent Municipal Officer,
${input.departmentName},
Ward 112 (Indiranagar), Bruhat Bengaluru Mahanagara Palike (BBMP)

Date: ${formattedDate}
Reference Tracking Ticket: ${input.reportId}
Urgency Classification: ${input.severityLevel} (Severity Score: ${input.severityScore}/5.0 | SLA: ${input.slaHours} Hours)

SUBJECT: URGENT CITIZEN GRIEVANCE REGARDING CIVIC HAZARD — ${input.title.toUpperCase()}

Respected Officer,

I am formally submitting this verified civic complaint regarding a hazardous public infrastructure defect observed at the following location:

- Location: ${input.address}
- Landmark Reference: ${input.landmark || 'Ward 112 main corridor'}
- GPS Coordinates: ${input.latitude.toFixed(6)}° N, ${input.longitude.toFixed(6)}° E
- Defect Category: ${input.issueType.replace('_', ' ').toUpperCase()}
- Physical Extent / Scale: ${input.dimensions || 'Substantial carriageway defect'}

OBSERVED CONDITIONS & SAFETY HAZARDS:
${input.description}

EVALUATED SAFETY IMPACT:
- Primary Danger Signals: ${input.hazards.join(', ')}
- Life Hazard Weight: ${input.severityBreakdown.hazard_to_life}/5.0
- Pedestrian & Commuter Footfall: ${input.severityBreakdown.affected_footfall_or_traffic}/5.0
- Weather / Monsoon Escalation Risk: ${input.severityBreakdown.weather_escalation_risk}/5.0

EVIDENCE INTEGRITY AUDIT:
This report was digitally recorded on-site via Reality Scanner PWA. The photographic evidence has been cryptographically sealed (SHA-256: ${input.photoHash.slice(0, 16)}...) and matched with device GPS telemetry.

REQUESTED ACTION & TIMELINE:
Under the Citizen Citizen Charter and Karnataka Sakala Services Act, your esteemed department is requested to inspect this site immediately and initiate remedial works prior to the stipulated SLA deadline of ${new Date(input.slaDeadline).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}, ${new Date(input.slaDeadline).toLocaleDateString('en-IN')}.

Yours sincerely,
A Concerned Resident Citizen
Logged through Reality Scanner (Civic AI System)`;

  const enPortal: Record<string, string> = {
    ticket_id: input.reportId,
    grievance_category: input.issueType,
    department: input.departmentName,
    sla_hours: `${input.slaHours} Hours`,
    severity_tier: input.severityLevel,
    geo_location: `${input.latitude.toFixed(6)}, ${input.longitude.toFixed(6)}`,
    street_address: input.address,
    landmark: input.landmark || 'Ward 112 Corridor',
    hazard_flags: input.hazards.join('; '),
    defect_summary: input.title,
    detailed_notes: input.description,
    crypto_evidence_sha256: input.photoHash,
  };

  const enSocial = `🚨 URGENT CIVIC ALERT [${input.severityLevel}]: ${input.title} at ${input.address} (${input.latitude.toFixed(4)}, ${input.longitude.toFixed(4)}).
⚠️ Safety Risk: ${input.hazards.slice(0, 2).join(', ')}.
Assigned to @BBMPCOMM & ${input.departmentName}. SLA: ${input.slaHours}h.
Ticket ID: #${input.reportId} #RealityScanner #CivicAction #BengaluruCivic`;

  // 2. HINDI
  const hiLetter = `सेवा में,
कार्यकारी अभियंता / सक्षम अधिकारी,
${input.departmentName},
वार्ड 112 (इंदिरानगर), बीबीएमपी, बेंगलुरु।

दिनांक: ${formattedDate}
शिकायत संदर्भ संख्या: ${input.reportId}
प्राथमिकता स्तर: ${input.severityLevel} (गंभीरता अंक: ${input.severityScore}/5.0 | एसएलए: ${input.slaHours} घंटे)

विषय: नागरिक सुरक्षा जोखिम एवं बुनियादी ढांचा समस्या — ${input.title} के संबंध में।

महोदय,
मैं इस पत्र के माध्यम से निम्नलिखित स्थान पर स्थित गंभीर सार्वजनिक समस्या की ओर आपका ध्यान आकर्षित करना चाहता हूँ:

- सटीक पता: ${input.address}
- पहचान चिह्न (लैंडमार्क): ${input.landmark || 'वार्ड 112 मुख्य मार्ग'}
- जीपीएस निर्देशांक: ${input.latitude.toFixed(6)}° N, ${input.longitude.toFixed(6)}° E
- समस्या श्रेणी: ${input.issueType}
- अनुमानित माप: ${input.dimensions || 'महत्वपूर्ण सड़क क्षति'}

मौके की स्थिति एवं खतरे का विवरण:
${input.description}
पहचाने गए मुख्य खतरे: ${input.hazards.join(', ')}

यह रिपोर्ट 'रियलिटी स्कैनर' के माध्यम से सत्यापित की गई है (SHA-256 डिजिटल सील: ${input.photoHash.slice(0, 16)}...)।

निवेदन है कि कर्नाटक नागरिक सेवा गारंटी अधिनियम के तहत निर्धारित समय सीमा (${input.slaHours} घंटे) के भीतर मरम्मत कार्य पूर्ण किया जाए।

भवदीय,
जागरूक नागरिक (रियलिटी स्कैनर)`;

  const hiPortal: Record<string, string> = {
    ...enPortal,
    grievance_category: input.issueType,
    sla_hours: `${input.slaHours} घंटे`,
    defect_summary: input.title,
  };

  const hiSocial = `🚨 तत्काल नागरिक चेतावनी [${input.severityLevel}]: ${input.title} - ${input.address}।
⚠️ खतरा: ${input.hazards.slice(0, 2).join(', ')}।
विभागीय कार्रवाई हेतु अनुरोध @BBMPCOMM। एसएलए: ${input.slaHours} घंटे।
टिकट: #${input.reportId} #RealityScanner #BengaluruCivic`;

  // 3. KANNADA
  const knLetter = `ಇವರಿಗೆ,
ಕಾರ್ಯನಿರ್ವಾಹಕ ಇಂಜಿನಿಯರ್ / ಸಕ್ಷಮ ಅಧಿಕಾರಿಗಳು,
${input.departmentName},
ವಾರ್ಡ್ 112 (ಇಂದಿರಾನಗರ), ಬೃಹತ್ ಬೆಂಗಳೂರು ಮಹಾನಗರ ಪಾಲಿಕೆ (ಬಿಬಿಎಂಪಿ).

ದಿನಾಂಕ: ${formattedDate}
ದೂರು ಉಲ್ಲೇಖ ಸಂಖ್ಯೆ: ${input.reportId}
ಆದ್ಯತಾ ಶ್ರೇಣಿ: ${input.severityLevel} (ತೀವ್ರತೆಯ ಅಂಕ: ${input.severityScore}/5.0 | ಕಾಲಮಿತಿ: ${input.slaHours} ಗಂಟೆಗಳು)

ವಿಷಯ: ಸಾರ್ವಜನಿಕ ಸುರಕ್ಷತಾ ಅಪಾಯದ ಕುರಿತು ತುರ್ತು ದೂರು — ${input.title}

ಮಾನ್ಯರೇ,
ನಮ್ಮ ನಗರದ ಸಾರ್ವಜನಿಕ ರಸ್ತೆ/ಮೂಲಸೌಕರ್ಯದಲ್ಲಿ ಉಂಟಾಗಿರುವ ಗಂಭೀರ ಸಮಸ್ಯೆಯನ್ನು ತಮ್ಮ ಗಮನಕ್ಕೆ ತರಲು ಈ ಮೂಲಕ ಕೋರುತ್ತೇನೆ:

- ಸ್ಥಳ: ${input.address}
- ಹತ್ತಿರದ ಗುರುತು: ${input.landmark || 'ವಾರ್ಡ್ 112 ಮುಖ್ಯ ರಸ್ತೆ'}
- ಜಿಪಿಎಸ್ ನಿರ್ದೇಶಾಂಕಗಳು: ${input.latitude.toFixed(6)}° N, ${input.longitude.toFixed(6)}° E
- ಸಮಸ್ಯೆಯ ಸ್ವರೂಪ: ${input.issueType}

ಸ್ಥಳದ ಸ್ಥಿತಿಗತಿ ಮತ್ತು ಅಪಾಯಗಳು:
${input.description}
ಗುರುತಿಸಲಾದ ಅಪಾಯಗಳು: ${input.hazards.join(', ')}

ರಿಯಾಲಿಟಿ ಸ್ಕ್ಯಾನರ್ ತಂತ್ರಜ್ಞಾನದ ಮೂಲಕ ಈ ಸಾಕ್ಷ್ಯವನ್ನು ಡಿಜಿಟಲ್ ಆಗಿ ದೃಢೀಕರಿಸಲಾಗಿದೆ (SHA-256: ${input.photoHash.slice(0, 16)}...). ಸಕಾಲ ಕಾಯ್ದೆಯ ಅಡಿಯಲ್ಲಿ ನಿಗದಿತ ${input.slaHours} ಗಂಟೆಗಳ ಒಳಗೆ ದುರಸ್ತಿ ಕಾರ್ಯ ಕೈಗೊಳ್ಳಬೇಕಾಗಿ ವಿನಂತಿ.

ಧನ್ಯವಾದಗಳೊಂದಿಗೆ,
ಜವಾಬ್ದಾರಿಯುತ ನಾಗರಿಕ (ರಿಯಾಲಿಟಿ ಸ್ಕ್ಯಾನರ್)`;

  const knPortal: Record<string, string> = {
    ...enPortal,
    sla_hours: `${input.slaHours} ಗಂಟೆಗಳು`,
    defect_summary: input.title,
  };

  const knSocial = `🚨 ತುರ್ತು ನಾಗರಿಕ ಎಚ್ಚರಿಕೆ [${input.severityLevel}]: ${input.title} ಸ್ಥಳ: ${input.address}।
⚠️ ಅಪಾಯ: ${input.hazards.slice(0, 2).join(', ')}।
ಕೂಡಲೇ ಕ್ರಮ ಕೈಗೊಳ್ಳಿ @BBMPCOMM & ${input.departmentName}।
ದೂರು ಸಂಖ್ಯೆ: #${input.reportId} #RealityScanner #BengaluruCivic`;

  return {
    en: {
      language: 'en',
      formal_letter: enLetter,
      portal_fields: enPortal,
      social_post: enSocial,
    },
    hi: {
      language: 'hi',
      formal_letter: hiLetter,
      portal_fields: hiPortal,
      social_post: hiSocial,
    },
    kn: {
      language: 'kn',
      formal_letter: knLetter,
      portal_fields: knPortal,
      social_post: knSocial,
    },
  };
}
