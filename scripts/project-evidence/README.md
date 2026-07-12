# Project evidence review workflow

This workflow keeps GitHub source material separate from the public website.

1. Create `.private/project-sources.json` locally. Never commit it.
2. List only the repositories, refs, and documents needed for review.
3. Run `npm run projects:evidence:draft` while authenticated with `gh`.
4. Review `.artifacts/project-evidence/*.review.json` against current runtime or validation evidence.
5. Copy only owner-approved, public-safe facts into `config/public-project-cases.json`.
6. Run `npm run projects:evidence:audit`, tests, and typecheck before committing.

Example manifest shape (use non-sensitive placeholders in documentation):

```json
{
  "version": 1,
  "sources": [
    {
      "id": "case-source",
      "repository": "owner/repository",
      "ref": "main",
      "visibility": "private",
      "documents": ["README.md", "docs/PROJECT-STATE.md"]
    }
  ]
}
```

The generated review files deliberately start with an empty
`candidatePublicFacts` object and every review check set to `false`. The script
does not write the public case configuration.
