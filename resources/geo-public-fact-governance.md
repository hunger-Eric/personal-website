# GEO Public Fact Governance

Canonical URLs help search systems choose a representative URL among duplicate or very similar pages. They cannot decide which of a company's conflicting service claims is true.

This short guide is adapted from the maintained SolveReal Systems articles.

- [Read the Chinese article](https://me.itheheda.online/articles/geo-public-fact-governance-website-consistency)
- [Read the English article](https://me.itheheda.online/en/articles/geo-public-fact-governance-website-consistency)

## The problem

A company may update its service page while leaving an older claim on the homepage, in an FAQ, inside structured data, or on a translated page. All of those surfaces can remain discoverable. Improving crawlability or adding links can expose the disagreement to more readers and systems.

Consider a hypothetical service that adds support for scanned documents. The approved condition says scans go through optical character recognition and material results receive human review. The current service page includes those conditions. The homepage still promises full automation, the English page says scans are unsupported, and an older article describes the feature as planned.

URL canonicalization cannot resolve that conflict. The pages contain materially different claims.

## Maintain one public fact record

Start with facts that can change a buying or delivery decision. Each record should make the claim reviewable.

| Field | Review question |
| --- | --- |
| Fact ID and approved wording | Which claim is current, including its conditions? |
| Owner | Who can confirm that the claim remains accurate? |
| Public evidence URL | Where can an external reader verify it? |
| Scope | Which region, version, input, or customer situation qualifies? |
| Status | Is the capability live, planned, experimental, or retired? |
| Effective and review dates | When did it take effect, and when should it be checked again? |
| Dependencies | Which pages, FAQs, feeds, downloads, and structured data reuse it? |
| Language status | Do local versions preserve the same factual scope? |

[W3C PROV-O](https://www.w3.org/TR/prov-o/) models provenance through entities, activities, and responsible agents. A website team does not need to adopt the full ontology. The useful discipline is simpler. Record the public claim, record the change, and name the role that approved it.

## Release a fact change across every surface

When a material fact changes, review more than the visible paragraph.

1. Obtain approval from the fact owner.
2. Find every dependent page and language version.
3. Update visible copy, FAQs, structured data, feeds, and downloadable material.
4. Use publication and modification dates that correspond to substantive changes.
5. Keep a release record with the approver, changed URLs, languages, and deferred items.
6. Notify supported discovery services after publication, while keeping the receipt separate from evidence of indexing or citation.

Google's [structured data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies) say markup should represent visible content and remain current. Its [publication date guidance](https://developers.google.com/search/docs/appearance/publication-dates) recommends consistent visible and structured dates. The [IndexNow FAQ](https://www.indexnow.org/faq) covers added, updated, and deleted URLs, but a submission does not guarantee crawling, indexing, display, or citation.

## Prioritize the conflicts that change decisions

Service eligibility, supported inputs, pricing, delivery time, human review, privacy conditions, and product status usually deserve attention before harmless stylistic differences. Traffic is useful context, but it cannot be the only priority signal. A low-traffic page may still be linked in a proposal or surfaced as a direct answer.

Bilingual sites should connect each local page to the same fact ID. Natural wording can differ while service scope and limitations remain equivalent. Reciprocal `hreflang` annotations help describe relationships between localized pages. They do not synchronize the claims inside those pages.

## Boundaries

Public fact governance can make a company's own pages clearer and easier to review. It does not guarantee rankings, citations, traffic, or commercial results. External systems can still use older caches and third-party sources.

[Open GEO Console](https://me.itheheda.online/en/projects/open-geo-console) can organize public-page access, wording, question coverage, and citation-evidence gaps into page-level priorities. Business owners still decide which claim is true and approve what becomes public.

This guide was drafted with AI assistance and reviewed against primary sources by SolveReal Systems.
