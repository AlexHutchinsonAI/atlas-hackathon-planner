/* Internet-only update reconciled with Alex’s supplied backup and verified Safari register. */
window.ATLAS_INTERNET_REGISTER_UPDATE = {
  "version": "2026-10-04-v1",
  "previous": {
    "outcome": "",
    "tasks": [],
    "handled": [],
    "krs": [],
    "khandled": [],
    "mobilize": {
      "leadAligned": false,
      "briefReady": false,
      "firstActions": false,
      "dependencies": false,
      "firstCheckpoint": false,
      "leadAccepted": false,
      "notes": ""
    }
  },
  "plan": {
    "outcome": "Vendor-managed connectivity across agreed event areas for 23–24 January 2027, demonstrated against confirmed load and agreed acceptance criteria, with tested recovery and continuous support. Confirmed baseline: 2,500 participants and 8,000–12,000 concurrent devices. Vendor owns recommendation, assessment, implementation, testing, recovery, monitoring, support and secure handover; Intellibus approves scope and acceptance criteria. Bandwidth remains unresolved.",
    "tasks": [
      {
        "id": "tmuufemlw0z6",
        "title": "Hold the vendor kickoff on 5 October, 1–2 PM Jamaica time.",
        "owner": "Alex / Daniel; vendor lead to confirm",
        "due": "2026-10-05",
        "dep": "",
        "done": false
      },
      {
        "id": "tmuufenoatxr",
        "title": "Use 2,500 participants and 8,000–12,000 concurrent devices; confirm floor plan and service hours.",
        "owner": "Intellibus / venue / programme leads",
        "due": "",
        "dep": "tmuufemlw0z6",
        "done": false
      },
      {
        "id": "tmuufeoqab2l",
        "title": "Ask the vendor to assess Halls A and B, meeting rooms and grand ballroom.",
        "owner": "Vendor / venue",
        "due": "",
        "dep": "tmuufemlw0z6",
        "done": false
      },
      {
        "id": "tmuufepesfv7",
        "title": "Ask the vendor to support build tools, cloud AI, collaboration and judging.",
        "owner": "Vendor; Intellibus confirms applications",
        "due": "",
        "dep": "tmuufeoqab2l",
        "done": false
      },
      {
        "id": "tmuuff0aza1t",
        "title": "Confirm seven production connections, including two cameras, before sizing.",
        "owner": "Production / vendor",
        "due": "",
        "dep": "tmuufemlw0z6",
        "done": false
      },
      {
        "id": "tmuuff1lqhr5",
        "title": "Request a justified complete solution and itemized quote from the vendor.",
        "owner": "Vendor",
        "due": "",
        "dep": "tmuuff0aza1t",
        "done": false
      },
      {
        "id": "tmuuff2rkr85",
        "title": "Ask the vendor to propose Internet, equipment and power resilience.",
        "owner": "Vendor / venue power lead",
        "due": "",
        "dep": "tmuuff0aza1t",
        "done": false
      },
      {
        "id": "tmuuff3xibqn",
        "title": "Review proposal, costs, responsibilities and acceptance criteria before deployment.",
        "owner": "Intellibus approver to confirm / vendor",
        "due": "",
        "dep": "tmuuff1lqhr5",
        "done": false
      },
      {
        "id": "tmuuff5i19fu",
        "title": "Ask the vendor to own installation, configuration, safe cabling and monitoring.",
        "owner": "Vendor / venue",
        "due": "",
        "dep": "tmuuff3xibqn",
        "done": false
      },
      {
        "id": "tmuuff6bczfv",
        "title": "Test installed coverage, concurrent load, application access and production together.",
        "owner": "Vendor; Intellibus witnesses",
        "due": "",
        "dep": "tmuuff5i19fu",
        "done": false
      },
      {
        "id": "tmuuff7h0yeu",
        "title": "Resolve issues or record accepted exceptions and hand over the managed service.",
        "owner": "Vendor / Intellibus",
        "due": "",
        "dep": "tmuuff6bczfv",
        "done": false
      },
      {
        "id": "tmuuff8n55jh",
        "title": "Provide continuous support through competition, overnight periods and judging.",
        "owner": "Vendor",
        "due": "2027-01-23",
        "dep": "tmuuff7h0yeu",
        "done": false
      }
    ],
    "handled": [
      "Requirements - Confirm device count, expected concurrent connections, traffic profile and critical systems.",
      "Venue audit - Survey available circuits, ISP handoff, cabling routes, mounting and interference conditions.",
      "Architecture - Design primary wired/wireless topology and segmentation for participants, staff and infrastructure.",
      "Capacity - Size internet bandwidth, access points, controllers, switches and DHCP for peak load.",
      "Security - Define authentication, isolation, firewall and rogue-device controls.",
      "Failover - Design an independent backup path that does not share the primary single point of failure.",
      "Critical backup - Define which functions retain connectivity if participant internet degrades.",
      "Equipment - Decide owned versus rented network equipment and responsibility for configuration.",
      "Spares - Hold critical AP, switch, cabling, power and controller spares onsite.",
      "Monitoring - Build live dashboards and alert thresholds for bandwidth, packet loss, AP load and gateway health.",
      "Support - Define NOC/onsite roles, escalation and vendor support contacts.",
      "Load test - Simulate event-scale connections and traffic before event week.",
      "Failover test - Force the primary path down and prove critical recovery.",
      "Venue test - Repeat validation after final physical install.",
      "Runbook - Publish startup, monitoring, incident and recovery procedures.",
      "Close - Capture logs and retain evidence for post-event review.",
      "Kickoff - Hold the vendor kickoff on 5 October, 1–2 PM Jamaica time. Outcome: agreed assessment scope, proposal inputs, named vendor delivery lead and next dates. Source invitation: Hackathon 2027 (Kick Off Session); organiser David Hamilton / Liberty Caribbean; created by Camile Gayle. RSVP not verified.",
      "Baseline - Use 2,500 participants and 8,000–12,000 concurrent devices; confirm floor plan and service hours. Outcome: one agreed sizing baseline. Alex confirmed 2,500 participants and 8,000–12,000 concurrent devices on 4 October 2026. Use these counts for vendor assessment and justified sizing. Confirm setup, rehearsal, overnight competition, judging and each wave’s planned 24-hour window. Starts after Step 1; final sizing depends on Intellibus confirmation.",
      "Site assessment - Ask the vendor to assess Halls A and B, meeting rooms and grand ballroom. Outcome: documented coverage, venue Wi-Fi coordination, available circuits, handoff, cabling, mounting, interference and power constraints. Starts after Step 1; coordinates with floor-plan and venue workstreams.",
      "Applications - Ask the vendor to support build tools, cloud AI, collaboration and judging. Outcome: Docker, npm, Python, AI model downloads, source control and judging work under agreed load. Vendor proposes secure access for participants, judges, VIPs, staff and IT administrators and protects essential traffic. Starts after Steps 2–3.",
      "Production - Confirm seven production connections, including two cameras, before sizing. Outcome: endpoint locations, service type and upload/download requirements agreed with production. Clarify the earlier “at least 1,000” note: units, total or per connection. Bandwidth remains unresolved. Starts after Step 1; depends on production inputs.",
      "Proposal - Request a justified complete solution and itemized quote from the vendor. Outcome: capacity assumptions, coverage/design rationale, delivery dates, support commitments, warranty, exclusions, dependencies and alternatives for unmet requirements. Vendor owns suitability and delivery of its recommendation. Starts after Steps 2–5; no AP model, SSID, VLAN or internal architecture prescribed.",
      "Resilience - Ask the vendor to propose Internet, equipment and power resilience. Outcome: backup capacity, remaining failure risks, recovery times, manual steps and session impact documented; essential services and recovery limits agreed. Starts after Steps 2–5; feeds Step 6.",
      "Approval - Review proposal, costs, responsibilities and acceptance criteria before deployment. Outcome: approved scope or documented changes; measurable coverage, concurrent load, application access, throughput, latency, packet loss, power runtime and recovery criteria. No bandwidth, budget or SLA numbers approved yet. Starts after Steps 6–7; requires authorised Intellibus decision.",
      "Delivery - Ask the vendor to own installation, configuration, safe cabling and monitoring. Outcome: delivery schedule, power plan, spares, on-site coverage, escalation contacts and venue/provider responsibilities agreed. Starts after Step 8; depends on venue access, approved floor plan and power readiness.",
      "Testing - Test installed coverage, concurrent load, application access and production together. Outcome: evidence against agreed criteria; demonstrate failure and restoration under load, including power/runtime and session impact. Starts after Step 9; testing date must leave time to resolve issues before event operations.",
      "Handover - Resolve issues or record accepted exceptions and hand over the managed service. Outcome: test results, as-built records, secure configuration handover, monitoring and recovery runbook, named vendor lead and support roster available before opening. Starts after Step 10; Intellibus accepts readiness.",
      "Event support - Provide continuous support through competition, overnight periods and judging. Outcome: monitored service, incident escalation and recovery throughout the agreed window; retain logs and close-out evidence. Event is 23–24 January 2027; exact setup, rehearsal and operating hours remain to confirm. Starts after Step 11."
    ],
    "krs": [
      {
        "id": "k87jjmdh",
        "title": "Coverage and concurrent load meet agreed baseline — criteria agreed before deployment; vendor supplies test evidence.",
        "target": "",
        "evidence": "Test or rehearsal report"
      },
      {
        "id": "kes44z9y",
        "title": "Build tools, cloud AI, judging and production pass combined testing — criteria agreed before deployment; vendor supplies test evidence.",
        "target": "",
        "evidence": "Test or rehearsal report"
      },
      {
        "id": "k9ql4oed",
        "title": "Throughput, latency and packet loss meet agreed criteria — criteria agreed before deployment; vendor supplies test evidence.",
        "target": "",
        "evidence": "Test or rehearsal report"
      },
      {
        "id": "kgn43mh7",
        "title": "Power runtime, failure recovery and restoration demonstrated — criteria agreed before deployment; vendor supplies test evidence.",
        "target": "",
        "evidence": "Test or rehearsal report"
      },
      {
        "id": "k9ljfo7k",
        "title": "Monitoring, as-built records, secure handover and support coverage accepted — criteria agreed before deployment; vendor supplies test evidence.",
        "target": "",
        "evidence": "Test or rehearsal report"
      }
    ],
    "khandled": [
      "The primary network sustains [X] Mbps with no drops over 60 minutes at [N] concurrent devices.",
      "The failover link, on a separate provider, activates within [X] minutes of a forced primary outage.",
      "Spares (routers, APs, cables, power) are on site, labelled and swap-tested.",
      "Monitoring alerts [owner] within [X] minutes of degradation.",
      "Critical functions (registration, judging, streaming) keep running on backup during the outage test.",
      "Results signed off by [owner] and logged.",
      "Coverage and concurrent load meet agreed baseline — criteria agreed before deployment; vendor supplies test evidence.",
      "Build tools, cloud AI, judging and production pass combined testing — criteria agreed before deployment; vendor supplies test evidence.",
      "Throughput, latency and packet loss meet agreed criteria — criteria agreed before deployment; vendor supplies test evidence.",
      "Power runtime, failure recovery and restoration demonstrated — criteria agreed before deployment; vendor supplies test evidence.",
      "Monitoring, as-built records, secure handover and support coverage accepted — criteria agreed before deployment; vendor supplies test evidence."
    ],
    "mobilize": {
      "leadAligned": false,
      "briefReady": false,
      "firstActions": false,
      "dependencies": false,
      "firstCheckpoint": false,
      "leadAccepted": false,
      "notes": "Confirmed planning baseline: 2,500 participants and 8,000–12,000 concurrent devices. Event: 23–24 January 2027. Kickoff: 5 October 2026, 1–2 PM Jamaica / 18:00–19:00 UTC; David Hamilton / Liberty Caribbean; RSVP unverified.\n\nStep 01 · Hold the vendor kickoff on 5 October, 1–2 PM Jamaica time.\nOutcome: agreed assessment scope, proposal inputs, named vendor delivery lead and next dates. Source invitation: Hackathon 2027 (Kick Off Session); organiser David Hamilton / Liberty Caribbean; created by Camile Gayle. RSVP not verified.\nResponsibility: Alex / Daniel; vendor lead to confirm\n\nStep 02 · Use 2,500 participants and 8,000–12,000 concurrent devices; confirm floor plan and service hours.\nOutcome: one agreed sizing baseline. Alex confirmed 2,500 participants and 8,000–12,000 concurrent devices on 4 October 2026. Use these counts for vendor assessment and justified sizing. Confirm setup, rehearsal, overnight competition, judging and each wave’s planned 24-hour window. Starts after Step 1; final sizing depends on Intellibus confirmation.\nResponsibility: Intellibus / venue / programme leads\n\nStep 03 · Ask the vendor to assess Halls A and B, meeting rooms and grand ballroom.\nOutcome: documented coverage, venue Wi-Fi coordination, available circuits, handoff, cabling, mounting, interference and power constraints. Starts after Step 1; coordinates with floor-plan and venue workstreams.\nResponsibility: Vendor / venue\n\nStep 04 · Ask the vendor to support build tools, cloud AI, collaboration and judging.\nOutcome: Docker, npm, Python, AI model downloads, source control and judging work under agreed load. Vendor proposes secure access for participants, judges, VIPs, staff and IT administrators and protects essential traffic. Starts after Steps 2–3.\nResponsibility: Vendor; Intellibus confirms applications\n\nStep 05 · Confirm seven production connections, including two cameras, before sizing.\nOutcome: endpoint locations, service type and upload/download requirements agreed with production. Clarify the earlier “at least 1,000” note: units, total or per connection. Bandwidth remains unresolved. Starts after Step 1; depends on production inputs.\nResponsibility: Production / vendor\n\nStep 06 · Request a justified complete solution and itemized quote from the vendor.\nOutcome: capacity assumptions, coverage/design rationale, delivery dates, support commitments, warranty, exclusions, dependencies and alternatives for unmet requirements. Vendor owns suitability and delivery of its recommendation. Starts after Steps 2–5; no AP model, SSID, VLAN or internal architecture prescribed.\nResponsibility: Vendor\n\nStep 07 · Ask the vendor to propose Internet, equipment and power resilience.\nOutcome: backup capacity, remaining failure risks, recovery times, manual steps and session impact documented; essential services and recovery limits agreed. Starts after Steps 2–5; feeds Step 6.\nResponsibility: Vendor / venue power lead\n\nStep 08 · Review proposal, costs, responsibilities and acceptance criteria before deployment.\nOutcome: approved scope or documented changes; measurable coverage, concurrent load, application access, throughput, latency, packet loss, power runtime and recovery criteria. No bandwidth, budget or SLA numbers approved yet. Starts after Steps 6–7; requires authorised Intellibus decision.\nResponsibility: Intellibus approver to confirm / vendor\n\nStep 09 · Ask the vendor to own installation, configuration, safe cabling and monitoring.\nOutcome: delivery schedule, power plan, spares, on-site coverage, escalation contacts and venue/provider responsibilities agreed. Starts after Step 8; depends on venue access, approved floor plan and power readiness.\nResponsibility: Vendor / venue\n\nStep 10 · Test installed coverage, concurrent load, application access and production together.\nOutcome: evidence against agreed criteria; demonstrate failure and restoration under load, including power/runtime and session impact. Starts after Step 9; testing date must leave time to resolve issues before event operations.\nResponsibility: Vendor; Intellibus witnesses\n\nStep 11 · Resolve issues or record accepted exceptions and hand over the managed service.\nOutcome: test results, as-built records, secure configuration handover, monitoring and recovery runbook, named vendor lead and support roster available before opening. Starts after Step 10; Intellibus accepts readiness.\nResponsibility: Vendor / Intellibus\n\nStep 12 · Provide continuous support through competition, overnight periods and judging.\nOutcome: monitored service, incident escalation and recovery throughout the agreed window; retain logs and close-out evidence. Event is 23–24 January 2027; exact setup, rehearsal and operating hours remain to confirm. Starts after Step 11.\nResponsibility: Vendor\n\nMilestones: kickoff 5 Oct; confirmed site/production inputs → proposal and acceptance approval → installation → load/failover test → accepted handover before opening → continuous event support. Remaining dates, bandwidth, production units, budget, service hours and acceptance/recovery thresholds must be agreed.\nSource: https://docs.google.com/document/d/1OAns-TqzduL9PlKC8-l46PPvxKeeguTipeKgztvnsxI/edit"
    }
  }
};
