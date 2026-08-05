# Design QA (evidence-based)

## Evidence reviewed

- Reference: `.tmp/website-master-reference.png` (864 × 1821 px).
- Implementation captures: `.artifacts/project-evidence/website-redesign/desktop-home-1440x1000.png`, `desktop-open-geo-deliverable-1440x1000.png`, and `desktop-contact-context-1440x1000.png` (each 1425 × 990 px), plus `mobile-home-390x844.png` (375 × 812 px).
- Direct side-by-side comparison artifact: `C:\Users\fengc\.codex\visualizations\2026\08\05\019fd02b-1e06-71c0-8ad6-b83346537d1c\website-master-comparison.png`.
- Source of truth: `components/home/EnterpriseHomepage.tsx`, `components/projects/OpenGeoParticipatoryDemo.tsx`, `components/contact/WorkflowInquiryForm.tsx`, `config/open-geo-demo.ts`, and `config/website-projects.ts`.

## Reference vs implementation

The supplied captures and side-by-side comparison cover the public homepage, Open GEO deliverable state, contact context state, and responsive homepage. The implemented visual system matches the documented warm-paper/ivory surface, graphite theatre, amber accent, editorial sections, case/prototype content, and contact calls to action. The archived captures are 1425×990 and 375×812, while the browser QA receipt verified the requested 1440×1000 desktop and 390×844 mobile viewports.

## Browser interaction receipt

Independent browser QA passed at `http://127.0.0.1:3000`:

- Desktop 1440×1000 and mobile 390×844 rendered successfully.
- Open GEO full path passed: project → scenario → explicit start → three manual steps → simulated deliverable → contact context.
- No form submission was performed.
- No console errors were observed; only a Next development P3 warning was reported.
- Mobile had no horizontal overflow.
- Keyboard skip-link and focus behavior passed.

## Simulated-data boundary

Open GEO is explicitly a participatory prototype. The contact context identifies the experience and artifact as simulated data. This QA note does not promote prototype states to production or customer-delivery evidence.

## Final status

**PASS.** Desktop/mobile visual and interaction QA passed with the receipt above. The only reported runtime item is the non-blocking Next development P3 warning; no console errors, submission, deployment, or production-delivery claim is made.
