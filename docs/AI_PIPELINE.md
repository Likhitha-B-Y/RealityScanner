# Reality Scanner — AI Pipeline Documentation (Stages A through G)

Reality Scanner implements an autonomous end-to-end civic perception and resolution verification pipeline designed for real-world municipal environments.

---

## Stage A: Perception Engine (Multimodal Vision)
- **Model**: `gemini-3.8-flash` via `@google/genai` TypeScript SDK.
- **Input**: Base64 JPEG/PNG image compressed client-side to $\le 1280 \times 960$ px.
- **Output Schema**: Strict JSON Schema enforced through `responseSchema` (`Type.OBJECT`).
- **Refusal Discipline**:
  - The model is instructed through system prompts to **refuse to guess**.
  - If visual clarity is compromised (motion blur, low light, dark shadows), it sets `needs_better_photo = true` and generates actionable guidance for the citizen (e.g. *"Step closer and enable torch"*).
  - Non-civic subjects (selfies, pets, interior furniture) return `is_civic_issue = false` and are gracefully rejected prior to ticket generation.
- **Fail-Safe**: If an upstream API timeout occurs, a defensive fallback heuristic runs so live hackathon demos never stall.

---

## Stage B: Explainable Severity Scoring Engine
Unlike opaque black-box models, Reality Scanner uses an audited, transparent civic rubric:

$$\text{Severity Score} = (H \times 0.35) + (F \times 0.25) + (S \times 0.20) + (W \times 0.10) + (D \times 0.10)$$

Where:
1. **$H$ (Hazard to Life, 35%)**: Immediate threat of death or serious physical injury (open sewage manhole = 5.0, high-voltage exposed wiring = 4.8, surface graffiti = 1.0).
2. **$F$ (Affected Footfall / Traffic, 25%)**: Proximity to arterial roads, metro corridors, hospitals, and primary schools.
3. **$S$ (Physical Extent / Scale, 20%)**: Metric width and depth inferred from visual environmental scale.
4. **$W$ (Weather / Escalation Risk, 10%)**: Vulnerability to monsoon flooding or vector breeding.
5. **$D$ (Recurrence / Duplicate Count, 10%)**: Prior neighborhood reports indicating persistent municipal neglect.

### SLA Mapping:
- **P1 (Score $\ge 4.0$)**: **12-Hour SLA** (Emergency response dispatched)
- **P2 (Score $3.0 - 3.99$)**: **24-Hour SLA** (High priority remediation)
- **P3 (Score $2.0 - 2.99$)**: **72-Hour SLA** (Standard maintenance work)
- **P4 (Score $< 2.0$)**: **168-Hour SLA (7 Days)** (Non-urgent / beautification)

---

## Stage C: Multi-Signal Duplicate Detection Moat
To eliminate municipal triage overload, reports are cross-checked through a 3-signal Bayesian fusion model:

1. **Geospatial Filter**: Haversine distance calculated against type-specific radius thresholds:
   - Potholes: **25 meters**
   - Garbage overflow: **50 meters**
   - Streetlights: **30 meters**
   - Open manholes: **20 meters**
   - Waterlogging: **60 meters**
2. **Visual Feature Similarity**: Perceptual hash distance and normalized defect vector cosine similarity.
3. **Semantic Similarity**: Tokenized overlap across defect categories, hazard signals, and physical scale.
4. **Bayesian Decision Fusion**:
   - $\text{Probability} > 0.85$: **Auto-Merge Suggestion** (*"Existing ticket found 16m away; add evidence & upvote"*).
   - $\text{Probability} \in [0.60, 0.85]$: **Ask Citizen** (*"Nearby defect detected; verify if same issue"*).
   - $\text{Probability} < 0.60$: **Distinct Ticket Created**.

---

## Stage D: Evidence Integrity & Anti-Fraud
- **Cryptographic Fingerprint**: SHA-256 hash computed immediately from raw image bytes and stamped onto the database record.
- **EXIF Cross-Verification**: EXIF GPS and timestamp compared against device geolocation and system clock. Delays $>120$ minutes or spatial divergence $>500$m flag a `potential_mock_location` warning.
- **Anti-Fraud Heuristics**: Screenshot raster aspect ratios and absent camera sensor noise are flagged as `screenshot_artifact_detected`.

---

## Stage E: Multilingual Complaint Generation
Generates 3 deterministic, zero-hallucination grievance outputs in English, Hindi, and Kannada:
1. **Formal Municipal Letter**: Addressed to specific executive engineer under Karnataka Sakala Citizen Charter.
2. **Municipal Portal Payload**: Standard JSON key-value format for BBMP / BWSSB / BESCOM grievance ingestion.
3. **Public Social Alert**: Tweet-length post tagging relevant ward handles and commissioner accounts.

---

## Stage F: Rules-Based Municipal Routing
A lookup table routes reports directly to the responsible local authority based on `issue_type`:
- Potholes & Footpaths $\to$ **BBMP Road Infrastructure & Maintenance**
- Waste & Dumps $\to$ **Solid Waste Management (SWM) Cell**
- Streetlights $\to$ **BESCOM Electrical Division**
- Open Manholes & Sewers $\to$ **BWSSB Water & Sewerage Board**
- Tree Snaps $\to$ **BBMP Forest & Horticulture Cell**

---

## Stage G: Closing the Loop (Resolution Verification)
When municipal field teams mark a ticket "Resolved", they must upload a photograph of the remediated area.
Gemini Vision compares the **BEFORE** and **AFTER** photographs:
- Verifies if the asphalt patch is flush with the road grade.
- Verifies if garbage has been fully cleared and disinfected.
- Generates a quantitative verification score ($\ge 0.85$ required to close ticket).
- Unresolved tickets past SLA trigger automated escalation drafts to the zonal commissioner.
