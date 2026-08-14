# Design QA — contact option 2

## Scope and state

- Route: `http://127.0.0.1:3108/contact`
- State: default contact page, plus the WeChat QR dialog open and closed.
- Visual target: `C:\Users\fengc\.codex\generated_images\01a00036-7813-7aa3-88a8-8d91100a3aa6\exec-029c6725-a2fc-444b-a0e2-89e9b6b24726.png`.
- Implementation captures:
  - `output/playwright/contact-option2-desktop.png`
  - `output/playwright/contact-option2-mobile.png`
  - `output/playwright/contact-option2-qr-modal.png`
- Direct comparison artifact: `output/playwright/contact-option2-comparison.png`.

## Capture and density normalization

- Source pixels: 1586 x 992. It represents a desktop layout at approximately the same CSS width as the requested implementation viewport.
- Desktop browser viewport: 1440 x 1000 CSS px, device scale factor 1.5. The in-app full-page capture is 1424 x 1214 px.
- Mobile browser viewport: 390 x 844 CSS px, device scale factor 1.0. The captured document area is 375 x 812 px after browser chrome and scrollbar allocation.
- QR-dialog capture: 1425 x 990 px.
- For the side-by-side artifact, both full-page images were aspect-fit into equal 760 px wide panels on a 1592 x 720 canvas. This normalizes display density without cropping or stretching either source.
- The in-app desktop full-page capture has a known DPR rasterization defect: content is drawn at the OS scale while the PNG width remains near the CSS width, so the right edge appears clipped. DOM geometry independently measured `scrollWidth === clientWidth` and the form right edge remained within the CSS viewport. The separate QR-dialog capture also shows both desktop columns within the viewport. This is a capture limitation, not implementation overflow.

## Full-view comparison

The direct comparison covers the selected reference and the local browser render in one artifact. The implementation matches the target's central design decision: contact details are removed from the footer and promoted into a dedicated `直接联系` block beside the real inquiry form. It also matches the warm paper surface, graphite type, amber actions, two-column desktop composition, icon-led email/WeChat rows, visible QR affordance, and stacked mobile flow.

The implementation intentionally preserves two production contracts that the concept image simplified:

- The existing global navigation taxonomy and brand subtitle remain unchanged. The request concerned contact placement, not a site-wide information-architecture rewrite.
- The existing workflow form retains its required work-email, frequency, and manual-time fields. Those fields make the real page taller than the concept image, but removing them would change inquiry semantics outside this task.

## Focused comparison and interaction evidence

No additional static crop was needed because the full-view artifact resolves the contact-block typography, alignment, spacing, borders, color tokens, and QR thumbnail at readable scale. The focused interactive state is captured separately in `output/playwright/contact-option2-qr-modal.png`; it verifies that the existing personal WeChat image is used at full resolution in the dialog rather than a generated placeholder.

## Browser receipt

- Desktop 1440 x 1000 and mobile 390 x 844 loaded successfully in the Codex in-app browser.
- Email link resolves to `mailto:itheheda@gmail.com`.
- WeChat label `404` and `查看二维码` are visible.
- QR dialog opens; both Escape and the close button dismiss it.
- Footer contains no raw email address.
- Desktop and mobile DOM measurements show no horizontal overflow.
- Console warnings and errors: none.
- The inquiry form was not filled or submitted.

## Findings and comparison history

### Iteration 1

- Potential P1: desktop PNG appeared to truncate the form. Resolution: browser DOM measurements showed no overflow, and the independent desktop dialog capture showed both columns. Root cause is the in-app DPR capture mismatch; no product fix was warranted.
- Potential P2: page height exceeds the concept and footer falls below the first desktop viewport. Resolution: the delta is caused by preserving three required production form fields omitted from the concept. This is an intentional functional constraint, not actionable visual drift for the contact-placement scope.
- Potential P2: header navigation differs from the concept. Resolution: the implementation correctly preserves the site's existing global navigation; changing it would expand the task into site-wide information architecture.
- P3: the existing desktop brand subtitle makes the header slightly denser than the concept. Left unchanged because it is a global brand element outside this contact-placement task.

Post-review evidence: desktop/mobile browser captures, QR-dialog capture, DOM width measurements, and the normalized direct comparison above. No actionable P0, P1, or P2 findings remain.

## Final result

final result: passed
