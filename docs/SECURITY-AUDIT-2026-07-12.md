# Adversarial Implementation Audit — 2026-07-12

Scope: public Next.js routes, contact intake, admin boundary, retired photography surface, public evidence data and production dependencies.

This is a source/test/build adversarial pass, not a completed multi-worker Codex Security Deep Scan. Browser-runtime validation remains separate.

## Fixed findings

1. **Social visitors bypassed the new homepage.** The proxy redirected common social referrers and campaign parameters to the retired `/links` page. The root matcher and redirect logic were removed; campaign traffic now sees the enterprise homepage.
2. **Admin enablement was platform-specific.** The old guard only forced admin off on Vercel, while production runs on Cloudflare. The guard now fails closed for every `NODE_ENV=production` deployment.
3. **Retired photography attack surface remained live.** Photo PIN/session issuance, signed photo delivery, photography admin API and photography admin page still built after the public gallery was removed. These routes and their route-specific tests were deleted; raw private media was not touched.
4. **Contact endpoint abuse controls were incomplete.** The new endpoint now enforces a 12 KB body cap, same-origin browser submissions, a honeypot, per-source frequency limiting, strict field lengths/enums, HTML escaping and CR/LF removal from the email subject.
5. **Missing clickjacking/process-isolation headers.** Global responses now set `X-Frame-Options: SAMEORIGIN` and `Cross-Origin-Opener-Policy: same-origin`; SAMEORIGIN preserves the reviewed same-origin case iframe.
6. **Public case leakage risk.** Public case schema and evidence audit reject private source identifiers and secret-shaped strings. Only the owner-approved Freight Lead Agent case is published; local review artifacts remain ignored.

## Remaining risks and operational requirements

- `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, and `CONTACT_FROM_EMAIL` are absent locally. The build is valid, but production contact delivery will return 503 until all three secrets are configured and a real submission is verified.
- The in-process contact limiter is defense-in-depth, not a distributed global limit. Configure Cloudflare rate limiting/Turnstile before sustained paid traffic or public campaigns.
- `npm audit --omit=dev` reports three moderate advisories: Next's bundled PostCSS advisory and `gray-matter`'s transitive `js-yaml`. There are no high or critical production advisories. The suggested Next downgrade is unsafe; track an upstream stable fix or remove the legacy Markdown dependency path.
- Admin still contains legacy local-only editors for older config models. It is unreachable in production, but it should eventually be rebuilt around the reviewed identity, method, case and contact models or removed entirely.
- A strict nonce-based Content Security Policy is not yet implemented because the current layout contains inline bootstrap scripts and same-origin case iframes. Add CSP as a dedicated migration with browser validation.
- Browser visual/interaction QA could not run because both configured browser-control runtimes failed to initialize on this workstation. No screenshot or console evidence was produced.

## Verified commands

- `npm run typecheck`
- `npm run lint` — 0 errors, 27 existing warnings
- `npm run audit:architecture`
- `npm run projects:evidence:audit`
- `npm test` — 93 files, 856 tests
- `npm run build` — 45 generated pages/routes
